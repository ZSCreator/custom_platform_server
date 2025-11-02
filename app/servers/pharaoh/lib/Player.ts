import RoomStandAlone from "./Room";
import {calculateGameLevel} from "./util/lotteryUtil";
import SlotMachinePlayer from "../../../common/classes/game/slotMachinePlayer";

// 小游戏路图收益情况  gold 金币 silver 银币 copper 铜币
type gainDetail = {gold: number, silver: number, copper: number};

/**
 * 埃及夺宝玩家
 * @property profit 收益
 * @property totalBet 总押注
 * @property baseBet 基础押注
 * @property betOdds 押注倍率
 * @property newer 是否是新玩家
 * @property isBigWin 是否中大奖
 * @property gameState 游戏状态 1： spin中 2：小游戏中 默认spin
 * @property status  是否开始游玩 1: 待机 2：在玩
 * @property bonusGameProfit bonus小游戏收益
 * @property detonatorCount 雷管数量
 * @property gameLevel 当前所处游戏等级
 * @property littleGameAccumulate 小游戏积累
 * @property currentPosition 小游戏当前步数
 * @property throwNum 小游戏投掷骰子的次数
 * @property littleGameWin 小游戏累积收益
 * @property littleGameLevel 小游戏等级
 * @property historyPosition 小游戏历史位置
 * @property throwCount 投掷点数
 * @property currentAwardType 投掷位置的奖类型
 * @property customsClearance 通关
 * @property roundId  回合id
 */
export default class Player extends SlotMachinePlayer {
    profit: number = 0;
    totalBet: number = 0;
    baseBet: number = 0;
    betOdds: number = 0;
    room: RoomStandAlone;
    newer: boolean = false;
    isBigWin: boolean = false;
    private gameState: 1 | 2 = 1;
    bonusGameProfit: number = 0;
    detonatorCount: number = 0;
    gameLevel: 1 | 2 | 3 = 1;
    littleGameAccumulate: number = 0;
    currentPosition: number = 0;
    throwNum: number = 5;
    littleGameWin: number = 0;
    littleGameLevel: 1 | 2 | 3 = 1;
    historyPosition: number[] = [];
    littleGameGainDetail: gainDetail = {gold: 0, silver: 0, copper: 0};
    throwCount: number = 0;
    currentAwardType: string = '';
    customsClearance: boolean = false;
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
        this.betOdds = 0;
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
     * 每开启小游戏之前初始化
     */
    initPlayerLittleGame() {
        this.currentPosition = 0;
        this.throwNum = 5;
        this.littleGameWin = 0;
        this.littleGameLevel = this.gameLevel;
        this.historyPosition = [];
        this.littleGameGainDetail = {gold: 0, silver: 0, copper: 0};
        this.throwCount = 0;
        this.currentAwardType = '';
        this.customsClearance = false;
    }

    /**
     * 押注
     * @param baseBet 基础押注
     * @param betOdds 押注倍率
     */
    bet(baseBet: number, betOdds: number) {
        this.baseBet = baseBet;
        this.betOdds = betOdds;
        this.totalBet = baseBet * betOdds;
        this.gold -= this.totalBet;
        this.littleGameAccumulate += this.totalBet * 0.13;
    }

    /**
     * 检查是否金币不足
     * @param baseBet 基础押注
     * @param betOdds 押注倍率
     */
    isLackGold(baseBet: number, betOdds: number): boolean {
        return this.gold < baseBet * betOdds;
    }

    /**
     * 添加雷管累积
     * @param num
     */
    addDetonator(num: number) {
        this.detonatorCount += num;
    }

    /**
     * 初始化雷管数量
     */
    initDetonatorCount() {
        this.detonatorCount = 0;
    }

    /**
     * 是否是spin状态
     */
    isSpinState() {
        return this.gameState === 1;
    }

    isLittleGameState() {
        return this.gameState === 2;
    }

    /**
     * 设置为spin游戏状态
     */
    setSpinState() {
        this.gameState = 1;
        // 同时把这个关卡的小游戏下注累积清零
        this.littleGameAccumulate = 0;
    }

    /**
     * 设置为小游戏状态
     */
    setLittleGameState() {
        this.gameState = 2;
    }

    /**
     * 初始化bonus游戏收益
     * @param totalBet 上一次押注
     */
    initBonusProfit(totalBet: number) {
        this.bonusGameProfit = totalBet * 5;
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
        this.littleGameWin = playerRealWin;
    }

    updateGameLevelAndPlayerGameState() {
        // 根据雷管计算下一关是什么
        const nextGameLevel = calculateGameLevel(this.detonatorCount);

        if (nextGameLevel !== this.gameLevel) {
            // 初始化小游戏数据
            this.initPlayerLittleGame();

            // 更新为小游戏状态
            this.setLittleGameState();

            this.setRoundId(this.room.getRoundId(this.uid))
            this.gameLevel = nextGameLevel as 1 | 2 | 3;
        }
    }

    /**
     * 构造小游戏实况结果
     * @param result
     */
    buildLittleGameLiveResult(result: string) {
        return {
            uid: this.uid,
            result,
            gameState: this.gameState.toString()
        }
    }

    /**
     * 构造开奖结果
     * @param result
     */
    buildGameLiveResult( result: string) {
        return {
            uid: this.uid,
            result,
            gameState: this.gameState.toString(),
            baseBet: this.baseBet,
            betOdds: this.betOdds,
        }
    }
}