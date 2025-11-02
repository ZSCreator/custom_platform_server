import SlotMachinePlayer from "../../../common/classes/game/slotMachinePlayer";

/**
 * 刮刮乐玩家
 */
export default class Player extends SlotMachinePlayer {
    bet: number;
    jackpotId: number;
    profit: number;
    roundId: string;

    constructor(opts: any) {
        super(opts);
    }

    /**
     * 设置押注
     * @param bet 押注额
     * @param jackpotId 开奖类型
     */
    setBetAndJackpotId(bet: number, jackpotId: number) {
        this.bet = bet;
        this.jackpotId = jackpotId;
        this.gold -= bet;
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
     * 结算
     * @param profit 收益
     * @param gold 数据金币
     */
    settlement(profit: number, gold) {
        this.gold = gold;
        this.profit = profit;
    }

    /**
     * 构造开奖结果
     * @param result
     */
    buildGameLiveResult(result: string) {
        return {
            uid: this.uid,
            result,
        }
    }
}