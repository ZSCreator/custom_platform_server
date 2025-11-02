"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandler = void 0;
const TokenService = require("../../../services/hall/tokenService");
const langsrv = require("../../../services/common/langsrv");
const index_1 = require("../../../utils/index");
const loadBalance = require("../lib/services/loadBalance");
const pinus_logger_1 = require("pinus-logger");
const RoleEnum = require("../../../common/constant/player/RoleEnum");
const ThirdApiAuthTokenDao = require("../../../common/dao/redis/ThirdApiAuthTokenDao");
const GatePlayerService_1 = require("../lib/services/GatePlayerService");
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const Robot_manager_1 = require("../../../common/dao/daoManager/Robot.manager");
const SystemConfig_manager_1 = require("../../../common/dao/daoManager/SystemConfig.manager");
const AuthCode_redis_dao_1 = require("../../../common/dao/redis/AuthCode.redis.dao");
const Player_manager_2 = require("../../../common/dao/daoManager/Player.manager");
const MailService = require("../../../services/MailService");
const hallConst_1 = require("../../../consts/hallConst");
const GameRecordDateTable_mysql_dao_1 = require("../../../common/dao/mysql/GameRecordDateTable.mysql.dao");
const moment = require("moment");
function default_1(app) {
    return new MainHandler(app);
}
exports.default = default_1;
class MainHandler {
    constructor(app) {
        this.app = app;
        this.preLoggerStr = `网关服务器 ${this.app.getServerId()} |`;
        this.cellPhoneGuest = async function ({ authCode, cellPhone, passWord, rom_type, channelCode, shareUid }) {
            let language = null;
            try {
                this.logger.warn("手机号码注册:", authCode, cellPhone, passWord, channelCode, rom_type, shareUid);
                if (!cellPhone) {
                    return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1) };
                }
                if (passWord < 6) {
                    return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_19) };
                }
                const playerCellPhone = await Player_manager_2.default.findOne({ cellPhone }, true);
                if (playerCellPhone && playerCellPhone.cellPhone) {
                    return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_13) };
                }
                let systemConfig = await SystemConfig_manager_1.default.findOne({});
                let player = await GatePlayerService_1.default.checkPlayerExits(null, systemConfig.defaultChannelCode, channelCode, shareUid, rom_type);
                const autchRecord = await AuthCode_redis_dao_1.default.findOne({ phone: cellPhone });
                if (!autchRecord) {
                    return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_18) };
                }
                if (autchRecord.phone !== cellPhone) {
                    return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_17) };
                }
                if (autchRecord.auth_code != authCode) {
                    return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2) };
                }
                passWord = (0, index_1.signature)(passWord, false, false);
                await AuthCode_redis_dao_1.default.delete({ phone: cellPhone });
                if (systemConfig.cellPhoneGold > 0) {
                    let gold = Math.floor(player.gold + systemConfig.cellPhoneGold);
                    let withdrawalChips = Math.floor(systemConfig.cellPhoneGold * 10);
                    await Player_manager_2.default.updateOne({ uid: player.uid }, { passWord: passWord, cellPhone: cellPhone, gold: gold, withdrawalChips });
                    MailService.generatorMail({
                        name: langsrv.getlanguage(player.language, langsrv.Net_Message.id_74),
                        sender: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1019),
                        content: langsrv.getlanguage(player.language, langsrv.Net_Message.id_75, Math.floor(systemConfig.cellPhoneGold / 100)),
                        type: 0,
                    }, player.uid);
                    const gameInfo = {
                        uid: player.uid,
                        nid: hallConst_1.CELLPHONE_TYPE.ADD_NID,
                        gameName: hallConst_1.CELLPHONE_TYPE.ADD_NAME,
                        groupRemark: player.groupRemark,
                        thirdUid: player.thirdUid ? player.group_id : null,
                        group_id: player.group_id ? player.group_id : null,
                        sceneId: -1,
                        roomId: '-1',
                        input: 0,
                        bet_commission: 0,
                        win_commission: 0,
                        settle_commission: 0,
                        profit: systemConfig.cellPhoneGold,
                        gold: player.gold,
                        status: 1,
                        gameOrder: Date.now() + player.uid,
                    };
                    GameRecordDateTable_mysql_dao_1.default.insertOne(gameInfo);
                }
                else {
                    await Player_manager_2.default.updateOne({ uid: player.uid }, { passWord: passWord, cellPhone: cellPhone });
                }
                return { code: 200, uid: player.uid, guestid: player.guestid, cellPhone, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_65) };
            }
            catch (errorOrCode) {
                this.logger.warn(`hall.userHandler.bindCellPhone`, errorOrCode);
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_95) };
            }
        };
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
    async changeLogin(msg) {
        if (!msg.cellPhone) {
            return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_1) };
        }
        if (!msg.passWord) {
            return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_240) };
        }
        try {
            const player = await Player_manager_1.default.findOne({ cellPhone: msg.cellPhone });
            if (!player) {
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_91) };
            }
            let pass = (0, index_1.signature)(msg.passWord, false, false);
            if (player.passWord !== pass) {
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_237) };
            }
            return { code: 200, id: player.guestid };
        }
        catch (error) {
            console.log(`gate.handler.changeLogn ==>${error}`);
            this.logger.error('gate.handler.changeLogn ==>', error);
            return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_237) };
        }
    }
    ;
    async guest({ rom_type, channelCode, shareUid }) {
        let language = null;
        try {
            const systemConfig = await SystemConfig_manager_1.default.findOne({ id: 1 });
            if (systemConfig && !systemConfig.isOpenH5) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_90) };
            }
            const player = await GatePlayerService_1.default.checkPlayerExits(null, systemConfig.defaultChannelCode, channelCode, shareUid, rom_type);
            if (!player) {
                this.logger.warn(`${this.preLoggerStr} 玩家登录 | 异常:没有玩家信息`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_90) };
            }
            language = player.language;
            const connectorServer = await loadBalance.dispatchConnectorByStatistics(player.uid);
            if (!connectorServer) {
                this.logger.warn(`${this.preLoggerStr} 玩家登录 | 异常: 没有分配连接器地址`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_89) };
            }
            const token = TokenService.create(player.uid);
            return {
                code: 200,
                id: player.guestid,
                uid: player.uid,
                token,
                cellPhone: player.cellPhone,
                server: connectorServer,
            };
        }
        catch (e) {
            this.logger.error(`${this.preLoggerStr} 游客登录 | 出错 :${e.stack}`);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_90) };
        }
    }
    async login({ id: guestid, rom_type, channelCode, shareUid }) {
        this.logger.warn(`玩家登录_step1 |${guestid},time : ${moment().format("YYYY-MM-DD- HH:mm:ss")}`);
        let language = null;
        try {
            const systemConfig = await SystemConfig_manager_1.default.findOne({ id: 1 });
            if (systemConfig && !systemConfig.isOpenH5) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_90) };
            }
            const player = await GatePlayerService_1.default.checkPlayerExits(guestid, systemConfig.defaultChannelCode, channelCode, shareUid, rom_type);
            if (!player) {
                this.logger.warn(`${this.preLoggerStr} 玩家登录 | 异常:没有玩家信息|${guestid}`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_90) };
            }
            language = player.language;
            const { uid, isRobot, closeTime, cellPhone, } = player;
            if (isRobot === RoleEnum.RoleEnum.REAL_PLAYER && closeTime && closeTime > new Date()) {
                this.logger.warn(`${this.preLoggerStr} 玩家登录 | uid: ${uid} | 异常: 账号冻结`);
                return {
                    code: 500,
                    error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_56, '')
                };
            }
            const connectorServer = await loadBalance.dispatchConnectorByStatistics(uid);
            if (!connectorServer) {
                this.logger.warn(`${this.preLoggerStr} 玩家登录 | 异常: 没有分配连接器地址`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_89) };
            }
            const token = TokenService.create(player.uid);
            if (systemConfig && systemConfig.languageForWeb) {
                if (systemConfig.languageForWeb != player.language) {
                    player.language == systemConfig.languageForWeb;
                    await Player_manager_1.default.updateOne({ uid: player.uid }, { language: systemConfig.languageForWeb });
                }
            }
            return {
                code: 200,
                id: player.guestid,
                uid,
                token,
                cellPhone,
                server: connectorServer,
            };
        }
        catch (e) {
            this.logger.error(`${this.preLoggerStr} 玩家登录 | 出错 :${e.stack}`);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_90) };
        }
    }
    async loginForRobot({ id: guestid }) {
        try {
            const robot = await Robot_manager_1.default.findOne({ guestid });
            if (!robot) {
                this.logger.warn(`${this.preLoggerStr} 机器人登录 | 异常:没有玩家信息|${guestid}`);
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_90) };
            }
            const { uid, } = robot;
            const connectorServer = await loadBalance.dispatchConnectorByStatistics(uid, 'connector', true);
            if (!connectorServer) {
                this.logger.warn(`${this.preLoggerStr} 机器人登录 | 异常: 没有分配连接器地址`);
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_89) };
            }
            const token = TokenService.create(uid);
            return {
                code: 200,
                id: guestid,
                uid,
                token,
                server: connectorServer,
            };
        }
        catch (e) {
            this.logger.error(`${this.preLoggerStr} 机器人登录 | 出错 :${e.stack}`);
            return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_90) };
        }
    }
    async thirdLogin({ token }) {
        try {
            console.warn(token);
            if (!token) {
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_2) };
            }
            const thirdApi = await ThirdApiAuthTokenDao.findOne(token);
            if (!thirdApi) {
                this.logger.warn(`${this.preLoggerStr}登录大厅异常: | token:${token} | auth token非法 `);
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
            const player = await Player_manager_1.default.findOne({ uid: thirdApi.uid });
            if (!player) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_56) };
            }
            if (player.closeTime && player.closeTime > new Date()) {
                return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_56, '') };
            }
            const connectorServer = await loadBalance.dispatchConnectorByStatistics(player.uid);
            if (!connectorServer) {
                this.logger.warn(`${this.preLoggerStr} 玩家登录 | 异常: 没有分配连接器地址`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_89) };
            }
            const t = TokenService.create(player.uid);
            return {
                code: 200,
                id: player.guestid,
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
        }
        catch (e) {
            this.logger.error(`${this.preLoggerStr} 第三方平台 | 玩家登录 | 出错 :${e.stack}`);
            return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_2) };
        }
    }
}
exports.MainHandler = MainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nYXRlL2hhbmRsZXIvbWFpbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0Esb0VBQXFFO0FBQ3JFLDREQUE2RDtBQUM3RCxnREFBK0M7QUFDL0MsMkRBQTREO0FBQzVELCtDQUF5QztBQUN6QyxxRUFBc0U7QUFDdEUsdUZBQXVGO0FBQ3ZGLHlFQUFrRTtBQUNsRSxrRkFBc0U7QUFDdEUsZ0ZBQTJFO0FBQzNFLDhGQUF5RjtBQUV6RixxRkFBNkU7QUFDN0Usa0ZBQTZFO0FBQzdFLDZEQUE4RDtBQUM5RCx5REFBeUQ7QUFDekQsMkdBQWtHO0FBQ2xHLGlDQUFpQztBQUNqQyxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFhLFdBQVc7SUFNcEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUpwQyxpQkFBWSxHQUFXLFNBQVMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDO1FBZ0IzRCxtQkFBYyxHQUFHLEtBQUssV0FBVyxFQUFHLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFO1lBQ2hHLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztZQUNwQixJQUFJO2dCQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO2dCQUMzRixJQUFJLENBQUMsU0FBUyxFQUFFO29CQUNaLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMs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