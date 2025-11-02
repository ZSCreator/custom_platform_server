import {getLogger, Application} from 'pinus';
import SystemConfigManagerDao from "../../../../common/dao/daoManager/SystemConfig.manager";
import GatePlayerService from "../../../gate/lib/services/GatePlayerService";
import languageService = require('../../../../services/common/langsrv');
import TokenService = require('../../../../services/hall/tokenService');
import loadBalance = require('../utils/balance');
import * as ThirdApiAuthTokenDao from "../../../../common/dao/redis/ThirdApiAuthTokenDao";
import PlayerMng from "../../../../common/dao/daoManager/Player.manager";
import * as moment from "moment";
import {RoleEnum} from "../../../../common/constant/player/RoleEnum";
import {signature} from "../../../../utils";
import PlayerManagerDao from "../../../../common/dao/daoManager/Player.manager";
import AutchCodeRedisDao from "../../../../common/dao/redis/AuthCode.redis.dao";
import {CELLPHONE_TYPE} from "../../../../consts/hallConst";
import GameRecordDateTableMysqlDao from "../../../../common/dao/mysql/GameRecordDateTable.mysql.dao";
import {generatorMail} from "../../../../services/MailService";
import {getClientIp}  from "../../../../utils/index";
const logger = getLogger('server_out', __filename);
const preLoggerStr = `网关服务器 |`


export default function (app: Application, http) {
    /**
     * 游客登录
     */
    http.post('/guest', async function (req, res) {
        let romType = req.body.romType || null;
        let channelCode = req.body.channelCode || null;
        let shareUid = req.body.shareUid || null;
        let language = null;
        const ip: string = getClientIp(req);
        console.warn(`游客登录:${ip}`)
        try {
            const systemConfig = await SystemConfigManagerDao.findOne({id: 1});
            if (systemConfig && !systemConfig.isOpenH5) {
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_90)
                });
            }

            /**
             * 判断是否存在参数platformName平台名称，绑定代理关系，根据代理的语言设置玩家的语言
             */
            const player = await GatePlayerService.checkPlayerExits(null, systemConfig.defaultChannelCode, channelCode, shareUid, romType);

            if (!player) {
                logger.warn(`${preLoggerStr} 玩家登录 | 异常:没有玩家信息`);
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_90)
                });
            }

            language = player.language;

            // 分发连接器地址
            const connectorServer = await loadBalance.dispatchConnectorByStatistics(player.uid);

            if (!connectorServer) {
                logger.warn(`${preLoggerStr} 玩家登录 | 异常: 没有分配连接器地址`);
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_89)
                });
            }

            // 生成token
            const token = TokenService.create(player.uid);


            //更新玩家IP
            await PlayerMng.updateOne({uid : player.uid},{ip : ip});

            return res.json({
                code: 200,
                id: player.guestid, //游客ID
                uid: player.uid,
                token,
                cellPhone: player.cellPhone,
                server: connectorServer,
            });
        } catch (e) {
            logger.error(`${preLoggerStr} 游客登录 | 出错 :${e.stack}`);
            res.json({code: 500, msg: "请求数据错误"});
        }
    });

    /**
     * 第三方登录
     */
    http.post('/thirdLogin', async function (req, res) {

        let token = req.body.token || null;

        const ip: string = getClientIp(req);

        console.warn(`第三方登陆token:${token} , ip : ${ip}`);

        try {
            //检测是否是黑IP




            /** 检验参数 */
            if (!token) {
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(null, languageService.Net_Message.id_2)
                });
            }
            const thirdApi = await ThirdApiAuthTokenDao.findOne(token);

            if (!thirdApi) {
                logger.warn(`${preLoggerStr}登录大厅异常: | token:${token} | auth token非法 `);
                // return new ApiResult(connectorEnum.AUTH_TOKEN_FAIL, [], "token非法");
                await ThirdApiAuthTokenDao.deleteOne(token);
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(null, languageService.Net_Message.id_56)
                });
            }

            let language = thirdApi.language;

            if (!thirdApi.nid) {
                await ThirdApiAuthTokenDao.deleteOne(token);
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_56)
                });
            }

            if (!thirdApi.uid) {
                await ThirdApiAuthTokenDao.deleteOne(token);
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_56)
                });
            }
            await ThirdApiAuthTokenDao.deleteOne(token);

            /// @ts-ignore
            const player = await PlayerMng.findOne({uid: thirdApi.uid});

            if (!player) {
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_56)
                });
            }

            // 封了玩家不能进入游戏
            if (player.closeTime && player.closeTime > new Date()) {
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(player.language, languageService.Net_Message.id_56, '')
                });
            }

            // 分发连接器地址
            const connectorServer = await loadBalance.dispatchConnectorByStatistics(player.uid);

            if (!connectorServer) {
                logger.warn(`${preLoggerStr} 玩家登录 | 异常: 没有分配连接器地址`);
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_89)
                });
            }

            // 生成token
            const t = TokenService.create(player.uid);

            //更新玩家IP
            await PlayerMng.updateOne({uid : player.uid},{ip : ip});

            return res.json({
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
            });
        } catch (e) {
            logger.error(`${preLoggerStr} 第三方平台 | 玩家登录 | 出错 :${e.stack}`);
            return res.json({code: 500, error: languageService.getlanguage(null, languageService.Net_Message.id_2)});
        }
    });

    /**
     * 普通登录
     */
    http.post('/login', async function (req, res) {
        const guestId = req.body.id;
        const romType = req.body.romType;
        const channelCode = req.body.channelCode;
        const shareUid = req.body.shareUid;
        const ip: string = getClientIp(req);
        
        logger.warn(`玩家登录_step1 |${guestId},time : ${moment().format("YYYY-MM-DD- HH:mm:ss")} , ip : ${ip}`);
        let language = null;
        try {
            const systemConfig = await SystemConfigManagerDao.findOne({id: 1});
            if (systemConfig && !systemConfig.isOpenH5) {
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_90)
                })
            }

            const player = await GatePlayerService.checkPlayerExits(guestId, systemConfig.defaultChannelCode, channelCode, shareUid, romType);
            if (!player) {
                logger.warn(`${preLoggerStr} 玩家登录 | 异常:没有玩家信息|${guestId}`);
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_90)
                });
            }

            language = player.language;
            const {uid, isRobot, closeTime, cellPhone,} = player;

            if (isRobot === RoleEnum.REAL_PLAYER && closeTime && closeTime > new Date()) {
                logger.warn(`${preLoggerStr} 玩家登录 | uid: ${uid} | 异常: 账号冻结`);
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(player.language, languageService.Net_Message.id_56, '')
                });
            }
            // 分发连接器地址
            const connectorServer = await loadBalance.dispatchConnectorByStatistics(uid);

            if (!connectorServer) {
                logger.warn(`${preLoggerStr} 玩家登录 | 异常: 没有分配连接器地址`);
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_89)
                });
            }
            // 生成token
            const token = TokenService.create(player.uid);
            //    connectorServer.host = "66.42.77.64"

            //判断后台是否设置了语言，如果设置了语言就要把玩家语言改一下。
            if (systemConfig && systemConfig.languageForWeb) {
                if (systemConfig.languageForWeb != player.language) {
                    player.language == systemConfig.languageForWeb
                    await PlayerMng.updateOne({uid: player.uid}, {language: systemConfig.languageForWeb});
                }
            }

            //更新玩家IP
            await PlayerMng.updateOne({uid : player.uid},{ip : ip});

            return res.json({
                code: 200,
                id: player.guestid, //游客ID
                uid,
                token,
                cellPhone,
                server: connectorServer,
            });
        } catch (e) {
            logger.error(`${preLoggerStr} 玩家登录 | 出错 :${e.stack}`);
            return res.json({
                code: 500,
                error: languageService.getlanguage(language, languageService.Net_Message.id_90)
            });
        }
    });

    /**
     * 用户切换帐号，手机号码登录
     */
    http.post('/changeLogin', async function (req, res) {
        const cellPhone = req.body.cellPhone;
        const passWord = req.body.passWord;
        if (!cellPhone) {
            return res.json({code: 500, error: languageService.getlanguage(null, languageService.Net_Message.id_1)});
        }

        if (!passWord) {
            return res.json({code: 500, error: languageService.getlanguage(null, languageService.Net_Message.id_240)});
        }

        try {
            const player = await PlayerMng.findOne({cellPhone: cellPhone});
            if (!player) {
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(null, languageService.Net_Message.id_91)
                });
            }
            let pass = signature(passWord, false, false)
            if (player.passWord !== pass) {
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(null, languageService.Net_Message.id_237)
                });
            }
            return res.json({code: 200, id: player.guestid});
        } catch (error) {
            logger.error('changeLogin ==>', error);
            return res.json({code: 500, error: languageService.getlanguage(null, languageService.Net_Message.id_237)});
        }
    });

    /**
     * 手机号码注册
     */
    http.post('/cellPhoneGuest', async function (req, res) {
        const authCode = req.body.authCode;
        const cellPhone = req.body.cellPhone;
        let passWord = req.body.passWord;
        const romType = req.body.romType;
        const channelCode = req.body.channelCode;
        const shareUid = req.body.shareUid;

        let language = null;
        try {
            logger.warn("手机号码注册:", authCode, cellPhone, passWord, channelCode, romType, shareUid)
            if (!cellPhone) {
                return res.json({code: 500, msg: languageService.getlanguage(language, languageService.Net_Message.id_1)});
            }
            if (passWord < 6) {
                return res.json({code: 500, msg: languageService.getlanguage(language, languageService.Net_Message.id_19)});
            }

            // @ts-ignore
            const playerCellPhone: Player = await PlayerManagerDao.findOne({cellPhone}, true);
            // 号码已经被绑定过
            if (playerCellPhone && playerCellPhone.cellPhone) {
                return res.json({code: 500, msg: languageService.getlanguage(language, languageService.Net_Message.id_13)});
            }
            let systemConfig = await SystemConfigManagerDao.findOne({});
            let player = await GatePlayerService.checkPlayerExits(null, systemConfig.defaultChannelCode, channelCode, shareUid, romType);

            const authRecord = await AutchCodeRedisDao.findOne({phone: cellPhone});
            // 验证码已过期
            if (!authRecord) {
                return res.json({code: 500, msg: languageService.getlanguage(player.language, languageService.Net_Message.id_18)});
            }

            // 获取验证码的手机号不匹配
            if (authRecord.phone !== cellPhone) {
                return res.json({code: 500, msg: languageService.getlanguage(player.language, languageService.Net_Message.id_17)});
            }

            // 检查验证码
            if (authRecord.auth_code != authCode) {
                return res.json({code: 500, msg: languageService.getlanguage(player.language, languageService.Net_Message.id_2)});
            }

            passWord = signature(passWord, false, false);

            //删除使用过的验证码
            await AutchCodeRedisDao.delete({phone: cellPhone});

            if (systemConfig.cellPhoneGold > 0) {
                let gold = Math.floor(player.gold + systemConfig.cellPhoneGold);
                //更新玩家信息

                let withdrawalChips = Math.floor(systemConfig.cellPhoneGold * 10);

                await PlayerManagerDao.updateOne({uid: player.uid}, {
                    passWord: passWord,
                    cellPhone: cellPhone,
                    gold: gold,
                    withdrawalChips
                });
                // 给玩家发送邮件 id_1019
                generatorMail({
                    name: languageService.getlanguage(player.language, languageService.Net_Message.id_74),
                    sender: languageService.getlanguage(player.language, languageService.Net_Message.id_1019),
                    content: languageService.getlanguage(player.language, languageService.Net_Message.id_75, Math.floor(systemConfig.cellPhoneGold / 100)),
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
                await PlayerManagerDao.updateOne({uid: player.uid}, {passWord: passWord, cellPhone: cellPhone});
            }
            return res.json({
                code: 200,
                uid: player.uid,
                guestid: player.guestid,
                cellPhone,
                msg: languageService.getlanguage(language, languageService.Net_Message.id_65)
            });
        } catch (errorOrCode) {
            logger.warn(`hall.userHandler.bindCellPhone`, errorOrCode);
            return res.json({code: 500, msg: languageService.getlanguage(language, languageService.Net_Message.id_95)});
        }
    });
}