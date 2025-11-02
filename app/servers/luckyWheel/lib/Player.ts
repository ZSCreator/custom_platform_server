import RoomStandAlone from "./Room";
import SlotMachinePlayer from "../../../common/classes/game/slotMachinePlayer";
import {Elements} from "./constant";

/**
 * 幸运转盘玩家
 * @property profit 收益
 * @property totalBet 总押注
 * @property gameRound 玩家回合
 * @property newer 是否是新玩家
 * @property isBigWin 是否中大奖
 * @property roundId 回合id
 */
export default class Player extends SlotMachinePlayer {
    profit: number = 0;
    totalBet: number = 0;
    room: RoomStandAlone;
    gameRound: number = 0;
    newer: boolean = false;
    isBigWin: boolean = false;
    roundId: string;

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
        this.isBigWin = false;
        this.initControlType();
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
        this.totalBet = baseBet;
        this.gold -= this.totalBet;
    }

    /**
     * 检查是否金币不足
     */
    isLackGold(baseBet: number) {
        return this.gold < baseBet;
    }

    /**
     * 玩家结算
     * @param playerRealWin 真实赢取
     * @param gold 数据库金币
     */
    settlement(playerRealWin: number, gold: number) {
        this.gold = gold ;
        this.profit = playerRealWin;

        // 每次初始化回合游戏回合加1
        this.gameRound++;
    }


    /**
     * 构造实况结果
     * @param record 记录
     * @param result 开奖结果
     */
    buildLiveRecord(record: string, result: Elements) {
        return {
            uid: this.uid,
            lotteryResult: result,
            result: record,
        }
    }
}