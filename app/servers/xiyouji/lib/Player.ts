import RoomStandAlone from "./Room";
import {betNums} from "./constant";
import SlotMachinePlayer from "../../../common/classes/game/slotMachinePlayer";

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
 * 西游记玩家
 * @property profit 收益
 * @property totalBet 总押注
 * @property baseBet 基础押注
 * @property lineNumber 选择线
 * @property record 玩家玩耍记录 先沿用目前的， 后期优化掉
 * @property gameRound 玩家回合
 * @property newer 是否是新玩家
 * @property isBigWin 是否中大奖
 * @property winPercentage 输赢比
 * @property gameState 游戏状态 1： spin 中 2： bonus小游戏中 默认spin
 * @property bonusGameProfit bonus小游戏收益
 * @property characters 集字 "如意金箍棒"
 * @property roundId 回合id
 */
export default class Player extends SlotMachinePlayer {
    profit: number = 0;
    totalBet: number = 0;
    baseBet: number = 0;
    lineNumber: number = 0;
    room: RoomStandAlone;
    record: InternalRecord = { totalWin: 0, totalBet: 0, recordCount: 0, nextUse: '2', time: 0};
    gameRound: number = 0;
    newer: boolean = false;
    isBigWin: boolean = false;
    winPercentage: number = 0;
    gameState: 1 | 2 = 1;
    bonusGameProfit: number = 0;
    roundId: string;
    private characters: {[key: string]: string[]} = genCharacters();

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
        this.lineNumber = 0;
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
     * 设置收集的 “如意金箍棒”
     * @param characters
     */
    setCharacters(characters: string[]) {
        this.characters[this.baseBet.toString()] = characters;
    }

    /**
     * 获取所有收集的字符串
     */
    getAllCharacters() {
        return this.characters;
    }

    /**
     * 获取当前收集的 “如意金箍棒”
     */
    getCurrentCharacters() {
        return this.characters[this.baseBet.toString()] || [];
    }

    /**
     * 押注
     * @param baseBet
     * @param lineNumber
     */
    bet(baseBet: number, lineNumber: number) {
        this.baseBet = baseBet;
        this.lineNumber = lineNumber;
        this.totalBet = baseBet * lineNumber;
        this.gold -= this.totalBet;
    }

    /**
     * 检查是否金币不足
     */
    isLackGold(baseBet: number, lineNumber: number) {
        return this.gold < baseBet * lineNumber;
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
        this.gold = gold ;
        this.profit = playerRealWin;
        this.record.totalBet += this.totalBet;
        this.record.totalWin += playerRealWin;

        // 此轮spin结束时间
        this.record.time = Date.now();
        // 每次初始化回合游戏回合加1
        this.gameRound++;

        // 累加recordCount的次数
        this.record.recordCount++;

        // 计算输赢比
        this.winPercentage = this.record.totalWin / this.record.totalBet;

        // 如果输赢比 大于 0.9 或者 记录大于20 清空累积盈利 以及record 次数
        if (this.winPercentage > 0.9 || this.record.recordCount > 20) {
            this.record.recordCount = 0;
            this.record.totalWin = 0;
            this.record.totalBet = 0;
        }
    }

    /**
     * 是否有集字
     */
    hasCharacter(): boolean {
        for (let betNum in this.characters) {
            if (this.characters[betNum].length > 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * 构造实况结果
     * @param result
     */
    buildLiveRecord( result: string) {
        return {
            uid: this.uid,
            result,
            gameState: result !== 'w' ? '1' : '2',
            baseBet: this.baseBet,
            lineNumber: this.lineNumber,
        }
    }
};


/**
 * 生成初始的 “如意金箍棒” 以每个基础押注额为属性名
 */
function genCharacters() {
    const character = {};

    betNums.map(num => character[num] = []);

    return character;
}