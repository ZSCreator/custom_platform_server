"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const pinus_1 = require("pinus");
const pinus_logger_1 = require("pinus-logger");
const sessionService_1 = require("../../../services/sessionService");
const ApiResult_1 = require("../../../common/pojo/ApiResult");
const blackJack_state_1 = require("../../../common/systemState/blackJack.state");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const BlackJackPlayerStatusEnum_1 = require("../lib/enum/BlackJackPlayerStatusEnum");
const BlackJackPlayerRoleEnum_1 = require("../lib/enum/BlackJackPlayerRoleEnum");
const langsrv = require("../../../services/common/langsrv");
const BlackJackTenantRoomManager_1 = require("../lib/BlackJackTenantRoomManager");
function default_1(app) {
    return new mainHandler(app);
}
exports.default = default_1;
;
class mainHandler {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
        this.backendServerId = pinus_1.pinus.app.getServerId();
        this.roomManager = BlackJackTenantRoomManager_1.default;
    }
    async loaded({}, session) {
        const { uid, roomId, sceneId } = (0, sessionService_1.sessionInfo)(session);
        let language = null;
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 加载房间信息 | 未查询到房间实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1201));
            }
            const playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 加载房间信息 | 未查询到玩家实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1201));
            }
            language = playerInfo.language;
            const reuslt = roomInfo.getRoomInfoAfterEntryRoom(uid);
            return ApiResult_1.ApiResult.SUCCESS(reuslt, langsrv.getlanguage(language, langsrv.Net_Message.id_1701));
        }
        catch (e) {
            this.logger.error(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 加载房间信息 | 出错: ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1201));
        }
    }
    async addMultiple({ areaIdx }, session) {
        const { uid, roomId, sceneId } = (0, sessionService_1.sessionInfo)(session);
        let language = null;
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 加倍 | 未查询到房间实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1201));
            }
            const player = roomInfo.getPlayer(uid);
            language = player.language;
            if (!player) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 加倍 | 未查询到玩家实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1201));
            }
            if (player.commonAreaBetList[areaIdx].checkHadSeparate()) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 当前区域 ${areaIdx} 已分过牌`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Had_Separate, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1708));
            }
            const { playerHadAction, continueAction, actionComplete } = roomInfo.playerSeparateBeginning && roomInfo.players.filter(p => p.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game && p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player && p.getCurrentTotalBet() > 0).every(p => p.commonAreaBetList[areaIdx].actionComplete) ?
                player.separateAreaBetList[areaIdx] :
                player.commonAreaBetList[areaIdx];
            if (playerHadAction || !continueAction || actionComplete) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 加倍 | 已进行其他操作,不能再加倍`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Can_Not_Multiple, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1703));
            }
            const apiResultOrTrue = roomInfo.multiple(areaIdx, uid);
            if (apiResultOrTrue instanceof ApiResult_1.ApiResult) {
                return apiResultOrTrue;
            }
            return ApiResult_1.ApiResult.SUCCESS();
        }
        catch (e) {
            this.logger.error(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 加倍 | 出错 | ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1702));
        }
    }
    async separatePoker({ areaIdx }, session) {
        const { uid, roomId, sceneId } = (0, sessionService_1.sessionInfo)(session);
        let language = null;
        try {
            if (typeof areaIdx !== "number" || ![0, 1, 2].includes(areaIdx)) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 异常: 参数不合法 areaIdx:${areaIdx} `);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Parameter_Valida_Fail, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1702));
            }
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 未查询到房间实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1705));
            }
            const player = roomInfo.getPlayer(uid);
            if (!player) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 未查询到玩家实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1706));
            }
            language = player.language;
            if (!player.commonAreaBetList[areaIdx].canPlayerSeparate()) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 当前区域 ${areaIdx} 不可分牌`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Can_Not_Separate, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1707));
            }
            if (player.commonAreaBetList[areaIdx].checkHadSeparate()) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 当前区域 ${areaIdx} 已分过牌`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Had_Separate, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1708));
            }
            if (player.gold < player.totalBet + player.commonAreaBetList[areaIdx].getCurrentBet()) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 当前区域 ${areaIdx} 携带金币不足`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Player_Gold_Not_Enough, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1015));
            }
            const isApiResult = roomInfo.separate(areaIdx, uid);
            if (isApiResult instanceof ApiResult_1.ApiResult) {
                return isApiResult;
            }
            return ApiResult_1.ApiResult.SUCCESS(null, "分牌成功");
        }
        catch (e) {
            this.logger.error(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 出错: ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1709));
        }
    }
    async getOnePoker({ areaIdx }, session) {
        const { uid, roomId, sceneId, isRobot } = (0, sessionService_1.sessionInfo)(session);
        let language = null;
        try {
            if (typeof areaIdx !== "number" || ![0, 1, 2].includes(areaIdx)) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 要牌 | 异常: 参数不合法 areaIdx:${areaIdx} `);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Parameter_Valida_Fail, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1704));
            }
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                if (isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                    this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 要牌 | 未查询到房间实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1705));
            }
            const player = roomInfo.getPlayer(uid);
            if (!player) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 要牌 | 未查询到玩家实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1706));
            }
            const beSeparatePokerArea = roomInfo.playerSeparateBeginning && roomInfo.players.filter(p => p.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game && p.role === BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player && p.commonAreaBetList[areaIdx].getCurrentBet() > 0).every(p => p.commonAreaBetList[areaIdx].actionComplete);
            const { pokerList } = beSeparatePokerArea ? player.separateAreaBetList[areaIdx].getPokerAndCount() : player.commonAreaBetList[areaIdx].getPokerAndCount();
            if (pokerList.length === 5) {
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Room_status_Not_Allow_Hit, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1710));
            }
            const apiResultOrTrue = roomInfo.playerHitWithNew(uid, areaIdx);
            if (apiResultOrTrue instanceof ApiResult_1.ApiResult) {
                return apiResultOrTrue;
            }
            return ApiResult_1.ApiResult.SUCCESS(null, "要牌成功");
        }
        catch (e) {
            this.logger.error(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 要牌 | 出错: ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1711));
        }
    }
    async bet({ areaIdx, bet }, session) {
        const { uid, roomId, sceneId, isRobot } = (0, sessionService_1.sessionInfo)(session);
        let language = null;
        try {
            if ((typeof areaIdx !== "number" || typeof bet !== "number") || (![0, 1, 2].includes(areaIdx) || bet <= 0)) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 下注 | 异常: 参数不合法 areaIdx:${areaIdx} - bet:${bet}`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Parameter_Valida_Fail, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1704));
            }
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                if (isRobot !== RoleEnum_1.RoleEnum.ROBOT)
                    this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 下注 | 未查询到房间实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1705));
            }
            const playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                if (isRobot !== RoleEnum_1.RoleEnum.ROBOT)
                    this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 下注 | 未查询到玩家实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1706));
            }
            language = playerInfo.language;
            playerInfo.update_time();
            const hadBeBet = playerInfo.getCurrentTotalBet();
            if (bet + hadBeBet > playerInfo.gold) {
                if (playerInfo.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                    this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 下注: ${bet} | 携带金币不足`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Player_Gold_Not_Enough, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1015));
            }
            if (playerInfo.isRobot === RoleEnum_1.RoleEnum.ROBOT) {
                if (roomInfo.commonBetListForRobot[areaIdx] > roomInfo.commonMaxBetListForRobot[areaIdx]) {
                    return ApiResult_1.ApiResult.SUCCESS();
                }
                roomInfo.commonBetListForRobot[areaIdx] += bet;
            }
            const beApiResult = roomInfo.bet(areaIdx, bet, uid);
            if (beApiResult instanceof ApiResult_1.ApiResult) {
                return beApiResult;
            }
            const playerAfterBet = roomInfo.getPlayer(uid);
            const { nickname, seatNum, headurl, } = playerAfterBet;
            return ApiResult_1.ApiResult.SUCCESS({
                nickname,
                seatNum,
                headurl,
                sceneId,
                gold: playerAfterBet.getCurrentGold()
            }, langsrv.getlanguage(language, langsrv.Net_Message.id_1715));
        }
        catch (e) {
            this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 下注: ${bet} | 出错: ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1712));
        }
    }
    async insurance({ areaIdx }, session) {
        const { uid, roomId, sceneId } = (0, sessionService_1.sessionInfo)(session);
        let language = null;
        try {
            if (typeof areaIdx !== "number" || ![0, 1, 2].includes(areaIdx)) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 保险 | 异常: 参数不合法 areaIdx:${areaIdx} `);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Parameter_Valida_Fail, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1704));
            }
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 保险 | 未查询到房间实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1705));
            }
            const player = roomInfo.getPlayer(uid);
            if (!player) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 保险 | 未查询到玩家实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1706));
            }
            language = player.language;
            const bet = player.getCurrentTotalBet();
            if (bet * 1.5 > player.gold) {
                if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                    this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 保险: ${bet * 0.5} | 携带金币不足`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Player_Gold_Not_Enough, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1015));
            }
            const beApiResult = roomInfo.insurance(areaIdx, uid);
            if (beApiResult instanceof ApiResult_1.ApiResult) {
                return beApiResult;
            }
            const playerAfterInsurance = roomInfo.getPlayer(uid);
            const { nickname, seatNum, headurl, commonAreaBetList, insuranceAreaList, } = playerAfterInsurance;
            return ApiResult_1.ApiResult.SUCCESS({
                nickname,
                seatNum,
                headurl,
                gold: playerAfterInsurance.getCurrentGold(),
                commonAreaList: commonAreaBetList.map(area => {
                    return Object.assign({ bet: area.getCurrentBet() }, area.getPokerAndCount());
                }),
                insuranceAreaList: insuranceAreaList.map(area => {
                    return {
                        bet: area.getBet(),
                        hadBuyInsurance: area.checkBuyInsurance()
                    };
                })
            }, langsrv.getlanguage(language, langsrv.Net_Message.id_1716));
        }
        catch (e) {
            this.logger.error(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 保险 | 出错: ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1713));
        }
    }
    async continueBet({}, session) {
        const { uid, roomId, sceneId } = (0, sessionService_1.sessionInfo)(session);
        let language = null;
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 续押 | 未查询到房间实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1704));
            }
            const playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 续押 | 未查询到玩家实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1705));
            }
            language = playerInfo.language;
            if (playerInfo.getCurrentTotalBet() > 0) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 续押 | 已下过注，不能续押`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Can_Not_ContinueBet, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1717));
            }
            if (!playerInfo.betHistory.some(bet => bet > 0)) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 续押 | 没有下注记录，无法续押`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Can_Not_ContinueBet, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1718));
            }
            const beApiResult = roomInfo.continueBet(uid);
            if (beApiResult instanceof ApiResult_1.ApiResult) {
                return beApiResult;
            }
            const playerAfterBet = roomInfo.getPlayer(uid);
            const { nickname, seatNum, headurl, } = playerAfterBet;
            return ApiResult_1.ApiResult.SUCCESS({
                nickname,
                seatNum,
                headurl,
                sceneId,
                gold: playerAfterBet.getCurrentGold()
            }, langsrv.getlanguage(language, langsrv.Net_Message.id_1719));
        }
        catch (e) {
            this.logger.error(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 续押 | 出错: ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1714));
        }
    }
    async rankingList({}, session) {
        const { uid, roomId, sceneId } = (0, sessionService_1.sessionInfo)(session);
        let language = null;
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 获取排行榜列表 | 未查询到房间实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1704));
            }
            const player = roomInfo.getPlayer(uid);
            if (!player) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 获取排行榜列表 | 未查询到玩家实例`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1705));
            }
            language = player.language;
            let reuslt = roomInfo.rankinglist();
            let firstPlayer;
            if (reuslt.length > 0) {
                firstPlayer = reuslt[0];
                const otherPlayerList = reuslt.slice(1).sort((a, b) => b.gold - a.gold);
                reuslt = [firstPlayer, ...otherPlayerList];
            }
            return ApiResult_1.ApiResult.SUCCESS(reuslt, langsrv.getlanguage(language, langsrv.Net_Message.id_1720));
        }
        catch (e) {
            this.logger.error(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 获取排行榜列表 | 出错: ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1721));
        }
    }
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9CbGFja0phY2svaGFuZGxlci9tYWluSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBbUU7QUFDbkUsK0NBQXlDO0FBQ3pDLHFFQUErRDtBQUMvRCw4REFBMkQ7QUFFM0QsaUZBQTZFO0FBRTdFLHVFQUFvRTtBQUNwRSxxRkFBa0Y7QUFDbEYsaUZBQThFO0FBQzlFLDREQUE2RDtBQUU3RCxrRkFBNEY7QUFFNUYsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBQUEsQ0FBQztBQUVGLE1BQWEsV0FBVztJQVFwQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVsRCxJQUFJLENBQUMsZUFBZSxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFL0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxvQ0FBVyxDQUFDO0lBQ25DLENBQUM7SUFLRCxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUcsRUFBRSxPQUF1QjtRQUNyQyxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFBLDRCQUFXLEVBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEQsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUk7WUFJQSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFOUQsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDWCxJQUFJLENBQUMsTUFBTSxDQUFD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