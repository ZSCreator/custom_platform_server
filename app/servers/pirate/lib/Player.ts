import RoomStandAlone from "./Room";
import {baseBetNum, baseMultiple} from "./config/baseBetConfig";
import {baseTreasureChests, ITreasureChest, keyNumber, treasureChestNumber} from "./config/treasureChest";
import {clone} from "../../../utils";
import SlotMachinePlayer from "../../../common/classes/game/slotMachinePlayer";
import {ScenePointValueMap} from "../../../../config/data/gamesScenePointValue";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

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
 * 寻宝奇航玩家
 * @property profit 收益
 * @property totalBet 总押注
 * @property multiply 倍率
 * @property record 玩家玩耍记录
 * @property gameRound 玩家回合
 * @property newer 是否是新玩家
 * @property isBigWin 是否中大奖
 * @property winPercentage 输赢比
 * @property goldCount  收集金币个数
 * @property gameStatus 游戏状态 1 为普通开奖spin状态 2 为小游戏开宝箱状态
 * @property treasureChestList 玩家拥有的宝箱
 * @property keyCount 玩家拥有的钥匙数量
 * @property freeSpinCount 免费开奖次数
 */
export default class Player extends SlotMachinePlayer {
    profit: number = 0;
    totalBet: number = 0;
    multiply: number = 0;
    room: RoomStandAlone;
    record: InternalRecord = { totalWin: 0, totalBet: 0, recordCount: 0, nextUse: '3', time: 0};
    gameRound: number = 0;
    newer: boolean = false;
    isBigWin: boolean = false;
    winPercentage: number = 0;
    goldCount: {[key: string]: number} = genGoldCount();
    gameStatus: 1 | 2 = 1;
    treasureChestList: ITreasureChest[] = [];
    keyCount: number = 0;
    freeSpinCount: number = 0;
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
        this.multiply = 0;
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
     * 免费开奖初始化
     * 这里不初始化总押注 需要沿用上一次的押注
     */
    freeSpinInit() {
        this.profit = 0;
        this.isBigWin = false;
    }

    /**
     * 是spin状态
     */
    isSpinStatus() {
        return this.gameStatus === 1;
    }



    /**
     * 押注
     * @param baseBet
     * @param lineNumber
     */
    /**
     * 押注
     * @param multiplyType 倍率类型
     */
    bet(multiplyType: number) {
        this.multiply = baseMultiple[multiplyType] * ScenePointValueMap[GameNidEnum.pirate].pointValue;
        this.totalBet = this.multiply * baseBetNum;
        this.gold -= this.totalBet;
    }

    /**
     * 检查是否金币不足
     * @param multiplyType 倍率类型
     */
    isLackGold(multiplyType: number) {
        return this.gold < baseMultiple[multiplyType] * baseBetNum * ScenePointValueMap[GameNidEnum.pirate].pointValue;
    }


    /**
     * 玩家结算
     * @param playerRealWin 玩家真实收益
     * @param goldCount 这局的金币累积
     * @param isFreeSpin 是否是免费开奖
     * @param gold 数据库金币
     */
    settlement(playerRealWin: number, goldCount: number, gold: number, isFreeSpin: boolean = false) {
        this.goldCount[this.multiply/ ScenePointValueMap[GameNidEnum.pirate].pointValue] += goldCount;
        // 真实收益为纯利润
        this.profit = isFreeSpin ? playerRealWin : playerRealWin + this.totalBet;
        this.gold = gold;

        this.profit = Number(this.profit.toFixed(2));


        // 如果收集的金币超过 进入开宝箱状态
        if (this.goldCount[this.multiply / ScenePointValueMap[GameNidEnum.pirate].pointValue] >= treasureChestNumber) {
            this.gameStatus = 2;
            // 生成宝箱
            this.treasureChestList = clone(baseTreasureChests).sort((x, y) => Math.random() - 0.5);
            // 初始化钥匙数量
            this.keyCount = keyNumber;
        }
    }

    /**
     * 宝箱结算
     */
    treasureChestSettlement() {
        // 如果没有钥匙了 切换为spin状态
        if (this.keyCount === 0) {
            this.gameStatus = 1;
            // 这一押注类型的积累置空
            this.goldCount[this.multiply / ScenePointValueMap[GameNidEnum.pirate].pointValue] = 0;
        }
    }

    /**
     * 构造live记录
     * @param result
     */
    buildLiveRecord( result) {
        return {
            uid: this.uid,
            result,
            gameState: this.gameStatus.toString()
        }
    }
}

/**
 * 生成海盗金币配置
 * 一个押注类型一个海盗金币积累 当切换押注时金币积累也会切换
 */
function genGoldCount() {
    let goldCount: {[key: string]: number} = {};

    for (let key in baseMultiple) {
        goldCount[baseMultiple[key]] = 0;
    }

    return goldCount;
}