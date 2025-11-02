import RoomStandAlone from "./Room";
import SlotMachinePlayer from "../../../common/classes/game/slotMachinePlayer";

/**
 * 冰球突破玩家
 * @property profit 收益
 * @property totalBet 总押注
 * @property baseBet 基础押注
 * @property lineNum 押注倍率
 * @property newer 是否是新玩家
 * @property isBigWin 是否中大奖
 * @property status  是否开始游玩 1: 待机 2：在玩
 * @property roundId  回合id
 */
export default class Player extends SlotMachinePlayer {
    profit: number = 0;
    totalBet: number = 0;
    baseBet: number = 0;
    lineNum: number = 0;
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
        this.lineNum = 0;
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
     * @param lineNum 押注倍率
     */
    bet(baseBet: number, lineNum: number) {
        this.baseBet = baseBet;
        this.lineNum = lineNum;
        this.totalBet = baseBet * lineNum;
        this.gold -= this.totalBet;
    }

    /**
     * 检查是否金币不足
     * @param baseBet 基础押注
     * @param lineNum 选线数量
     */
    isLackGold(baseBet: number, lineNum: number): boolean {
        return this.gold < baseBet * lineNum;
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
     * 小游戏玩家结算
     * @param playerRealWin 真实赢取
     * @param gold 数据库金币
     */
    littleGameSettlement(playerRealWin: number, gold: number) {
        this.gold = gold;
    }


    /**
     * 构造开奖结果
     * @param result
     */
    buildGameLiveResult( result: string) {
        return {
            uid: this.uid,
            result,
            baseBet: this.baseBet,
            lineNum: this.lineNum,
        }
    }
}