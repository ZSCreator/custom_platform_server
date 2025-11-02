import {PlayerInfo} from "../../../common/pojo/entity/PlayerInfo";
import {Room} from "./room";
import {RoleEnum} from "../../../common/constant/player/RoleEnum";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";
import {sendBigWinNotice} from "../../../services/MessageService";


/**
 * Crash玩家
 * @property totalBet 总押注
 * @property profit 收益
 * @property winRoundCount 赢的回合
 * @property check 是否已经提前结束
 * @property takeProfitPoint 止盈点
 * @property result 利润点
 * @property auto 是否是自动 0 为不是 1为是
 */
export default class Player extends PlayerInfo {
    private totalBet: number = 0;
    private profit: number = 0;
    private winRoundCount: number = 0;
    private check: boolean = false;
    private result: number = 0;
    private auto: number = 1;
    takeProfitPoint: number = 0;

    constructor(opt: any) {
        super(opt);
    }

    /**
     * 玩家回合初始化
     */
    init() {
        // 如果上一局有押注 则保留上一局
        if (this.totalBet) {
            this.standbyRounds = 0;
        } else {
            this.standbyRounds++;
        }

        this.auto = 1;
        this.profit = 0;
        this.totalBet = 0;
        this.result = 0;
        this.check = false;
        this.initControlType();
    }

    /**
     * 设置为不是手动的
     */
    setNotAuto() {
        this.auto = 0;
    }

    /**
     * 添加下注区域
     * @param num
     */
    addBets(num: number) {
        this.totalBet += num;

        // 扣除金币
        this.deductGold(num);
    }

    /**
     * 检查是否金币不足
     */
    isLackGold(num: number) {
        // console.warn('3333', this.uid, this.totalBet, this.gold, num)
        return this.gold < (num);
    }

    /**
     * 获取总押注
     */
    getTotalBet(): number {
        return  this.totalBet;
    }

    /**
     * 断线重连成功重置连接状态
     */
    resetOnlineState() {
        this.onLine = true;
    }

    /**
     * 设置离线
     */
    setOffline() {
        this.onLine = false;
    }

    /**
     * 扣除金币
     * @param gold
     */
    deductGold(gold: number) {
        this.gold -= gold;
    }

    /**
     * 设置止盈点
     * @param num
     */
    setTakeProfitPoint(num: number) {
        this.takeProfitPoint = num;
    }

    /**
     * 玩家结算
     */
    async settlement(room: Room) {
        this.check = true;

        // 添加游戏记录以及更新玩家金币
        const { playerRealWin, gold } = await createPlayerRecordService()
            .setPlayerBaseInfo(this.uid, false, this.isRobot , this.gold + this.totalBet)
            .setGameInfo(room.nid, room.sceneId, room.roomId)
            .setGameRoundInfo(room.roundId, 1, )
            .addResult(room.zipResult)
            .setControlType(this.controlType)
            .setGameRecordLivesResult(this.buildLiveRecord(room))
            .setGameRecordInfo(this.totalBet, this.totalBet, this.profit, false)
            .sendToDB(1);

        if (playerRealWin > 0) {
            this.winRoundCount++;
        }

        // 跑马灯
        if (this.profit >= 100000) {
            sendBigWinNotice(room.nid, this.nickname, this.profit, this.isRobot, this.headurl);
        }

        this.gold = gold;
        this.profit = playerRealWin + this.totalBet;
    }


    /**
     * 是否有押注
     */
    isBet() {
        return this.totalBet > 0;
    }

    /**
     * 已经抢了
     */
    isTaken() {
        return this.check;
    }

    /**
     * 添加收益
     * @param result
     * @param done
     */
    addProfit(result: number, done?: boolean) {
        this.profit += done ? this.calculateProfit(0) : this.calculateProfit(result);
        this.result = result;
    }

    getProfit() {
        return this.profit;
    }

    /**
     * 计算收益
     * @param result
     */
    calculateProfit(result: number) {
        const profit = this.totalBet * result;
        return profit === 0 ? -this.totalBet : profit - this.totalBet;
    }

    /**
     * 前端显示属性
     */
    displayProperty() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            winRoundCount: this.winRoundCount,
        }
    }

    /**
     * 获取赢的回合
     */
    getWinRoundCount() {
        return this.winRoundCount;
    }

    /**
     * 是真实玩家且已经下注
     */
    isRealPlayerAndBet() {
        return this.isRobot === RoleEnum.REAL_PLAYER && this.totalBet > 0;
    }

    /**
     * 结算结果需要数据
     */
    settlementResult() {
        return {
            uid: this.uid,
            gold: this.gold,
            profit: this.profit,
            result: this.result,
            takeProfitPoint: this.takeProfitPoint
        };
    }

    /**
     * 前端显示数据
     */
    frontDisplayProperty() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            winRoundCount: this.winRoundCount,
            totalBet: this.totalBet,
        };
    }

    /**
     * 构造实况记录
     * @param room
     */
    buildLiveRecord(room: Room) {
        let auto = this.auto;

        // 如果没有设置止盈点都是手动的
        if (this.takeProfitPoint === 0) {
            auto = 0;
        }

        return {
            uid: this.uid,
            result: `${auto}|${this.result}`,
        };
    }
}