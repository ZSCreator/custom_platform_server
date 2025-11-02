"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const SystemConfig_manager_1 = require("../../../../common/dao/daoManager/SystemConfig.manager");
const GatePlayerService_1 = require("../../../gate/lib/services/GatePlayerService");
const languageService = require("../../../../services/common/langsrv");
const TokenService = require("../../../../services/hall/tokenService");
const loadBalance = require("../utils/balance");
const ThirdApiAuthTokenDao = require("../../../../common/dao/redis/ThirdApiAuthTokenDao");
const Player_manager_1 = require("../../../../common/dao/daoManager/Player.manager");
const moment = require("moment");
const RoleEnum_1 = require("../../../../common/constant/player/RoleEnum");
const utils_1 = require("../../../../utils");
const Player_manager_2 = require("../../../../common/dao/daoManager/Player.manager");
const AuthCode_redis_dao_1 = require("../../../../common/dao/redis/AuthCode.redis.dao");
const hallConst_1 = require("../../../../consts/hallConst");
const GameRecordDateTable_mysql_dao_1 = require("../../../../common/dao/mysql/GameRecordDateTable.mysql.dao");
const MailService_1 = require("../../../../services/MailService");
const index_1 = require("../../../../utils/index");
const logger = (0, pinus_1.getLogger)('server_out', __filename);
const preLoggerStr = `网关服务器 |`;
function default_1(app, http) {
    http.post('/guest', async function (req, res) {
        let romType = req.body.romType || null;
        let channelCode = req.body.channelCode || null;
        let shareUid = req.body.shareUid || null;
        let language = null;
        const ip = (0, index_1.getClientIp)(req);
        console.warn(`游客登录:${ip}`);
        try {
            const systemConfig = await SystemConfig_manager_1.default.findOne({ id: 1 });
            if (systemConfig && !systemConfig.isOpenH5) {
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_90)
                });
            }
            const player = await GatePlayerService_1.default.checkPlayerExits(null, systemConfig.defaultChannelCode, channelCode, shareUid, romType);
            if (!player) {
                logger.warn(`${preLoggerStr} 玩家登录 | 异常:没有玩家信息`);
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_90)
                });
            }
            language = player.language;
            const connectorServer = await loadBalance.dispatchConnectorByStatistics(player.uid);
            if (!connectorServer) {
                logger.warn(`${preLoggerStr} 玩家登录 | 异常: 没有分配连接器地址`);
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_89)
                });
            }
            const token = TokenService.create(player.uid);
            await Player_manager_1.default.updateOne({ uid: player.uid }, { ip: ip });
            return res.json({
                code: 200,
                id: player.guestid,
                uid: player.uid,
                token,
                cellPhone: player.cellPhone,
                server: connectorServer,
            });
        }
        catch (e) {
            logger.error(`${preLoggerStr} 游客登录 | 出错 :${e.stack}`);
            res.json({ code: 500, msg: "请求数据错误" });
        }
    });
    http.post('/thirdLogin', async function (req, res) {
        let token = req.body.token || null;
        const ip = (0, index_1.getClientIp)(req);
        console.warn(`第三方登陆token:${token} , ip : ${ip}`);
        try {
            if (!token) {
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(null, languageService.Net_Message.id_2)
                });
            }
            const thirdApi = await ThirdApiAuthTokenDao.findOne(token);
            if (!thirdApi) {
                logger.warn(`${preLoggerStr}登录大厅异常: | token:${token} | auth token非法 `);
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
            const player = await Player_manager_1.default.findOne({ uid: thirdApi.uid });
            if (!player) {
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_56)
                });
            }
            if (player.closeTime && player.closeTime > new Date()) {
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(player.language, languageService.Net_Message.id_56, '')
                });
            }
            const connectorServer = await loadBalance.dispatchConnectorByStatistics(player.uid);
            if (!connectorServer) {
                logger.warn(`${preLoggerStr} 玩家登录 | 异常: 没有分配连接器地址`);
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_89)
                });
            }
            const t = TokenService.create(player.uid);
            await Player_manager_1.default.updateOne({ uid: player.uid }, { ip: ip });
            return res.json({
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
            });
        }
        catch (e) {
            logger.error(`${preLoggerStr} 第三方平台 | 玩家登录 | 出错 :${e.stack}`);
            return res.json({ code: 500, error: languageService.getlanguage(null, languageService.Net_Message.id_2) });
        }
    });
    http.post('/login', async function (req, res) {
        const guestId = req.body.id;
        const romType = req.body.romType;
        const channelCode = req.body.channelCode;
        const shareUid = req.body.shareUid;
        const ip = (0, index_1.getClientIp)(req);
        logger.warn(`玩家登录_step1 |${guestId},time : ${moment().format("YYYY-MM-DD- HH:mm:ss")} , ip : ${ip}`);
        let language = null;
        try {
            const systemConfig = await SystemConfig_manager_1.default.findOne({ id: 1 });
            if (systemConfig && !systemConfig.isOpenH5) {
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_90)
                });
            }
            const player = await GatePlayerService_1.default.checkPlayerExits(guestId, systemConfig.defaultChannelCode, channelCode, shareUid, romType);
            if (!player) {
                logger.warn(`${preLoggerStr} 玩家登录 | 异常:没有玩家信息|${guestId}`);
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_90)
                });
            }
            language = player.language;
            const { uid, isRobot, closeTime, cellPhone, } = player;
            if (isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER && closeTime && closeTime > new Date()) {
                logger.warn(`${preLoggerStr} 玩家登录 | uid: ${uid} | 异常: 账号冻结`);
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(player.language, languageService.Net_Message.id_56, '')
                });
            }
            const connectorServer = await loadBalance.dispatchConnectorByStatistics(uid);
            if (!connectorServer) {
                logger.warn(`${preLoggerStr} 玩家登录 | 异常: 没有分配连接器地址`);
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(language, languageService.Net_Message.id_89)
                });
            }
            const token = TokenService.create(player.uid);
            if (systemConfig && systemConfig.languageForWeb) {
                if (systemConfig.languageForWeb != player.language) {
                    player.language == systemConfig.languageForWeb;
                    await Player_manager_1.default.updateOne({ uid: player.uid }, { language: systemConfig.languageForWeb });
                }
            }
            await Player_manager_1.default.updateOne({ uid: player.uid }, { ip: ip });
            return res.json({
                code: 200,
                id: player.guestid,
                uid,
                token,
                cellPhone,
                server: connectorServer,
            });
        }
        catch (e) {
            logger.error(`${preLoggerStr} 玩家登录 | 出错 :${e.stack}`);
            return res.json({
                code: 500,
                error: languageService.getlanguage(language, languageService.Net_Message.id_90)
            });
        }
    });
    http.post('/changeLogin', async function (req, res) {
        const cellPhone = req.body.cellPhone;
        const passWord = req.body.passWord;
        if (!cellPhone) {
            return res.json({ code: 500, error: languageService.getlanguage(null, languageService.Net_Message.id_1) });
        }
        if (!passWord) {
            return res.json({ code: 500, error: languageService.getlanguage(null, languageService.Net_Message.id_240) });
        }
        try {
            const player = await Player_manager_1.default.findOne({ cellPhone: cellPhone });
            if (!player) {
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(null, languageService.Net_Message.id_91)
                });
            }
            let pass = (0, utils_1.signature)(passWord, false, false);
            if (player.passWord !== pass) {
                return res.json({
                    code: 500,
                    error: languageService.getlanguage(null, languageService.Net_Message.id_237)
                });
            }
            return res.json({ code: 200, id: player.guestid });
        }
        catch (error) {
            logger.error('changeLogin ==>', error);
            return res.json({ code: 500, error: languageService.getlanguage(null, languageService.Net_Message.id_237) });
        }
    });
    http.post('/cellPhoneGuest', async function (req, res) {
        const authCode = req.body.authCode;
        const cellPhone = req.body.cellPhone;
        let passWord = req.body.passWord;
        const romType = req.body.romType;
        const channelCode = req.body.channelCode;
        const shareUid = req.body.shareUid;
        let language = null;
        try {
            logger.warn("手机号码注册:", authCode, cellPhone, passWord, channelCode, romType, shareUid);
            if (!cellPhone) {
                return res.json({ code: 500, msg: languageService.getlanguage(language, languageService.Net_Message.id_1) });
            }
            if (passWord < 6) {
                return res.json({ code: 500, msg: languageService.getlanguage(language, languageService.Net_Message.id_19) });
            }
            const playerCellPhone = await Player_manager_2.default.findOne({ cellPhone }, true);
            if (playerCellPhone && playerCellPhone.cellPhone) {
                return res.json({ code: 500, msg: languageService.getlanguage(language, languageService.Net_Message.id_13) });
            }
            let systemConfig = await SystemConfig_manager_1.default.findOne({});
            let player = await GatePlayerService_1.default.checkPlayerExits(null, systemConfig.defaultChannelCode, channelCode, shareUid, romType);
            const authRecord = await AuthCode_redis_dao_1.default.findOne({ phone: cellPhone });
            if (!authRecord) {
                return res.json({ code: 500, msg: languageService.getlanguage(player.language, languageService.Net_Message.id_18) });
            }
            if (authRecord.phone !== cellPhone) {
                return res.json({ code: 500, msg: languageService.getlanguage(player.language, languageService.Net_Message.id_17) });
            }
            if (authRecord.auth_code != authCode) {
                return res.json({ code: 500, msg: languageService.getlanguage(player.language, languageService.Net_Message.id_2) });
            }
            passWord = (0, utils_1.signature)(passWord, false, false);
            await AuthCode_redis_dao_1.default.delete({ phone: cellPhone });
            if (systemConfig.cellPhoneGold > 0) {
                let gold = Math.floor(player.gold + systemConfig.cellPhoneGold);
                let withdrawalChips = Math.floor(systemConfig.cellPhoneGold * 10);
                await Player_manager_2.default.updateOne({ uid: player.uid }, {
                    passWord: passWord,
                    cellPhone: cellPhone,
                    gold: gold,
                    withdrawalChips
                });
                (0, MailService_1.generatorMail)({
                    name: languageService.getlanguage(player.language, languageService.Net_Message.id_74),
                    sender: languageService.getlanguage(player.language, languageService.Net_Message.id_1019),
                    content: languageService.getlanguage(player.language, languageService.Net_Message.id_75, Math.floor(systemConfig.cellPhoneGold / 100)),
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
            return res.json({
                code: 200,
                uid: player.uid,
                guestid: player.guestid,
                cellPhone,
                msg: languageService.getlanguage(language, languageService.Net_Message.id_65)
            });
        }
        catch (errorOrCode) {
            logger.warn(`hall.userHandler.bindCellPhone`, errorOrCode);
            return res.json({ code: 500, msg: languageService.getlanguage(language, languageService.Net_Message.id_95) });
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW5Sb3V0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dhdGVIdHRwL2xpYi9yb3V0ZS9sb2dpblJvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQTZDO0FBQzdDLGlHQUE0RjtBQUM1RixvRkFBNkU7QUFDN0UsdUVBQXdFO0FBQ3hFLHVFQUF3RTtBQUN4RSxnREFBaUQ7QUFDakQsMEZBQTBGO0FBQzFGLHFGQUF5RTtBQUN6RSxpQ0FBaUM7QUFDakMsMEVBQXFFO0FBQ3JFLDZDQUE0QztBQUM1QyxxRkFBZ0Y7QUFDaEYsd0ZBQWdGO0FBQ2hGLDREQUE0RDtBQUM1RCw4R0FBcUc7QUFDckcsa0VBQStEO0FBQy9ELG1EQUFxRDtBQUNyRCxNQUFNLE1BQU0sR0FBRyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ25ELE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQTtBQUc5QixtQkFBeUIsR0FBZ0IsRUFBRSxJQUFJO0lBSTNDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssV0FBVyxHQUFHLEVBQUUsR0FBRztRQUN4QyxJQUFJLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUM7UUFDdkMsSUFBSSxXQUFXLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDO1FBQy9DLElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQztRQUN6QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDcEIsTUFBTSxFQUFFLEdBQVcsSUFBQSxtQkFBVyxFQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQzFCLElBQUk7WUFDQSxNQUFNLFlBQVks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