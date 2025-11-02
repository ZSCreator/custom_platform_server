import RoomStandAlone from "./room";
import SlotMachinePlayer from "../../../common/classes/game/slotMachinePlayer";
import {BoTimes, DEFAULT_LINE_NUM, PlayerGameState} from "./constant";
import {SlotResult} from "./util/lotteryUtil";

/**
 * 玩家玩耍记录
 * @property totalWin 玩家累积盈利
 * @property totalBet 玩家累积押注
 * @property recordCount 记录的次数
 * @property nextUse 轮盘
 * @property time 最后一次轮盘使用时间
 */
interface InternalRecord {
    totalWin: number,
    totalBet: number,
    recordCount: number,
    nextUse: '1' | '2' | '3',
    time: number
}

/**
 * 桑巴嘉年华玩家
 * @property profit 收益
 * @property totalBet 总押注
 * @property baseBet 基础押注
 * @property lineNumber 选择线
 * @property record 玩家玩耍记录
 * @property gameRound 玩家回合
 * @property newer 是否是新玩家
 * @property isBigWin 是否中大奖
 * @property winPercentage 输赢比
 * @property status  是否开始游玩 1: 待机 2：在玩
 * @property roundId  回合id
 * @property lastOperationTime  最后操作时间
 * @property result  开奖结果
 * @property gameState 游戏状态
 * @property disCards 弃牌堆
 * @property boTimes 博一博的次数
 * @property boProfit 博一博收益
 * @baseGold baseGold 入场金币
 * @baseGold freeOdds 免费游戏倍数
 * @baseGold freeProfit 免费游戏收益
 */
export default class Player extends SlotMachinePlayer {
    readonly baseGold: number = 0;
    profit: number = 0;
    totalBet: number = 0;
    baseBet: number = 0;
    lineNumber: number = 0;
    room: RoomStandAlone;
    record: InternalRecord = { totalWin: 0, totalBet: 0, recordCount: 0, nextUse: '3', time: 0};
    gameRound: number = 0;
    newer: boolean = false;
    isBigWin: boolean = false;
    winPercentage: number = 0;
    status: 1 | 2 = 1;
    roundId: string;
    lastOperationTime: number = Date.now();
    result: SlotResult;
    gameState: PlayerGameState = PlayerGameState.NORMAL;
    disCards: number[] = [];
    boTimes: number = BoTimes;
    boProfit: number = 0;
    freeOdds: number = 0;
    freeProfit: number  =0;


    constructor(opts: any, room: RoomStandAlone) {
        super(opts);
        this.room = room;
        this.baseGold = opts.gold;
    }

    /**
     * 初始化玩家数据
     */
    init() {
        this.profit = 0;
        this.totalBet = 0;
        this.baseBet = 0;
        this.lineNumber = 0;
        this.isBigWin = false;
        this.result = null;
        this.disCards = [];
        this.boTimes = BoTimes;
        this.boProfit = 0;
        this.freeProfit  = 0;
        this.initControlType();
    }

    /**
     * 设置免费游戏信息
     * @param odds
     */
    setFreeInfo(odds: number) {
        this.freeOdds = odds;
        this.freeProfit = this.totalBet * odds;
    }

    /**
     * 获取盈利
     */
    getNetProfit() {
        return this.baseGold - this.gold;
    }

    /**
     * 设置免费游戏状态
     */
    setFreeState() {
        console.warn('设置免费游戏状态', this.uid);
        this.gameState = PlayerGameState.FREE;
    }

    /**
     * 设置正常状态
     */
    setNormalState() {
        console.warn('设置正常游戏状态', this.uid);
        this.gameState = PlayerGameState.NORMAL;
    }

    /**
     * 设置博一博状态
     */
    setBoState() {
        console.warn('设置博一博游戏状态', this.uid);
        this.gameState = PlayerGameState.BO;
    }

    /**
     * 设置开奖结果
     * @param result
     */
    setResult(result: SlotResult) {
        this.result = result;
        this.profit = result.totalWin;
    }

    /**
     * 设置回合id
     * @param roundId
     */
    setRoundId(roundId: string) {
        this.roundId = roundId;
    }

    /**
     * 设置博一博结果
     * @param card
     * @param profit
     */
    setBoResult(card: number, profit: number) {
        this.boProfit = profit - this.profit;
        this.disCards.push(card);
    }

    /**
     * 减少博一博次数
     */
    reduceBoTimes() {
        this.boTimes--;
    }

    /**
     * 押注
     * @param baseBet
     */
    bet(baseBet: number) {
        this.baseBet = baseBet;
        this.lineNumber = DEFAULT_LINE_NUM;
        this.totalBet = baseBet * DEFAULT_LINE_NUM;
        this.lastOperationTime = Date.now();
        this.gold -= this.totalBet;
    }

    /**
     * 检查是否金币不足
     */
    isLackGold(baseBet: number) {
        return this.gold < baseBet * DEFAULT_LINE_NUM;
    }

    /**
     * 玩家结算
     */
    settlement(playerRealWin: number, gold: number) {
        // 总接口变动 玩家返回的是纯利润 但是收益是需加上毛利润的故这里加上押注额
        const win = this.totalBet + playerRealWin;
        this.profit = win;
        this.record.totalWin += win;
        this.gold = gold;

        this.record.totalBet += this.totalBet;

        // 此轮spin结束时间
        this.record.time = Date.now();
        // 每次初始化回合游戏回合加1
        this.gameRound++;

        // 累加recordCount的次数
        this.record.recordCount++;

        // 计算输赢比
        this.winPercentage = this.record.totalWin / this.record.totalBet;

        // 如果输赢比 大于 0.9 清空累积盈利 以及record 次数
        if (this.winPercentage > 0.9) {
            this.record.recordCount = 0;
            this.record.totalWin = 0;
            this.record.totalBet = 0;
        }
    }

    /**
     * 构造实况结果
     * @param result
     */
    buildLiveRecord(result: string) {
        return {
            uid: this.uid,
            baseBet: this.baseBet,
            lineNumber: this.lineNumber,
            result,
        }
    }
}