import RoomStandAlone from "./Room";
import SlotMachinePlayer from "../../../common/classes/game/slotMachinePlayer";
import {AWARD_LINE_COUNT, OrchardGameElementType, SubGameType} from "./constant";
import {ElementsEnum} from "./config/elemenets";
import {genOrchardGameWindow} from "./util/lotteryUtil";

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
 * halloween玩家
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
 * @property orchardGameWindow  果园小游戏窗口
 * @property clayPotGameBonusCount 陶罐小游戏倍数计数
 * @property orchardProfit 果园收益
 * @property orchardGameResults 果园开奖记录
 */
export default class Player extends SlotMachinePlayer {
    profit: number = 0;
    totalBet: number = 0;
    baseBet: number = 0;
    lineNumber: number = AWARD_LINE_COUNT;
    room: RoomStandAlone;
    record: InternalRecord = { totalWin: 0, totalBet: 0, recordCount: 0, nextUse: '3', time: 0};
    gameRound: number = 0;
    newer: boolean = false;
    isBigWin: boolean = false;
    winPercentage: number = 0;
    subGameType: SubGameType = null;
    status: 1 | 2 = 1;
    roundId: string;
    lastOperationTime: number = Date.now();
    clayPotGameBonusCount: number = 1;
    orchardGameWindow: {type: OrchardGameElementType, open: boolean}[] = [];
    orchardProfit: number = 0;
    orchardGameResults: OrchardGameElementType[] = [];

    constructor(opts: any, room: RoomStandAlone) {
        super(opts);
        this.room = room;
    }

    /**
     * 初始化玩家数据
     */
    init() {
        this.profit = 0;
        this.totalBet = 0;
        this.baseBet = 0;
        this.isBigWin = false;
        this.subGameType = null;
        this.clayPotGameBonusCount = 1;
        this.orchardProfit = 0;
        this.orchardGameResults = [];
        this.initControlType();
    }

    /**
     * 设置小游戏类型
     * @param type
     */
    setSubGameType(type: SubGameType) {
        this.subGameType = type;

        if (type === ElementsEnum.Witch) {
            this.orchardGameWindow = genOrchardGameWindow();
        }
    }

    /**
     * 设置为该元素已经打开
     * @param index
     */
    orchardGameOpen(index: number) {
        this.orchardGameWindow[index].open = true;
    }

    /**
     * 设置回合id
     * @param roundId
     */
    setRoundId(roundId: string) {
        this.roundId = roundId;
    }

    /**
     * 押注
     * @param baseBet
     */
    bet(baseBet: number) {
        this.baseBet = baseBet;
        this.totalBet = baseBet * this.lineNumber;
        this.lastOperationTime = Date.now();
    }

    /**
     * 检查是否金币不足
     */
    isLackGold(baseBet: number) {
        return this.gold < baseBet * this.lineNumber;
    }

    /**
     * 玩家结算
     */
    settlement(playerRealWin: number, gold: number) {
        // 总接口变动 玩家返回的是纯利润 但是收益是需加上毛利润的故这里加上押注额
        const win = this.subGameType === null ? this.totalBet + playerRealWin : playerRealWin;
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
            result,
        }
    }
}

