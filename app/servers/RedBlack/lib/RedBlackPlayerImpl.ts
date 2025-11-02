import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import * as mailModule from '../../../modules/mailModule';
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import { bankerRoundLimit, betArea } from './RedBlackConst';
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import RedBlackRoom from "./RedBlackRoom";
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';

/**
 * 红黑大战玩家类
 * @property totalBet 记录进入房间后的20回合押注
 * @property bankerProfit 当庄收益
 * @property bankerCount 当庄多少回合
 * @property isBanker是否为庄
 * @property quitBanker 是否强制下庄
 * @property totalBet 记录进入房间后的20回合押注
 * @property validBet 有效押注
 * @property lastProfit 上局收益
 * @property betAreas 玩家当局下注
 * @property offlineCount 掉线后进行了多少回合
 * @property firstEnTime 玩家首次进入房间时间
 * @property online 是否在线
 */
export default class RedBlackPlayerImpl extends PlayerInfo {
    /**回合盈利 */
    profit: number = 0;
    /**进入房间的总盈利 */
    totalProfit: number[] = [];
    /**回合总下注 */
    bet: number = 0;
    /**进入房间总下注 */
    totalBet: number[] = [];

    /**下注 结算情况，计算用 */
    bets: { [area: string]: { bet: number, profit: number } } = {};

    // online: boolean = true;
    firstEnTime: number = Date.now();
    offlineCount: number = 0;
    betAreas: { [area: string]: number } = {};
    // lastProfit: number = 0;
    validBet: number = 0;
    quitBanker: boolean = false;
    isBanker: boolean = false;
    bankerCount: number = 0;
    bankerProfit: number = 0;
    roundCount: number = 0;                          // 游戏进行的回合数
    winRound: number = 0;                            // 赢得次数
    controlState: CommonControlState = CommonControlState.RANDOM;  // 随机;
    /**待机轮数 */
    standbyRounds = 0;
    /**保留初始化金币 */
    initgold: number = 0;
    constructor(opts, roomInfo: RedBlackRoom) {
        super(opts);
        this.initgold = this.gold;
    }

    /**每开始一回合初始化一些信息 */
    async roundPlayerInit() {
        this.initControlType();
        this.standbyRounds++;
        if (this.bet > 0) {
            this.totalBet.push(this.bet);
            this.totalProfit.push(this.profit);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
            this.standbyRounds = 0;
        }

        this.validBet = 0;
        this.profit = 0;
        this.bet = 0;
        this.bets = {};
        this.betAreas = {};
        this.controlState = CommonControlState.RANDOM;
        this.winRound = this.totalProfit.reduce((total, Value) => {
            if (Value > 0) {
                total++;
            }
            return total;
        }, 0);
    }

    // 玩家当庄
    setBanker() {
        this.isBanker = true;
        this.bankerCount += 1;
    }

    // 玩家下庄
    clearBanker() {
        this.isBanker = false;
        this.bankerCount = 0;
        this.bankerProfit = 0;
        this.quitBanker = false;
    }

    /**玩家离线回来 */
    upOnlineTrue() {
        this.onLine = true;
        this.offlineCount = 0;
    }
    /**是否在线 */
    isOnline() {
        return this.onLine;
    }

    /**玩家下注记录 */
    betHistory(area: string, gold: number) {
        this.bet += gold;
        if (!this.betAreas[area])
            this.betAreas[area] = 0;
        this.betAreas[area] += gold;

        if (!this.bets[area])
            this.bets[area] = { bet: 0, profit: 0 };
        this.bets[area].bet += gold;
    }

    // 玩家有效押注
    validBetCount(betNumber: number) {
        this.validBet = betNumber;
    }

    /**玩家加钱 */
    async addGold(roomInfo: RedBlackRoom, winArea, settlement_info) {
        // 添加游戏记录以及更新玩家金币
        const res = await createPlayerRecordService()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setGameRecordInfo(Math.abs(this.bet), Math.abs(this.validBet), this.profit - this.bet, false)
            .addResult(roomInfo.zipResult)
            .setControlType(this.controlType)
            .setGameRecordLivesResult(this.buildResult(winArea, settlement_info))
            .sendToDB(1);

        this.gold = res.gold;
        this.initgold = this.gold;
        this.profit = res.playerRealWin;
        if (this.isBanker) this.bankerProfit += res.playerRealWin;
    }

    // 包装玩家
    strip() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            totalProfit: this.totalProfit,
            firstEnTime: this.firstEnTime,
            bet: this.bet,
            robot: this.isRobot,
        }
    }

    // 充值时候提示的包装
    topUpStrip() {
        return {
            uid: this.uid,
            gold: this.gold
        }
    }

    // 获取上庄列表时的包装
    bankerStrip() {
        return {
            uid: this.uid,
            gold: this.gold,
            headurl: this.headurl,
            nickname: this.nickname,
            remainingRound: bankerRoundLimit - this.bankerCount
        }
    }


    /**
     * 构建开奖结果
     * @param winArea
     * @param settlement_info
     */
    buildResult(winArea, settlement_info) {
        let settleDetails = {};

        for (let area in this.bets) {
            settleDetails[area] = { win: this.bets[area].profit - this.bets[area].bet, bet: this.bets[area].bet }
        }

        return this.isBanker ? {
            uid: this.uid,
            isBanker: this.isBanker,
            win: this.profit,
            settlement_info
        } : {
            uid: this.uid,
            isBanker: this.isBanker,
            area: settleDetails,
            settlement_info
        };
    }

    /**
     * 设置玩家调控状态
     */
    setControlState(params: { state: CommonControlState }): void {
        this.controlState = params.state;
    }

    /**
     * 检查是否押注超限
     */
    checkOverrunBet(params: { condition: number }): object {
        let transfiniteArea = {}, transfiniteCondition = params.condition * 100;
        if (transfiniteCondition === 0) return transfiniteArea;

        for (let area in this.betAreas) {
            if (this.betAreas[area] >= transfiniteCondition) {
                transfiniteArea[area] = this.betAreas[area];
            }
        }

        return transfiniteArea;
    }

    /**
     * 过滤掉被杀的区域
     * @param params
     */
    filterBetNum(params: { areas: Set<string> }) {
        let bet = 0;

        for (let area in this.betAreas) {
            if (params.areas.has(area)) {
                continue;
            }

            bet += this.betAreas[area];
        }

        return bet;
    }
}
