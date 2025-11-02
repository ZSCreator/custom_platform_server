"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThirdService = void 0;
const common_1 = require("@nestjs/common");
const Player_manager_1 = require("../../../../../common/dao/daoManager/Player.manager");
const TokenService = require("../../../../../services/hall/tokenService");
const SystemConfig_manager_1 = require("../../../../../common/dao/daoManager/SystemConfig.manager");
const GameRecordDateTable_mysql_dao_1 = require("../../../../../common/dao/mysql/GameRecordDateTable.mysql.dao");
const OnlinePlayer_redis_dao_1 = require("../../../../../common/dao/redis/OnlinePlayer.redis.dao");
const ThirdGoldRecord_mysql_dao_1 = require("../../../../../common/dao/mysql/ThirdGoldRecord.mysql.dao");
const PlayerAgent_mysql_dao_1 = require("../../../../../common/dao/mysql/PlayerAgent.mysql.dao");
const MiddlewareEnum = require("../../const/middlewareEnum");
const Utils = require("../../../../../utils/index");
const HallConst = require("../../../../../consts/hallConst");
const PositionEnum_1 = require("../../../../../common/constant/player/PositionEnum");
const DateTime2GameRecord_service_1 = require("../../../../gmsApi/lib/modules/managerBackendApi/agent/DateTime2GameRecord.service");
const ThirdApiAuthTokenDao = require("../../../../../common/dao/redis/ThirdApiAuthTokenDao");
const goldCoinChangeWarningOrder_service_1 = require("./goldCoinChangeWarningOrder.service");
const GatePlayerService_1 = require("../../../../gate/lib/services/GatePlayerService");
const Player_entity_1 = require("../../../../../common/dao/mysql/entity/Player.entity");
const ThirdGoldRecordType_enum_1 = require("../../../../../common/dao/mysql/entity/enum/ThirdGoldRecordType.enum");
const ThirdGoldRecordStatus_enum_1 = require("../../../../../common/dao/mysql/entity/enum/ThirdGoldRecordStatus.enum");
const changePlayerMoney_redis_dao_1 = require("../../../../../common/dao/redis/changePlayerMoney.redis.dao");
const Player_redis_dao_1 = require("../../../../../common/dao/redis/Player.redis.dao");
const moment = require("moment");
const TenantGameData_mysql_dao_1 = require("../../../../../common/dao/mysql/TenantGameData.mysql.dao");
const PlatformNameAgentList_redis_dao_1 = require("../../../../../common/dao/redis/PlatformNameAgentList.redis.dao");
const PlayerAgent_redis_dao_1 = require("../../../../../common/dao/redis/PlayerAgent.redis.dao");
const connectionManager_1 = require("../../../../../common/dao/mysql/lib/connectionManager");
const axios_1 = require("axios");
const redisGoldEvent_1 = require("../../../../../common/event/redisGoldEvent");
const Game_manager_1 = require("../../../../../common/dao/daoManager/Game.manager");
const pinus_1 = require("pinus");
const utils_1 = require("../../../../../utils");
let ThirdService = class ThirdService {
    constructor(warningOrderService) {
        this.warningOrderService = warningOrderService;
        this.thirdHttp_call = (0, pinus_1.getLogger)('thirdHttp_call');
        this.thirdHttp_game_record_Logger = (0, pinus_1.getLogger)('thirdHttp_game_record');
    }
    async login(agent, money, account, KindId, language, lineCode, loginHall = false, backHall = false) {
        try {
            const systemConfig = await SystemConfig_manager_1.default.findOne({});
            const lineCodeList = ['line_1', 'line_2', 'line_3', 'line_4', 'line_5', 'line_6', 'line_7', 'line_8', 'line_9', 'line_10', 'line_11', 'line_12', 'line_13', 'line_14', 'line_15', 'line_16', 'line_17', 'line_18', 'line_19', 'line_20'];
            if (systemConfig) {
                if (systemConfig.isCloseApi) {
                    if (!systemConfig.apiTestAgent) {
                        return { s: 100, m: "/login", d: { code: MiddlewareEnum.GAME_CLOSE.status } };
                    }
                    else if (systemConfig.apiTestAgent && agent !== systemConfig.apiTestAgent) {
                        return { s: 100, m: "/login", d: { code: MiddlewareEnum.GAME_CLOSE.status } };
                    }
                }
                if (systemConfig.closeNid && systemConfig.closeNid.length !== 0) {
                    if (systemConfig.closeNid.includes(KindId)) {
                        return { s: 100, m: "/login", d: { code: MiddlewareEnum.GAME_CLOSE.status } };
                    }
                }
            }
            if (loginHall == false) {
                const game = await Game_manager_1.default.findOne({ nid: KindId });
                if (!game) {
                    return { s: 100, m: "/login", d: { code: MiddlewareEnum.GAME_NOT_EXIST.status } };
                }
                const platformName = await PlatformNameAgentList_redis_dao_1.default.findPlatformNameForAgent({ agent: agent });
                if (platformName) {
                    const closeGameList = await PlatformNameAgentList_redis_dao_1.default.getPlatformCloseGame({ platformName: platformName });
                    if (closeGameList.includes(KindId)) {
                        return { s: 100, m: "/login", d: { code: MiddlewareEnum.GAME_NOT_EXIST.status } };
                    }
                }
            }
            let searchUser;
            this.thirdHttp_call.warn(`登陆 :account: ${account},agent:${agent},KindId:${KindId} tag one`);
            if (account) {
                const player = await Player_manager_1.default.findOne({ thirdUid: account, groupRemark: agent }, true);
                this.thirdHttp_call.warn(`登陆查找玩家 : account: ${account} , uid : ${player ? player.uid : null}, agent:${agent}, KindId:${KindId} tag two`);
                if (player) {
                    searchUser = player;
                    let updateData = {};
                    if (player.closeTime > new Date()) {
                        return Promise.reject(MiddlewareEnum.ACCOUNT_CLOSE.status);
                    }
                    if (language && HallConst.LANGUAGE_LIST.includes(language) && player.language != language) {
                        updateData = { language: language };
                    }
                    if (lineCode && player.lineCode != lineCode) {
                        Object.assign(updateData, { lineCode: lineCode });
                    }
                    else if (player.lineCode && lineCodeList.includes(player.lineCode)) {
                        let index = (0, utils_1.random)(0, 19);
                        let lineCode_1 = agent + lineCodeList[index];
                        Object.assign(updateData, { lineCode: lineCode_1 });
                    }
                    if (JSON.stringify(updateData) !== "{}") {
                        await Player_manager_1.default.updateOne({ uid: player.uid }, updateData);
                    }
                }
            }
            if (!searchUser) {
                const platformInfo = await PlayerAgent_redis_dao_1.default.findOne({ platformName: agent });
                if (!platformInfo) {
                    return Promise.reject(MiddlewareEnum.AGENT_NOT_EXIST.status);
                }
                if (platformInfo.roleType == 2) {
                    return Promise.reject(MiddlewareEnum.AGENT_ERROR.status);
                }
                let language1 = HallConst.LANGUAGE_LIST.includes(language) ? language : HallConst.LANGUAGE.DEFAULT;
                if (!lineCode) {
                    let index = (0, utils_1.random)(0, 19);
                    lineCode = agent + lineCodeList[index];
                }
                searchUser = await GatePlayerService_1.default.createPlayer(null, platformInfo.uid, platformInfo.rootUid, account, agent, language1, lineCode);
            }
            const token = TokenService.create(searchUser.uid);
            let backButtonList = [];
            let hotGameButtonList = [];
            if (systemConfig) {
                backButtonList = systemConfig.backButton ? systemConfig.backButton : [];
                hotGameButtonList = systemConfig.hotGameButton ? systemConfig.hotGameButton : [];
            }
            await ThirdApiAuthTokenDao.insert(token, {
                nid: KindId,
                loginHall: loginHall,
                backHall: backHall,
                language: language ? language : 'chinese_zh',
                uid: searchUser.uid,
                backButton: backButtonList.includes(searchUser.group_id) ? false : true,
                hotGameButton: hotGameButtonList.includes(searchUser.group_id) ? false : true,
            }, 180);
            if (!systemConfig.h5GameUrl) {
                return { s: 100, m: "/login", d: { code: MiddlewareEnum.GAME_CLOSE.status } };
            }
            const h5Url = systemConfig.h5GameUrl;
            const url = h5Url + "?token=" + token + "&language=" + (language ? language : 'chinese_zh');
            return {
                s: 100,
                m: "/login",
                d: {
                    code: MiddlewareEnum.SUCCESS.status,
                    url,
                }
            };
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async checkPlayerMoney(account, agent) {
        const player = await Player_manager_1.default.findOne({ thirdUid: account, groupRemark: agent }, true);
        if (!player) {
            return {
                s: 101,
                m: "/checkPlayerMoney",
                d: {
                    money: Math.floor(0),
                    isGame: false,
                    code: MiddlewareEnum.SUCCESS.status
                }
            };
        }
        const money = player.gold.toString() ? player.gold : 0;
        let isGame = false;
        return {
            s: 101,
            m: "/checkPlayerMoney",
            d: {
                money: Math.floor(money),
                isGame: isGame,
                code: MiddlewareEnum.SUCCESS.status
            }
        };
    }
    async addPlayerMoney(account, money, agent, orderid, timestamp) {
        try {
            this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag one`);
            const platformInfo = await PlayerAgent_redis_dao_1.default.findOne({ platformName: agent });
            if (!platformInfo) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.AGENT_NOT_EXIST.msg} | 上分异常 | 代理异常`);
                await changePlayerMoney_redis_dao_1.default.del(agent, account);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.AGENT_NOT_EXIST.status } };
            }
            if (platformInfo.roleType == 2) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.AGENT_NOT_EXIST.msg} | 上分异常 | 是平台`);
                await changePlayerMoney_redis_dao_1.default.del(agent, account);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.AGENT_ERROR.status } };
            }
            const record = await ThirdGoldRecord_mysql_dao_1.default.findOne({ orderId: orderid });
            if (record) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ORDERID_EXIST.msg} | 上分异常 | 记录已存在`);
                await changePlayerMoney_redis_dao_1.default.del(agent, account);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.ORDERID_EXIST.status } };
            }
            let gold = money * MiddlewareEnum.MONEY_BATE.HUNDRED;
            gold = Math.floor(gold);
            if (money > 0 && platformInfo.platformGold < gold) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account:${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.AGENT_MONEY_NOT_ENOUGH.msg} | 上分异常 | 金币异常 ${money}/${gold}/${platformInfo.platformGold}`);
                await changePlayerMoney_redis_dao_1.default.del(agent, account);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.AGENT_MONEY_NOT_ENOUGH.status } };
            }
            if (money > 10000000) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account:${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.NOT_OVER_MILLION.msg} | 上分异常 | 金币过多`);
                await changePlayerMoney_redis_dao_1.default.del(agent, account);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.NOT_OVER_MILLION.status } };
            }
            const player = await Player_manager_1.default.findOne({ thirdUid: account, groupRemark: agent }, true);
            if (!player) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.NOT_OVER_MILLION.msg} | 上分异常 | 未找到玩家`);
                await changePlayerMoney_redis_dao_1.default.del(agent, account);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.ACCOUNT_GET_LOSE.status } };
            }
            player.gold += gold;
            player.addDayRmb += gold;
            this.thirdHttp_call.warn(`发送第三方给玩家上分 :thirdUid:${player.thirdUid},uid:${player.uid},时间:${Utils.cDate(Date.now())},代理:${agent} tag two`);
            if (player.oneAddRmb == 0) {
                player.oneAddRmb = Math.floor(gold);
            }
            else {
                player.oneAddRmb += Math.floor(gold);
            }
            if (player.addRmb < gold) {
                player.addRmb = gold;
                player.addRmb = Math.floor(player.addRmb);
            }
            this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag three`);
            if (player.oneAddRmb > 1000000000) {
                player.oneAddRmb = 1000000000;
            }
            if (player.gold > 1000000000) {
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.NOT_OVER_MILLION.status } };
            }
            await Player_manager_1.default.updateOneForaddPlayerMoney(player.uid, {
                gold: gold,
                oneAddRmb: Math.floor(player.oneAddRmb),
                addRmb: Math.floor(player.addRmb),
                withdrawalChips: 0,
                addDayRmb: Math.floor(player.addDayRmb)
            });
            this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag four`);
            PlayerAgent_mysql_dao_1.default.updateDeleForThirdApi(platformInfo.platformName, {
                gold: Math.abs(gold),
            });
            this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag five`);
            const recordInfo = {
                orderId: orderid,
                uid: player.uid,
                type: ThirdGoldRecordType_enum_1.ThirdGoldRecordType.Player,
                agentRemark: agent,
                goldChangeBefore: Math.floor(player.gold - gold),
                gold,
                goldChangeAfter: Math.floor(player.gold),
                status: ThirdGoldRecordStatus_enum_1.ThirdGoldRecordStatus.addMoney,
                remark: "自动通过"
            };
            const gameInfo = {
                uid: player.uid,
                nid: MiddlewareEnum.THIRD_ADD_GOLD.ADDNID,
                gameName: MiddlewareEnum.THIRD_ADD_GOLD.ADDNAME,
                groupRemark: player.groupRemark,
                thirdUid: player.thirdUid,
                group_id: player.group_id ? player.group_id : null,
                sceneId: -1,
                roomId: '-1',
                input: 0,
                bet_commission: 0,
                win_commission: 0,
                settle_commission: 0,
                profit: gold,
                gold: player.gold,
                status: 1,
                gameOrder: orderid,
            };
            this.addPlayerRecord(recordInfo, gameInfo);
            this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},金币:${Math.floor(player.gold)}`);
            this.thirdHttp_call.warn(`http | 金币推送 :account: ${account} | uid ${player.uid}`);
            await (0, redisGoldEvent_1.sendRedisGoldMessage)({ uid: player.uid });
            await changePlayerMoney_redis_dao_1.default.del(agent, account);
            return {
                s: 102,
                m: "/addPlayerMoney",
                d: {
                    code: MiddlewareEnum.SUCCESS.status,
                    account: account,
                    money: Math.floor(player.gold)
                }
            };
        }
        catch (error) {
            await changePlayerMoney_redis_dao_1.default.del(agent, account);
            return Promise.reject(error);
        }
    }
    async lowerPlayerMoney(account, money, agent, orderid, timestamp) {
        const requestStartTime = Math.round(Date.now() / 1000);
        const queryRunner = connectionManager_1.default.getConnection().createQueryRunner();
        try {
            this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag one`);
            const platformInfo = await PlayerAgent_redis_dao_1.default.findOne({ platformName: agent });
            if (!platformInfo) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.AGENT_NOT_EXIST.msg} | 下分异常 | 没有代理记录`);
                await changePlayerMoney_redis_dao_1.default.del(agent, account);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.AGENT_NOT_EXIST.status } };
            }
            if (platformInfo.roleType == 2) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.AGENT_NOT_EXIST.msg} | 下分异常 | 没有代理记录`);
                await changePlayerMoney_redis_dao_1.default.del(agent, account);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.AGENT_ERROR.status } };
            }
            const record = await ThirdGoldRecord_mysql_dao_1.default.findOne({ orderId: orderid });
            if (record) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ORDERID_EXIST.msg} | 下分异常 | 已有记录`);
                await changePlayerMoney_redis_dao_1.default.del(agent, account);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.ORDERID_EXIST.status } };
            }
            const player = await Player_manager_1.default.findOne({ thirdUid: account, groupRemark: agent }, true);
            if (!player) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ACCOUNT_GET_LOSE.msg} | 下分异常 | 没有玩家`);
                await changePlayerMoney_redis_dao_1.default.del(agent, account);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.ACCOUNT_GET_LOSE.status } };
            }
            let gold = 0;
            if (money) {
                gold = -Math.floor(Math.abs(money) * MiddlewareEnum.MONEY_BATE.HUNDRED);
            }
            else {
                gold = -Math.floor(player.gold);
            }
            if (gold < 0 && player.gold < Math.abs(gold)) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.MONEY_BALANCE.msg} | 下分异常 | 金币不足 ${gold}/${player.gold}`);
                await changePlayerMoney_redis_dao_1.default.del(agent, account);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.MONEY_BALANCE.status } };
            }
            let body = {
                uid: player.uid,
                account: account,
            };
            let isCanLower = true;
            await axios_1.default.post(`http://127.0.0.1:3324/rpc/lowerPlayerMoney`, body, { timeout: 2000 })
                .then((resp) => {
                if (resp.data && resp.data.code == 500) {
                    isCanLower = false;
                }
            })
                .catch((error) => {
                console.error(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},检测玩家是否在游戏中请求超时,依然通过下分法则`);
            });
            if (!isCanLower) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ACCOUNT_PLAYING.msg} | 下分异常 | 玩家在游戏中`);
                await changePlayerMoney_redis_dao_1.default.del(agent, account);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.ACCOUNT_PLAYING.status } };
            }
            if (player.gold === 0) {
                await changePlayerMoney_redis_dao_1.default.del(agent, account);
                return {
                    s: 103,
                    m: "/lowerPlayerMoney",
                    d: {
                        code: MiddlewareEnum.SUCCESS.status,
                        account: account,
                        money: 0,
                    }
                };
            }
            this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag two`);
            const beBoolean = await this.warningOrderService.checkLowerMoney(player, money, account, orderid, platformInfo, agent, timestamp);
            if (typeof beBoolean === "object") {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent},money:${Math.abs(gold)} | 金币预警`);
                await changePlayerMoney_redis_dao_1.default.del(agent, account);
                return beBoolean;
            }
            player.gold += gold;
            if (player.earlyWarningFlag) {
                player.earlyWarningFlag = false;
            }
            player.addDayTixian += Math.abs(gold);
            player.addDayTixian = Math.floor(player.addDayTixian);
            this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag three`);
            await queryRunner.connect();
            await queryRunner.startTransaction();
            await queryRunner.manager.update(Player_entity_1.Player, { uid: player.uid }, {
                gold: player.gold,
                position: PositionEnum_1.PositionEnum.HALL,
                earlyWarningFlag: player.earlyWarningFlag,
                oneWin: 0,
                oneAddRmb: 0,
                addDayTixian: Math.floor(player.addDayTixian)
            });
            this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag four`);
            if (Math.round(Date.now() / 1000) - requestStartTime >= 6) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} | 超时回滚`);
                await queryRunner.rollbackTransaction();
                await queryRunner.release();
                await changePlayerMoney_redis_dao_1.default.del(agent, account);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.Request_Timeout.status } };
            }
            await queryRunner.commitTransaction();
            await queryRunner.release();
            PlayerAgent_mysql_dao_1.default.updateAddForThirdApi(platformInfo.platformName, {
                gold: Math.abs(gold),
            });
            const recordInfo = {
                orderId: orderid,
                uid: player.uid,
                type: ThirdGoldRecordType_enum_1.ThirdGoldRecordType.Player,
                agentRemark: agent,
                goldChangeBefore: Math.floor(player.gold - gold),
                gold: gold,
                goldChangeAfter: Math.floor(player.gold),
                status: ThirdGoldRecordStatus_enum_1.ThirdGoldRecordStatus.AutoPass,
                remark: "自动通过"
            };
            const gameInfo = {
                uid: player.uid,
                nid: MiddlewareEnum.THIRD_ADD_GOLD.LOWERNID,
                gameName: MiddlewareEnum.THIRD_ADD_GOLD.LOWERNAME,
                groupRemark: player.groupRemark,
                thirdUid: player.thirdUid,
                group_id: player.group_id ? player.group_id : null,
                sceneId: -1,
                roomId: '-1',
                input: 0,
                bet_commission: 0,
                win_commission: 0,
                settle_commission: 0,
                profit: gold,
                gold: player.gold,
                status: 1,
                gameOrder: orderid
            };
            this.addPlayerRecord(recordInfo, gameInfo);
            await Player_redis_dao_1.default.updateOne({ uid: player.uid }, {
                gold: player.gold,
                oneWin: 0,
                oneAddRmb: 0,
                addDayTixian: player.addDayTixian
            });
            this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent},money:${Math.abs(gold)}`);
            await changePlayerMoney_redis_dao_1.default.del(agent, account);
            this.thirdHttp_call.warn(`发送第三方给玩家下分 :删除在线uid :${player.uid}`);
            return {
                s: 103,
                m: "/lowerPlayerMoney",
                d: {
                    code: MiddlewareEnum.SUCCESS.status,
                    account: account,
                    money: Math.abs(gold),
                    lastGold: player.gold
                }
            };
        }
        catch (error) {
            this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent},异常情况:${error} | 下分异常`);
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            await changePlayerMoney_redis_dao_1.default.del(agent, account);
            return Promise.reject(error);
        }
    }
    async queryOrderId(orderid) {
        const record = await ThirdGoldRecord_mysql_dao_1.default.findOne({ orderId: orderid });
        if (!record) {
            return {
                s: 104,
                m: "/queryOrderId",
                d: { code: MiddlewareEnum.ORDERID_NOT_EXIST.status, status: MiddlewareEnum.THIRD_ORDERID_TYPE.EXIST }
            };
        }
        return {
            s: 104,
            m: "/queryOrderId",
            d: { code: MiddlewareEnum.SUCCESS.status, status: MiddlewareEnum.THIRD_ORDERID_TYPE.SUCCESS }
        };
    }
    async checkOrderId(orderid, agent, timestamp, account) {
        const checkId = agent + Utils.getDateNumber(timestamp) + account;
        if (checkId != orderid) {
            return false;
        }
        return true;
    }
    async findPlayerOnline(agent, account, timestamp) {
        const player = await Player_manager_1.default.findOne({ thirdUid: account, groupRemark: agent }, true);
        if (!player) {
            return {
                s: 105,
                m: "/findPlayerOnline",
                d: { code: MiddlewareEnum.SUCCESS.status, status: MiddlewareEnum.PLAYER_ONLIE_TYPE.EXIST }
            };
        }
        if (player.closeTime > new Date()) {
            return {
                s: 105,
                m: "/findPlayerOnline",
                d: { code: MiddlewareEnum.ACCOUNT_CLOSE.status, status: MiddlewareEnum.PLAYER_ONLIE_TYPE.CLOSE }
            };
        }
        const online = await OnlinePlayer_redis_dao_1.default.findOne({ uid: player.uid });
        if (!online) {
            return {
                s: 105,
                m: "/findPlayerOnline",
                d: { code: MiddlewareEnum.SUCCESS.status, status: MiddlewareEnum.PLAYER_ONLIE_TYPE.NOT_ONLINE }
            };
        }
        return {
            s: 105,
            m: "/findPlayerOnline",
            d: { code: MiddlewareEnum.SUCCESS.status, status: MiddlewareEnum.PLAYER_ONLIE_TYPE.ONLINE }
        };
    }
    async queryPlayerGold(agent, account, timestamp) {
        const player = await Player_manager_1.default.findOne({ thirdUid: account, groupRemark: agent }, true);
        if (!player) {
            return {
                s: 106,
                m: "/queryPlayerGold",
                d: {
                    code: MiddlewareEnum.SUCCESS.status,
                    status: MiddlewareEnum.PLAYER_ONLIE_TYPE.NOT_ONLINE,
                    totalMoney: Math.floor(0),
                    freeMoney: Math.floor(0),
                    account: account
                }
            };
        }
        if (player.closeTime > new Date()) {
            return {
                s: 106,
                m: "/queryPlayerGold",
                d: { code: MiddlewareEnum.ACCOUNT_CLOSE.status, status: MiddlewareEnum.PLAYER_ONLIE_TYPE.CLOSE }
            };
        }
        let status = MiddlewareEnum.PLAYER_ONLIE_TYPE.NOT_ONLINE;
        return {
            s: 106,
            m: "/queryPlayerGold",
            d: {
                code: MiddlewareEnum.SUCCESS.status,
                status: status,
                totalMoney: Math.floor(player.gold),
                freeMoney: Math.floor(player.gold),
                account: account
            }
        };
    }
    async kickPlayer(agent, account, timestamp) {
        try {
            const player = await Player_manager_1.default.findOne({ thirdUid: account, groupRemark: agent }, true);
            if (!player) {
                return { s: 107, m: "/kickPlayer", d: { code: MiddlewareEnum.ACCOUNT_GET_LOSE.status } };
            }
            if (player.closeTime > new Date()) {
                return {
                    s: 107,
                    m: "/kickPlayer",
                    d: { code: MiddlewareEnum.ACCOUNT_CLOSE.status, status: MiddlewareEnum.PLAYER_ONLIE_TYPE.CLOSE }
                };
            }
            let body = {
                uid: player.uid,
                account: account,
            };
            let isCanLower = true;
            await axios_1.default.post(`http://127.0.0.1:3324/rpc/lowerPlayerMoney`, body, { timeout: 2000 })
                .then((resp) => {
                if (resp.data && resp.data.code == 500) {
                    isCanLower = false;
                }
            })
                .catch((error) => {
                console.error(`踢玩家下线 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},检测玩家是否在游戏中请求超时,依然踢下线`);
            });
            if (!isCanLower) {
                return { s: 107, m: "/kickPlayer", d: { code: MiddlewareEnum.ACCOUNT_PLAYING.status } };
            }
            return { s: 107, m: "/kickPlayer", d: { code: MiddlewareEnum.SUCCESS.status } };
        }
        catch (error) {
            return { s: 107, m: "/kickPlayer", d: { code: MiddlewareEnum.ACCOUNT_PLAYING.status } };
        }
    }
    async getPlatformData(agent, startTime, endTime) {
        try {
            const platformUid = await PlatformNameAgentList_redis_dao_1.default.findPlatformUidForAgent({ agent: agent });
            if (!platformUid) {
                return { s: 108, m: "/getPlatformData", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
            }
            const dyadicArray = await DateTime2GameRecord_service_1.default.newBreakUpDate(startTime, endTime);
            let tableName = moment().format("YYYYMM");
            const total = await TenantGameData_mysql_dao_1.default.getOnePlatformGameData(dyadicArray, agent, tableName, platformUid);
            let list = [];
            for (let key of total) {
                let item = list.find(x => x.groupRemark == key.groupRemark);
                if (!item) {
                    list.push(key);
                }
                else {
                    item.recordCount = Number(item.recordCount) + Number(key.recordCount);
                    item.validBetTotal = Number(item.validBetTotal) + Number(key.validBetTotal);
                    item.winCount = Number(item.winCount) + Number(key.winCount);
                    item.winTotal = Number(item.winTotal) + Number(key.winTotal);
                    item.loseTotal = Number(item.loseTotal) + Number(key.loseTotal);
                    item.profitTotal = Number(item.profitTotal) + Number(key.profitTotal);
                    item.bet_commissionTotal = Number(item.bet_commissionTotal) + Number(key.bet_commissionTotal);
                    item.win_commissionTotal = Number(item.win_commissionTotal) + Number(key.win_commissionTotal);
                    item.settle_commissionTotal = Number(item.settle_commissionTotal) + Number(key.settle_commissionTotal);
                    const index = list.findIndex(x => x.groupRemark == key.groupRemark);
                    list.splice(index, 1);
                    list.push(item);
                }
            }
            const res = list.map((info) => {
                const { recordCount, winCount, profitTotal, validBetTotal, bet_commissionTotal, win_commissionTotal, settle_commissionTotal } = info;
                const winRate2 = validBetTotal > 0 ? (-profitTotal / validBetTotal).toFixed(4) : 0;
                const commission = Math.floor(Number(bet_commissionTotal) + Number(win_commissionTotal) + Number(settle_commissionTotal));
                delete info.bet_commissionTotal;
                delete info.win_commissionTotal;
                delete info.settle_commissionTotal;
                info.profitTotal = -profitTotal;
                return Object.assign({ winRate2, loseCount: recordCount - winCount, commission }, info);
            });
            let info = {
                recordCount: 0,
                validBetTotal: 0,
                winCount: 0,
                winTotal: 0,
                loseTotal: 0,
                loseCount: 0,
                profitTotal: 0,
                commission: 0,
                winRate2: 0,
                groupRemark: agent,
                startTime: moment(startTime).format("YYYY-MM-DD HH:mm:ss"),
                endTime: moment(endTime).format("YYYY-MM-DD HH:mm:ss"),
            };
            if (!res || res.length == 0) {
                return { s: 108, m: "/getPlatformData", d: { code: MiddlewareEnum.SUCCESS.status, result: info } };
            }
            for (let item of res) {
                if (item) {
                    info.recordCount += Number(item.recordCount);
                    info.validBetTotal += Number(item.validBetTotal);
                    info.winCount += Number(item.winCount);
                    info.winTotal += Number(item.winTotal);
                    info.loseTotal += Number(item.loseTotal);
                    info.loseCount += Number(item.loseCount);
                    info.profitTotal += Number(item.profitTotal);
                    info.commission += Number(item.commission);
                }
            }
            info.winRate2 = Number(info.validBetTotal > 0 ? (-info.profitTotal / info.validBetTotal).toFixed(4) : 0);
            return { s: 109, m: "/getPlatformData", d: { code: MiddlewareEnum.SUCCESS.status, result: info } };
        }
        catch (error) {
            return { s: 108, m: "/getPlatformData", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
        }
    }
    async addPlayerRecord(thirdRecord, gameRecord) {
        await ThirdGoldRecord_mysql_dao_1.default.insertOne(thirdRecord);
        await GameRecordDateTable_mysql_dao_1.default.insertOne(gameRecord);
    }
};
ThirdService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [goldCoinChangeWarningOrder_service_1.GoldCoinChangeWarningOrderService])
], ThirdService);
exports.ThirdService = ThirdService;
function getSql(parameter) {
    const date = moment().format("YYYYMM");
    let tableName = `Sp_GameRecord_${date}`;
    if (parameter.group_id) {
        tableName = `Sp_GameRecord_${parameter.group_id}_${date}`;
    }
    const { uid, thirdUid, nid, gameName, sceneId, roomId, roundId, gameType, input, validBet, profit, bet_commission, win_commission, settle_commission, gameOrder, gold, status, multiple, groupRemark, isDealer, result, game_Records_live_result } = parameter;
    const gameResult = game_Records_live_result ? `'${JSON.stringify(game_Records_live_result)}'` : null;
    const sql = `
            INSERT INTO ${tableName} 
            ( 
                uid, thirdUid, gameName, groupRemark, game_id, 
                sceneId, roomId,  round_id, gameType,
                isDealer, game_results, gold, input, validBet, 
                profit,  bet_commission, win_commission, 
                settle_commission, multiple, game_order_id, status, createTimeDate,
                game_Records_live_result
            )
            VALUES
            ( 
                "${uid}", ${thirdUid ? `"${thirdUid}"` : null}, "${gameName}", ${groupRemark ? `"${groupRemark}"` : null}, "${nid}", 
                ${sceneId}, "${roomId}", ${roundId ? `"${roundId}"` : null}, ${gameType ? gameType : null},
                ${isDealer ? isDealer : false}, ${result ? `"${result}"` : null}, ${gold}, ${input}, ${validBet ? validBet : 0}, 
                ${profit},  ${bet_commission ? bet_commission : 0}, ${win_commission ? win_commission : 0}, 
                ${settle_commission ? settle_commission : 0}, ${multiple ? multiple : 0}, "${gameOrder}", ${status ? status : 0}, NOW(), 
                ${gameResult}
            )            `;
    return sql;
}
const delay = (seconds) => new Promise(resolve => setTimeout(resolve, seconds));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhpcmQuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL25lc3RIdHRwL2xpYi90aGlyZC9zZXJ2aWNlL3RoaXJkLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTRDO0FBQzVDLHdGQUFnRjtBQUNoRiwwRUFBMkU7QUFDM0Usb0dBQTRGO0FBQzVGLGlIQUF3RztBQUN4RyxtR0FBMEY7QUFDMUYseUdBQWdHO0FBQ2hHLGlHQUF3RjtBQUN4Riw2REFBOEQ7QUFDOUQsb0RBQXFEO0FBQ3JELDZEQUE4RDtBQUM5RCxxRkFBa0Y7QUFDbEYsb0lBQTRIO0FBQzVILDZGQUE2RjtBQUM3Riw2RkFBeUY7QUFDekYsdUZBQWdGO0FBQ2hGLHdGQUE4RTtBQUM5RSxtSEFBMkc7QUFDM0csdUhBQStHO0FBQy9HLDZHQUFvRztBQUNwRyx1RkFBOEU7QUFDOUUsaUNBQWlDO0FBQ2pDLHVHQUF5RjtBQUN6RixxSEFBNEc7QUFDNUcsaUdBQXdGO0FBRXhGLDZGQUFzRjtBQUN0RixpQ0FBMEI7QUFDMUIsK0VBQWtGO0FBQ2xGLG9GQUE0RTtBQUM1RSxpQ0FBbUQ7QUFDbkQsZ0RBQTRDO0FBSTVDLElBQWEsWUFBWSxHQUF6QixNQUFhLFlBQVk7SUFHckIsWUFDcUIsbUJBQXNEO1FBQXRELHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBbUM7UUFFdkUsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFBLGlCQUFTLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsNEJBQTRCLEdBQUcsSUFBQSxpQkFBUyxFQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDM0UsQ0FBQztJQU1ELEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBYSxFQUFFLEtBQWEsRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFHLFFBQWdCLEVBQUUsUUFBZSxFQUFFLFlBQXFCLEtBQUssRUFBRSxX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