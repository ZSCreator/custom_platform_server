import RoomStandAlone from "./Room";
import { calculateGameLevel } from "./util/lotteryUtil";
import SlotMachinePlayer from "../../../common/classes/game/slotMachinePlayer";



/**
 * 糖果派对玩家
 * @property profit 收益
 * @property totalBet 总押注
 * @property baseBet 基础押注
 * @property betOdds 押注倍率
 * @property newer 是否是新玩家
 * @property isBigWin 是否中大奖
 * @property bonusGameProfit bonus小游戏收益
 * @property gameLevel 当前所处游戏等级
 * @property roundId  回合id
 */
export default class Player extends SlotMachinePlayer {
    profit: number = 0;
    totalBet: number = 0;
    baseBet: number = 0;
    // betOdds: number = 0;
    room: RoomStandAlone;
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
        this.baseBet = 0;
        this.isBigWin = false;
        // this.betOdds = 0;
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
     * @param baseBet 基础押注
     * @param betOdds 押注倍率
     */
    bet(baseBet: number,) {
        this.baseBet = baseBet;
        // this.betOdds = betOdds;
        this.totalBet = baseBet;
        this.gold -= this.totalBet;
        // this.littleGameAccumulate += this.totalBet * 0.13;
    }

    /**
     * 检查是否金币不足
     * @param baseBet 基础押注
     * @param betOdds 押注倍率
     */
    isLackGold(baseBet: number): boolean {
        return this.gold < baseBet;
    }

    /**
     * 玩家结算
     * @param playerRealWin 真实赢取
     * @param gold 数据库金币
     */
    settlement(playerRealWin: number, gold: number) {
        this.gold = gold;
        this.profit = playerRealWin;
    }


    /**
     * 构造开奖结果
     * @param result
     */
    buildGameLiveResult(result: string) {
        return {
            uid: this.uid,
            result,
            baseBet: this.baseBet,
            // betOdds: this.betOdds,
        }
    }
}