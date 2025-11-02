import { Application, Logger } from 'pinus';
import TokenService = require('../../../services/hall/tokenService');
import langsrv = require('../../../services/common/langsrv');
import {signature} from '../../../utils/index';
import loadBalance = require('../lib/services/loadBalance');
import { getLogger } from 'pinus-logger';
import RoleEnum = require('../../../common/constant/player/RoleEnum');
import * as ThirdApiAuthTokenDao from "../../../common/dao/redis/ThirdApiAuthTokenDao";
import GatePlayerService from '../lib/services/GatePlayerService';
import PlayerMng from "../../../common/dao/daoManager/Player.manager";
import RobotManagerDao from "../../../common/dao/daoManager/Robot.manager";
import SystemConfigManagerDao from "../../../common/dao/daoManager/SystemConfig.manager";
import { RobotInRedis } from '../../../common/dao/redis/entity/Robot.entity';
import AutchCodeRedisDao from "../../../common/dao/redis/AuthCode.redis.dao";
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import MailService = require('../../../services/MailService');
import {CELLPHONE_TYPE} from "../../../consts/hallConst";
import GameRecordDateTableMysqlDao from "../../../common/dao/mysql/GameRecordDateTable.mysql.dao";
import * as moment from "moment";
export default function (app: Application) {
    return new MainHandler(app);
}

export class MainHandler {

    preLoggerStr: string = `网关服务器 ${this.app.getServerId()} |`;

    logger: Logger;

    constructor(private app: Application) {

        this.logger = getLogger('server_out', __filename);
    }



    /**
     * 手机号码注册：
     * @param: {authCode, cellPhone, passWord , rom_type, channelCode, shareUid}，验证码、手机号码、密码
     * @route: gate.mainHandler.cellPhoneGuest
     */
    cellPhoneGuest = async function ({  authCode, cellPhone, passWord, rom_type, channelCode, shareUid }) {
        let language = null;
        try {
            this.logger.warn("手机号码注册:", authCode, cellPhone, passWord, channelCode, rom_type, shareUid)
            if (!cellPhone) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1) }
            }
            if (passWord < 6) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_19) }
            }

            // @ts-ignore
            const playerCellPhone: Player = await PlayerManagerDao.findOne({ cellPhone }, true);
            // 号码已经被绑定过
            if (playerCellPhone && playerCellPhone.cellPhone) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_13) }
            }
            let systemConfig = await SystemConfigManagerDao.findOne({});
            let player = await GatePlayerService.checkPlayerExits(null, systemConfig.defaultChannelCode, channelCode, shareUid, rom_type);

            const autchRecord = await AutchCodeRedisDao.findOne({ phone: cellPhone });
            // 验证码已过期
            if (!autchRecord) {
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_18) }
            }

            // 获取验证码的手机号不匹配
            if (autchRecord.phone !== cellPhone) {
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_17) }
            }

            // 检查验证码
            if(autchRecord.auth_code != authCode ){
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2) }
            }

            passWord = signature(passWord, false, false);

            //删除使用过的验证码
            await AutchCodeRedisDao.delete({ phone: cellPhone });

            if (systemConfig.cellPhoneGold > 0) {
                let gold = Math.floor(player.gold + systemConfig.cellPhoneGold);
                //更新玩家信息

                let withdrawalChips = Math.floor(systemConfig.cellPhoneGold * 10);

                await PlayerManagerDao.updateOne({ uid: player.uid }, { passWord: passWord, cellPhone: cellPhone, gold: gold, withdrawalChips });
                // 给玩家发送邮件 id_1019
                MailService.generatorMail({
                    name: langsrv.getlanguage(player.language, langsrv.Net_Message.id_74),
                    sender: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1019),
                    content: langsrv.getlanguage(player.language, langsrv.Net_Message.id_75, Math.floor(systemConfig.cellPhoneGold / 100)),
                    type: 0,
                }, player.uid);
                //添加救济金领取记录
                const gameInfo = {
                    uid: player.uid,				// 玩家 uid
                    nid: CELLPHONE_TYPE.ADD_NID,				// 游戏ID
                    gameName: CELLPHONE_TYPE.ADD_NAME,    			// 游戏名称
                    groupRemark: player.groupRemark,
                    thirdUid: player.thirdUid ? player.group_id : null,
                    group_id: player.group_id ? player.group_id : null,
                    sceneId: -1,
                    roomId: '-1',
                    input: 0,    			// 押注金额
                    bet_commission: 0,		// 押注抽水
                    win_commission: 0,		// 赢取抽水
                    settle_commission: 0,	// 结算抽水
                    profit: systemConfig.cellPhoneGold,     		// 利润
                    gold: player.gold,				// 当前金币
                    status: 1,			// 记录状态
                    gameOrder: Date.now() + player.uid,			// 订单编号
                };
                // 异步执行
                GameRecordDateTableMysqlDao.insertOne(gameInfo);
            } else {
                await PlayerManagerDao.updateOne({ uid: player.uid }, { passWord: passWord, cellPhone: cellPhone });
            }
            return { code: 200, uid : player.uid, guestid: player.guestid, cellPhone, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_65) }
        } catch (errorOrCode) {
            this.logger.warn(`hall.userHandler.bindCellPhone`, errorOrCode);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_95) }
        }
    };




    /**
     * 用户切换帐号，手机号码登录
     * @param: {cellPhone, passWord}
     * @route: gate.mainHandler.changeLogin
     */
    async changeLogin(msg: { cellPhone: string, passWord: string }) {
        if (!msg.cellPhone) {
            return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_1) }
        }

        if (!msg.passWord) {
            return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_240) }
        }

        try {
            /// @ts-ignore
            const player = await PlayerMng.findOne({ cellPhone: msg.cellPhone });
            if (!player) {
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_91) }
            }
            let pass = signature(msg.passWord, false, false)
            if (player.passWord !== pass) {
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_237) }
            }
            return { code: 200, id: player.guestid }
        } catch (error) {
            console.log(`gate.handler.changeLogn ==>${error}`);
            this.logger.error('gate.handler.changeLogn ==>', error);
            return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_237) }
        }
    };


    /** ========================================================================================================================= */

    /**
     * 游客访问
     * @param {object} rom_type 设备信息
     * gate.mainHandler.guest
     */
    async guest({  rom_type, channelCode , shareUid }) {
        let language = null;
        try {
            const systemConfig = await SystemConfigManagerDao.findOne({ id: 1 });
            if (systemConfig && !systemConfig.isOpenH5) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_90) }
            }

            /**
             * 判断是否存在参数platformName平台名称，绑定代理关系，根据代理的语言设置玩家的语言
             */
            const player = await GatePlayerService.checkPlayerExits(null, systemConfig.defaultChannelCode , channelCode, shareUid , rom_type );

            if (!player) {
                this.logger.warn(`${this.preLoggerStr} 玩家登录 | 异常:没有玩家信息`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_90) }
            }

            language = player.language;

            // 分发连接器地址
            const connectorServer = await loadBalance.dispatchConnectorByStatistics(player.uid);

            if (!connectorServer) {
                this.logger.warn(`${this.preLoggerStr} 玩家登录 | 异常: 没有分配连接器地址`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_89) };
            }

            // 生成token
            const token = TokenService.create(player.uid);
            return {
                code: 200,
                id: player.guestid, //游客ID
                uid : player.uid,
                token,
                cellPhone : player.cellPhone,
                server: connectorServer,
            };
        } catch (e) {
            this.logger.error(`${this.preLoggerStr} 游客登录 | 出错 :${e.stack}`);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_90) };
        }
    }

    /**
     * 玩家登录
     * @param {object}
     * @route gate.mainHandler.login
     */
    async login({ id: guestid, rom_type, channelCode, shareUid }) {
        this.logger.warn(`玩家登录_step1 |${guestid},time : ${ moment().format("YYYY-MM-DD- HH:mm:ss")}`);
        let language = null;
        try {
            const systemConfig = await SystemConfigManagerDao.findOne({ id: 1 });
            if (systemConfig && !systemConfig.isOpenH5) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_90) }
            }

            const player = await GatePlayerService.checkPlayerExits(guestid, systemConfig.defaultChannelCode , channelCode, shareUid ,rom_type);
            if (!player) {
                this.logger.warn(`${this.preLoggerStr} 玩家登录 | 异常:没有玩家信息|${guestid}`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_90) }
            }
            language = player.language;
            const {
                uid,
                isRobot,
                closeTime,
                cellPhone,
            } = player;

            if (isRobot === RoleEnum.RoleEnum.REAL_PLAYER && closeTime && closeTime > new Date()) {
                this.logger.warn(`${this.preLoggerStr} 玩家登录 | uid: ${uid} | 异常: 账号冻结`);
                return {
                    code: 500,
                    error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_56, '')
                };
            }
            // 分发连接器地址
            const connectorServer = await loadBalance.dispatchConnectorByStatistics(uid);

            if (!connectorServer) {
                this.logger.warn(`${this.preLoggerStr} 玩家登录 | 异常: 没有分配连接器地址`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_89) };
            }
            // 生成token
            const token = TokenService.create(player.uid);
            //    connectorServer.host = "66.42.77.64"

            //判断后台是否设置了语言，如果设置了语言就要把玩家语言改一下。
            if(systemConfig && systemConfig.languageForWeb){
                if(systemConfig.languageForWeb != player.language){
                    player.language == systemConfig.languageForWeb
                    await PlayerMng.updateOne({ uid: player.uid }, { language: systemConfig.languageForWeb });
                }
            }
            return {
                code: 200,
                id: player.guestid, //游客ID
                uid,
                token,
                cellPhone,
                server: connectorServer,
            };
        } catch (e) {
            this.logger.error(`${this.preLoggerStr} 玩家登录 | 出错 :${e.stack}`);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_90) };
        }
    }


    /**
     * 机器人登录---机器人
     * @param {object}
     */
    async loginForRobot({ id: guestid }) {
        try {
            ///@ts-ignore
            const robot: RobotInRedis = await RobotManagerDao.findOne({ guestid });
            if (!robot) {
                this.logger.warn(`${this.preLoggerStr} 机器人登录 | 异常:没有玩家信息|${guestid}`);
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_90) }
            }

            const {
                uid,
            } = robot;

            // 分发连接器地址
            const connectorServer = await loadBalance.dispatchConnectorByStatistics(uid, 'connector', true);

            if (!connectorServer) {
                this.logger.warn(`${this.preLoggerStr} 机器人登录 | 异常: 没有分配连接器地址`);
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_89) };
            }

            // 生成token
            const token = TokenService.create(uid);

            return {
                code: 200,
                id: guestid, //游客ID
                uid,
                token,
                server: connectorServer,
            };
        } catch (e) {
            this.logger.error(`${this.preLoggerStr} 机器人登录 | 出错 :${e.stack}`);
            return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_90) };
        }
    }


    /**
     * 第三方平台登陆
     * gate.mainHandler.thirdLogin {token}
     */
    async thirdLogin({ token }) {
        try {
            console.warn(token)
            /** 检验参数 */
            if (!token) {
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_2) };
            }
            const thirdApi = await ThirdApiAuthTokenDao.findOne(token);

            if (!thirdApi) {
                this.logger.warn(`${this.preLoggerStr}登录大厅异常: | token:${token} | auth token非法 `);
                // return new ApiResult(connectorEnum.AUTH_TOKEN_FAIL, [], "token非法");
                await ThirdApiAuthTokenDao.deleteOne(token);
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_56) };
            }

            let language = thirdApi.language;

            if (!thirdApi.nid) {
                await ThirdApiAuthTokenDao.deleteOne(token);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_56) };
            }

            if (!thirdApi.uid) {
                await ThirdApiAuthTokenDao.deleteOne(token);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_56) };
            }
            await ThirdApiAuthTokenDao.deleteOne(token);

            /// @ts-ignore
            const player = await PlayerMng.findOne({ uid: thirdApi.uid });

            if (!player) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_56) };
            }

            // 封了玩家不能进入游戏
            if (player.closeTime && player.closeTime > new Date()) {
                return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_56, '') };
            }

            // 分发连接器地址
            const connectorServer = await loadBalance.dispatchConnectorByStatistics(player.uid);

            if (!connectorServer) {
                this.logger.warn(`${this.preLoggerStr} 玩家登录 | 异常: 没有分配连接器地址`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_89) };
            }

            // 生成token
            const t = TokenService.create(player.uid);

            return {
                code: 200,
                id: player.guestid, //游客ID
                uid: player.uid,
                token: t,
                cellPhone: player.cellPhone,
                server: connectorServer,
                KindID: thirdApi.nid,
                loginHall: thirdApi.loginHall,
                backHall: thirdApi.backHall,
                language: thirdApi.language,
                backButton: thirdApi.backButton,
                hotGameButton: thirdApi.hotGameButton,
            };
        } catch (e) {
            this.logger.error(`${this.preLoggerStr} 第三方平台 | 玩家登录 | 出错 :${e.stack}`);
            return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_2) };
        }
    }

}