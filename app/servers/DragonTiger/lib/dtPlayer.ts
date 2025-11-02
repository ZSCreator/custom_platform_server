import utils = require('../../../utils/index');
import DragonTigerConst = require('./DragonTigerConst');
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import { bankerRoundLimit } from './DragonTigerConst';
import { getLogger } from 'pinus-logger';
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import dtRoom from "./dtRoom";
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';


export default class dtplayer extends PlayerInfo {
    /**回合盈利 */
    profit: number = 0;
    /**进入房间的总盈利 */
    totalProfit: number[] = [];
    /**当局下注 */
    bet: number = 0;
    /**回合总下注 */
    totalBet: number[] = [];
    /**续押注 */
    recordBets: { area: string, bet: number }[] = [];
    /**玩家当局下注记录 */
    bets: { [area: string]: { bet: number, profit: number } } = {};
    /**玩家首次进入房间的消息 */
    firstEnTime: number = new Date().getTime();
    /**掉线后进行了多少回合 */
    offlineCount: number = 0;
    /**是否为庄 */
    isBanker: boolean = false;
    /**当庄多少回合 */
    bankerCount: number = 0;
    /**当庄收益 */
    bankerProfit: number = 0;
    /**是否强制下庄 */
    quitBanker: boolean = false;
    /**上局收益 */
    lastProfit: number = 0;
    /**有效押注 */
    validBet: number = 0;
    winRound: number = 0;                                // 赢得次数
    controlState: CommonControlState;
    /**待机轮数 */
    standbyRounds = 0;
    /**保留初始化金币 */
    initgold: number = 0;
    constructor(opts: any, room: dtRoom) {
        super(opts);
        this.gold = opts.gold;                // 金币
        this.controlState = CommonControlState.RANDOM;
        this.initgold = this.gold;
    }

    // 每开始一回合初始化一些信息 vip积分也需要重新获取
    roundPlayerInit(roomInfo: dtRoom) {
        this.standbyRounds++;
        if (this.bet) {
            this.standbyRounds = 0;
            this.totalProfit.push(this.profit);
            this.totalBet.push(this.bet);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
            this.winRound = this.totalProfit.reduce((total, Value) => {
                if (Value > 0) {
                    total++;
                }
                return total;
            }, 0);
        }
        if (roomInfo.bankerQueue.find(c => c.uid == this.uid)) {
            this.standbyRounds = 0;
        }
        if (this.bet > 0) {
            this.recordBets = [];
            for (const area in this.bets) {
                this.recordBets.push({ area: area, bet: this.bets[area].bet });
            }
        }
        this.lastProfit = this.bet > 0 ? this.profit : 0;
        this.validBet = 0;
        this.profit = 0;
        this.bet = 0;
        this.bets = {};
        this.controlState = CommonControlState.RANDOM;
        this.initControlType();
    }

    /**玩家离线回来 */
    upOnlineTrue() {
        this.onLine = true;
        this.offlineCount = 0;
    }

    /**玩家当庄 */
    setBanker() {
        this.isBanker = true;
        this.bankerCount = DragonTigerConst.bankerRoundLimit;
    }

    /**玩家下庄 */
    clearBanker() {
        this.isBanker = false;
        this.bankerCount = 0;
        this.bankerProfit = 0;
        this.quitBanker = false;
    }


    /**如果结算的时候玩家是掉线的添加一个离线回合技术 */
    addOffLineCount() {
        this.offlineCount += 1;
    }

    /**玩家下注记录 */
    betHistory(area: string, betGold: number) {
        this.bet += betGold;
        if (!this.bets[area]) this.bets[area] = { bet: 0, profit: 0 };
        this.bets[area].bet += betGold;
    }

    /**玩家有效押注以及双向流水值 */
    validBetCount(betNumber: number) {
        this.validBet = betNumber;
    }

    /**玩家加钱 */
    async addGold(roomInfo: dtRoom, winArea: string[]) {
        // 添加游戏记录以及更新玩家金币
        const res = await createPlayerRecordService()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setControlType(this.controlType)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setGameRecordInfo(Math.abs(this.bet), Math.abs(this.validBet), this.profit, this.isBanker)
            .setGameRecordLivesResult(this.buildResult(roomInfo, winArea))
            .sendToDB(1);
        this.gold = res.gold;
        this.profit = res.playerRealWin;
        this.initgold = this.gold;

        if (this.isBanker) {
            this.bankerProfit += res.playerRealWin;
        }
    }

    /**包装玩家 */
    strip() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold - this.bet,
            profit: this.profit,
            robot: this.isRobot,
            bet: this.bet,
        }
    }

    /**获取上庄列表时的包装 */
    bankerStrip() {
        return {
            uid: this.uid,
            gold: this.gold,
            headurl: this.headurl,
            nickname: this.nickname,
            remainingRound: bankerRoundLimit - this.bankerCount
        }
    }

    /**获取玩家列表时的包装 */
    stripOne() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            winRound: this.winRound,
            totalBet: utils.sum(this.totalBet),
        }
    }

    /**
     * 构建开奖结果
     * @param winArea
     */
    buildResult(roomInfo: dtRoom, winArea: string[]) {
        let settleDetails: { [area: string]: { bet: number, win: number } } = {};
        if (this.isBanker) {
            settleDetails = roomInfo.BankSettleDetails;
        } else {
            for (let area in this.bets) {
                settleDetails[area] = { win: this.bets[area].profit, bet: this.bets[area].bet };
            }
        }
        const opts = {
            uid: this.uid,
            isBanker: this.isBanker,
            result: roomInfo.result,
            settlement_info: winArea,
            area: settleDetails,
            win: this.profit,
        }
        return opts;
    }

    /**
     * 检查是否押注超限
     */
    checkOverrunBet(params: { condition: number }): object {
        let transfiniteArea: { [area: string]: number } = {}, transfiniteCondition = params.condition * 100;
        if (transfiniteCondition === 0) return transfiniteArea;

        for (let area in this.bets) {
            if (this.bets[area].bet >= transfiniteCondition) {
                transfiniteArea[area] = this.bets[area].bet;
            }
        }

        return transfiniteArea;
    }

    /**
     * 设置玩家调控状态
     */
    setControlState(params: { state: CommonControlState }): void {
        this.controlState = params.state;
    }

    /**
     * 过滤掉被杀的区域
     * @param params
     */
    filterBetNum(params: { areas: Set<string> }) {
        let bet = 0;

        for (let area in this.bets) {
            if (params.areas.has(area)) {
                continue;
            }

            bet += this.bets[area].bet;
        }

        return bet;
    }
}


