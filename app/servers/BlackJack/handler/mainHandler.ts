import { Application, BackendSession, Logger, pinus } from 'pinus';
import { getLogger } from 'pinus-logger';
import { sessionInfo } from "../../../services/sessionService";
import { ApiResult } from '../../../common/pojo/ApiResult';
import { unlock } from "../../../common/dao/redis/lib/redisManager";
import { BlackJackState } from '../../../common/systemState/blackJack.state';
import { BlackJackRoomStatusEnum } from '../lib/enum/BlackJackRoomStatusEnum';
import { RoleEnum } from '../../../common/constant/player/RoleEnum';
import { BlackJackPlayerStatusEnum } from '../lib/enum/BlackJackPlayerStatusEnum';
import { BlackJackPlayerRoleEnum } from '../lib/enum/BlackJackPlayerRoleEnum';
import langsrv = require('../../../services/common/langsrv');
// import { BlackJackDynamicRoomManager } from "../lib/BlackJackDynamicRoomManager";
import roomManager, { BlackJackTenantRoomManager } from "../lib/BlackJackTenantRoomManager";

export default function (app: Application) {
    return new mainHandler(app);
};

export class mainHandler {

    private logger: Logger

    private backendServerId: string;

    roomManager: BlackJackTenantRoomManager

    constructor(private app: Application) {
        this.logger = getLogger('server_out', __filename);

        this.backendServerId = pinus.app.getServerId();

        this.roomManager = roomManager;
    }

    /**
     * 进入房间后加载游戏当前运行数据
     */
    async loaded({ }, session: BackendSession) {
        const { uid, roomId, sceneId } = sessionInfo(session);
        let language = null;
        try {

            // 校验房间实例是否运行
            // const roomInfo = BlackJackRoomManagerImpl.Instance().getRoomInfo(roomId);
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);

            if (!roomInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 加载房间信息 | 未查询到房间实例`);

                return new ApiResult(BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1201));
            }

            // 校验房间实例里是否加载玩家
            const playerInfo = roomInfo.getPlayer(uid);

            if (!playerInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 加载房间信息 | 未查询到玩家实例`);

                return new ApiResult(BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1201));
            }
            language = playerInfo.language;
            const reuslt = roomInfo.getRoomInfoAfterEntryRoom(uid);


            return ApiResult.SUCCESS(reuslt, langsrv.getlanguage(language, langsrv.Net_Message.id_1701));
        } catch (e) {

            this.logger.error(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 加载房间信息 | 出错: ${e.stack}`);
            return ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1201));
        }
    }

    /**
     * 加倍
     */
    async addMultiple({ areaIdx }, session: BackendSession) {
        const { uid, roomId, sceneId } = sessionInfo(session);
        let language = null;
        try {
            // 校验房间实例是否运行
            // const roomInfo = BlackJackRoomManagerImpl.Instance().getRoomInfo(roomId);
            const roomInfo = this.roomManager.searchRoom(sceneId,roomId);

            if (!roomInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 加倍 | 未查询到房间实例`);

                return new ApiResult(BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1201));
            }

            // 校验房间实例里是否加载玩家
            const player = roomInfo.getPlayer(uid);
            language = player.language;
            if (!player) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 加倍 | 未查询到玩家实例`);

                return new ApiResult(BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1201));
            }

            // 当前区域是否已分牌 如果分牌过后就不能进行加倍
            if (player.commonAreaBetList[areaIdx].checkHadSeparate()) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 当前区域 ${areaIdx} 已分过牌`);

                return new ApiResult(BlackJackState.Had_Separate, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1708));
            }
            const {
                playerHadAction,
                continueAction,
                actionComplete
            } = roomInfo.playerSeparateBeginning && roomInfo.players.filter(p =>
                p.status === BlackJackPlayerStatusEnum.Game && p.role === BlackJackPlayerRoleEnum.Player && p.getCurrentTotalBet() > 0
            ).every(p => p.commonAreaBetList[areaIdx].actionComplete) ?
                    player.separateAreaBetList[areaIdx] :
                    player.commonAreaBetList[areaIdx];

            if (playerHadAction || !continueAction || actionComplete) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 加倍 | 已进行其他操作,不能再加倍`);
                return new ApiResult(BlackJackState.Can_Not_Multiple, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1703));
            }

            const apiResultOrTrue = roomInfo.multiple(areaIdx, uid);

            if (apiResultOrTrue instanceof ApiResult) {
                return apiResultOrTrue;
            }

            return ApiResult.SUCCESS();
        } catch (e) {
            this.logger.error(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 加倍 | 出错 | ${e.stack}`);

            return ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1702));
        }
    }

    /**
     * 分牌
     */
    async separatePoker({ areaIdx }, session: BackendSession) {

        const { uid, roomId, sceneId } = sessionInfo(session);
        let language = null;
        try {
            // 校验参数是否合法
            if (typeof areaIdx !== "number" || ![0, 1, 2].includes(areaIdx)) {

                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 异常: 参数不合法 areaIdx:${areaIdx} `);

                return new ApiResult(BlackJackState.Parameter_Valida_Fail, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1702));
            }

            // 校验房间实例是否运行
            // const roomInfo = BlackJackRoomManagerImpl.Instance().getRoomInfo(roomId);
            const roomInfo = this.roomManager.searchRoom(sceneId,roomId);

            if (!roomInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 未查询到房间实例`);

                return new ApiResult(BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1705));
            }

            // 校验房间实例里是否加载玩家
            const player = roomInfo.getPlayer(uid);

            if (!player) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 未查询到玩家实例`);

                return new ApiResult(BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1706));
            }
            language = player.language;

            // 当前区域是否可以分牌
            if (!player.commonAreaBetList[areaIdx].canPlayerSeparate()) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 当前区域 ${areaIdx} 不可分牌`);

                return new ApiResult(BlackJackState.Can_Not_Separate, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1707));
            }

            // 当前区域是否已分牌
            if (player.commonAreaBetList[areaIdx].checkHadSeparate()) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 当前区域 ${areaIdx} 已分过牌`);

                return new ApiResult(BlackJackState.Had_Separate, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1708));
            }

            // 分牌金额等于当前区域下注额 * 2
            if (player.gold < player.totalBet + player.commonAreaBetList[areaIdx].getCurrentBet()) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 当前区域 ${areaIdx} 携带金币不足`);

                return new ApiResult(BlackJackState.Player_Gold_Not_Enough, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1015));
            }

            const isApiResult = roomInfo.separate(areaIdx, uid);

            if (isApiResult instanceof ApiResult) {

                return isApiResult;
            }
            return ApiResult.SUCCESS(null, "分牌成功");
        } catch (e) {
            this.logger.error(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 分牌 | 出错: ${e.stack}`);
            return ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1709));
        }
    }

    /**
     * 要牌
     */
    async getOnePoker({ areaIdx }, session: BackendSession) {

        const { uid, roomId, sceneId, isRobot } = sessionInfo(session);
        let language = null;
        try {
            // 校验参数是否合法
            if (typeof areaIdx !== "number" || ![0, 1, 2].includes(areaIdx)) {

                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 要牌 | 异常: 参数不合法 areaIdx:${areaIdx} `);

                return new ApiResult(BlackJackState.Parameter_Valida_Fail, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1704));
            }

            // 校验房间实例是否运行
            // const roomInfo = BlackJackRoomManagerImpl.Instance().getRoomInfo(roomId);
            const roomInfo = this.roomManager.searchRoom(sceneId,roomId);

            if (!roomInfo) {
                if (isRobot === RoleEnum.REAL_PLAYER)
                    this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 要牌 | 未查询到房间实例`);

                return new ApiResult(BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1705));
            }

            // 校验房间实例里是否加载玩家
            const player = roomInfo.getPlayer(uid);
            // language = player.language;
            if (!player) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 要牌 | 未查询到玩家实例`);

                return new ApiResult(BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1706));
            }

            const beSeparatePokerArea = roomInfo.playerSeparateBeginning && roomInfo.players.filter(p => p.status === BlackJackPlayerStatusEnum.Game && p.role === BlackJackPlayerRoleEnum.Player && p.commonAreaBetList[areaIdx].getCurrentBet() > 0).every(p => p.commonAreaBetList[areaIdx].actionComplete);

            const { pokerList } = beSeparatePokerArea ? player.separateAreaBetList[areaIdx].getPokerAndCount() : player.commonAreaBetList[areaIdx].getPokerAndCount();

            if (pokerList.length === 5) {
                return new ApiResult(BlackJackState.Room_status_Not_Allow_Hit, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1710));
            }

            const apiResultOrTrue = roomInfo.playerHitWithNew(uid, areaIdx);

            if (apiResultOrTrue instanceof ApiResult) {
                return apiResultOrTrue;
            }

            return ApiResult.SUCCESS(null, "要牌成功");
        } catch (e) {

            this.logger.error(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 要牌 | 出错: ${e.stack}`);
            return ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1711));
        }
    }

    /**
     * 下注
     * @param areaIdx   下注区域
     * @param bet       下注金额
     */
    async bet({ areaIdx, bet }, session: BackendSession) {

        const { uid, roomId, sceneId, isRobot } = sessionInfo(session);
        let language = null;
        try {

            // 校验参数是否合法
            if ((typeof areaIdx !== "number" || typeof bet !== "number") || (![0, 1, 2].includes(areaIdx) || bet <= 0)) {

                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 下注 | 异常: 参数不合法 areaIdx:${areaIdx} - bet:${bet}`);

                return new ApiResult(BlackJackState.Parameter_Valida_Fail, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1704));
            }

            // 校验房间实例是否运行
            // const roomInfo = BlackJackRoomManagerImpl.Instance().getRoomInfo(roomId);
            const roomInfo = this.roomManager.searchRoom(sceneId,roomId);

            if (!roomInfo) {

                if (isRobot !== RoleEnum.ROBOT)
                    this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 下注 | 未查询到房间实例`);

                return new ApiResult(BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1705));
            }

            // 校验房间实例里是否加载玩家
            const playerInfo = roomInfo.getPlayer(uid);

            if (!playerInfo) {
                if (isRobot !== RoleEnum.ROBOT)
                    this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 下注 | 未查询到玩家实例`);

                return new ApiResult(BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1706));
            }
            language = playerInfo.language;
            playerInfo.update_time();
            const hadBeBet = playerInfo.getCurrentTotalBet();

            // 校验玩家金币是否够下注
            if (bet + hadBeBet > playerInfo.gold) {
                if (playerInfo.isRobot === RoleEnum.REAL_PLAYER)
                    this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 下注: ${bet} | 携带金币不足`);

                return new ApiResult(BlackJackState.Player_Gold_Not_Enough, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1015));
            }

            /** 针对机器人 限制 */
            if (playerInfo.isRobot === RoleEnum.ROBOT) {

                if (roomInfo.commonBetListForRobot[areaIdx] > roomInfo.commonMaxBetListForRobot[areaIdx]) {
                    return ApiResult.SUCCESS();
                }

                roomInfo.commonBetListForRobot[areaIdx] += bet;
            }

            // 指定区域加注 => 公共区域和玩家独立区域
            const beApiResult = roomInfo.bet(areaIdx, bet, uid);

            if (beApiResult instanceof ApiResult) {
                return beApiResult;
            }

            const playerAfterBet = roomInfo.getPlayer(uid);

            const {
                nickname,
                seatNum,
                headurl,
            } = playerAfterBet;

            return ApiResult.SUCCESS({
                nickname,
                seatNum,
                headurl,
                sceneId,
                gold: playerAfterBet.getCurrentGold()
            }, langsrv.getlanguage(language, langsrv.Net_Message.id_1715));
        } catch (e) {
            this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 下注: ${bet} | 出错: ${e.stack}`);
            return ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1712));
        }
    }

    /**
     * 保险
     */
    async insurance({ areaIdx }, session: BackendSession) {

        const { uid, roomId, sceneId } = sessionInfo(session);
        let language = null;
        try {
            // 校验参数是否合法
            if (typeof areaIdx !== "number" || ![0, 1, 2].includes(areaIdx)) {

                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 保险 | 异常: 参数不合法 areaIdx:${areaIdx} `);

                return new ApiResult(BlackJackState.Parameter_Valida_Fail, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1704));
            }

            // 校验房间实例是否运行
            // const roomInfo = BlackJackRoomManagerImpl.Instance().getRoomInfo(roomId);
            const roomInfo = this.roomManager.searchRoom(sceneId,roomId);

            if (!roomInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 保险 | 未查询到房间实例`);

                return new ApiResult(BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1705));
            }

            // 校验房间实例里是否加载玩家
            const player = roomInfo.getPlayer(uid);

            if (!player) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 保险 | 未查询到玩家实例`);

                return new ApiResult(BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1706));
            }
            language = player.language;
            const bet = player.getCurrentTotalBet();

            // 校验玩家金币是否够买保险
            if (bet * 1.5 > player.gold) {
                if (player.isRobot === RoleEnum.REAL_PLAYER)
                    this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 保险: ${bet * 0.5} | 携带金币不足`);

                return new ApiResult(BlackJackState.Player_Gold_Not_Enough, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1015));
            }

            // 指定区域购买保险
            const beApiResult = roomInfo.insurance(areaIdx, uid);

            if (beApiResult instanceof ApiResult) {
                return beApiResult;
            }

            const playerAfterInsurance = roomInfo.getPlayer(uid);

            const {
                nickname,
                seatNum,
                headurl,
                commonAreaBetList,
                insuranceAreaList,
            } = playerAfterInsurance;

            return ApiResult.SUCCESS({
                nickname,
                seatNum,
                headurl,
                gold: playerAfterInsurance.getCurrentGold(),
                commonAreaList: commonAreaBetList.map(area => {
                    return {
                        bet: area.getCurrentBet(),
                        ...area.getPokerAndCount()
                    }
                }),
                insuranceAreaList: insuranceAreaList.map(area => {
                    return {
                        bet: area.getBet(),
                        hadBuyInsurance: area.checkBuyInsurance()
                    }
                })
            }, langsrv.getlanguage(language, langsrv.Net_Message.id_1716));
        } catch (e) {
            this.logger.error(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 保险 | 出错: ${e.stack}`);
            return ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1713));
        }
    }

    /**
     * 续押
     */
    async continueBet({ }, session: BackendSession) {

        const { uid, roomId, sceneId } = sessionInfo(session);
        let language = null;
        try {
            // 校验房间实例是否运行
            // const roomInfo = BlackJackRoomManagerImpl.Instance().getRoomInfo(roomId);
            const roomInfo =this.roomManager.searchRoom(sceneId,roomId);

            if (!roomInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 续押 | 未查询到房间实例`);

                return new ApiResult(BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1704));
            }

            // 校验房间实例里是否加载玩家
            const playerInfo = roomInfo.getPlayer(uid);

            if (!playerInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 续押 | 未查询到玩家实例`);

                return new ApiResult(BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1705));
            }
            language = playerInfo.language
            if (playerInfo.getCurrentTotalBet() > 0) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 续押 | 已下过注，不能续押`);

                return new ApiResult(BlackJackState.Can_Not_ContinueBet, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1717));
            }

            if (!playerInfo.betHistory.some(bet => bet > 0)) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 续押 | 没有下注记录，无法续押`);

                return new ApiResult(BlackJackState.Can_Not_ContinueBet, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1718));
            }

            const beApiResult = roomInfo.continueBet(uid);

            if (beApiResult instanceof ApiResult) {
                return beApiResult;
            }
            const playerAfterBet = roomInfo.getPlayer(uid);

            const {
                nickname,
                seatNum,
                headurl,
            } = playerAfterBet;

            return ApiResult.SUCCESS({
                nickname,
                seatNum,
                headurl,
                sceneId,
                gold: playerAfterBet.getCurrentGold()
            }, langsrv.getlanguage(language, langsrv.Net_Message.id_1719));
        } catch (e) {
            this.logger.error(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 续押 | 出错: ${e.stack}`);
            return ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1714));
        }
    }

    /**
     * 获取排行榜列表
     */
    async rankingList({ }, session: BackendSession) {

        const { uid, roomId, sceneId } = sessionInfo(session);
        let language = null;
        try {

            // 校验房间实例是否运行
            // const roomInfo = BlackJackRoomManagerImpl.Instance().getRoomInfo(roomId);
            const roomInfo = this.roomManager.searchRoom(sceneId,roomId);

            if (!roomInfo) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 获取排行榜列表 | 未查询到房间实例`);

                return new ApiResult(BlackJackState.Not_Find_Room, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1704));
            }

            // 校验房间实例里是否加载玩家
            const player = roomInfo.getPlayer(uid);
            if (!player) {
                this.logger.warn(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 获取排行榜列表 | 未查询到玩家实例`);

                return new ApiResult(BlackJackState.Not_Find_Player, null, langsrv.getlanguage(language, langsrv.Net_Message.id_1705));
            }
            language = player.language;
            let reuslt = roomInfo.rankinglist();
            let firstPlayer;

            if (reuslt.length > 0) {
                firstPlayer = reuslt[0];
                const otherPlayerList = reuslt.slice(1).sort((a, b) => b.gold - a.gold);
                reuslt = [firstPlayer, ...otherPlayerList];
            }


            return ApiResult.SUCCESS(reuslt, langsrv.getlanguage(language, langsrv.Net_Message.id_1720));
        } catch (e) {

            this.logger.error(`${this.backendServerId} | 玩家: ${uid} | 场: ${sceneId} | 房间: ${roomId} | 获取排行榜列表 | 出错: ${e.stack}`);
            return ApiResult.ERROR(null, langsrv.getlanguage(language, langsrv.Net_Message.id_1721));
        }
    }

}
