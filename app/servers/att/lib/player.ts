import RoomStandAlone from "./room";
import {GameState} from "./attConst";
import SlotMachinePlayer from "../../../common/classes/game/slotMachinePlayer";

const GAMBLE_MAX = 5;

/**
 * 皇家连环炮玩家
 * @property profit 收益
 * @property totalBet 总押注
 * @property baseBet 基础押注
 * @property roundCount 回合计数
 * @property roundRecords 回合记录
 * @property gameState 游戏状态
 * @property gambleCount 搏一搏次数
 * @property foldCards 弃牌堆
 * @property cards 初始化牌
 * @property status  是否开始游玩 1: 待机 2：在玩
 * @property boRecords  博一搏记录 color 选择的花色 card 开牌结果 profit 收益 multiple 倍数
 */
export default class Player extends SlotMachinePlayer {
    profit: number = 0;
    totalBet: number = 0;
    baseBet: number = 0;
    roundCount: number = 0;
    roundRecords: any[] = [];
    gameState: GameState = GameState.Init;
    gambleCount: number = 0;
    foldCards: number[] = [];
    cards: number[] = [];
    room: RoomStandAlone;
    roundId: string;
    retainCards: number[] = [];
    cardsList: {bupais: number[], id: number, gain: number, king: number, cards: number[]}[] = [];
    boRecords: {color: number, card: number, profit: number, multiple: number}[] = [];

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
        this.roundCount = 0;
        this.cards = [];
        this.roundRecords = [];
        this.gameState = GameState.Init;
        this.gambleCount = GAMBLE_MAX;
        this.foldCards = [];
        this.retainCards = [];
        this.cardsList = [];
        this.boRecords = [];
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
     * 设置收益
     * @param profit
     */
    setProfit(profit: number) {
        this.profit = profit;
    }

    /**
     * 次数减一
     */
    gambleCountMinusOne() {
        this.gambleCount--;
    }

    /**
     * 设置状态为搏一搏状态
     */
    setAgainState() {
        this.gameState = GameState.Again;
    }

    /**
     * 转换保留牌
     * @param retainIndexList
     */
    conversionRetainCards(retainIndexList: number[]) {
        this.retainCards = this.cards.filter((m, i) => retainIndexList.indexOf(i) !== -1);
    }


    /**
     * 押注
     * @param baseBet
     * @param roundCount
     */
    bet(baseBet: number, roundCount: number) {
        this.baseBet = baseBet;
        this.roundCount = roundCount;
        this.totalBet = baseBet * roundCount;

        // 显示金币暂时扣除
        this.gold -= this.totalBet;
    }

    /**
     * 检查是否金币不足
     */
    isLackGold(baseBet: number, roundCount: number) {
        return this.gold < baseBet * roundCount;
    }

    /**
     * 玩家结算
     */
    settlement(playerRealWin: number, gold: number) {
        this.gold = gold;
        this.profit = playerRealWin;
    }

    buildLiveRecord(record: string) {
        return {
            uid: this.uid,
            result: record
        }
    }
}