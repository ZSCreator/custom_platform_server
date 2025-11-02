import {genRoundId} from "../../../utils/utils";
import SpicyhotPotRoom from "./Room";
import {buildRecordResult} from './util/recordUtil';
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";
import SlotMachinePlayer from "../../../common/classes/game/slotMachinePlayer";
import {sendBigWinNotice} from "../../../services/MessageService";


export default class Player extends SlotMachinePlayer {
    profit: number;
    totalProfit: number;
    totalBet: number;
    online: boolean;
    betArea1: number;
    betArea2: number;
    betArea3: number;
    betAreas: any;
    leaveCount: number;
    roundId: string;

    constructor(opts: any) {
        super(opts);

        this.gold = opts.gold;            // 房间内的金币
        this.profit = 0;                                    // 回合收益
        this.totalProfit = 0;                               // 进入房间后的净盈利
        this.totalBet = 0;                                  // 回合总押注
        this.online = true;                                 // 是否在线
        this.betArea1 = 0;     //麻辣小奖
        this.betArea2 = 0;     //麻辣中奖
        this.betArea3 = 0;     //麻辣大奖
        this.betAreas = [
            { bet: 100, Area: [0, 0, 0] },
            { bet: 500, Area: [0, 0, 0] },
            { bet: 1000, Area: [0, 0, 0] },
            { bet: 5000, Area: [0, 0, 0] },
            { bet: 10000, Area: [0, 0, 0] },
        ]
    }

    // 初始化玩家数据
    init() {
        this.profit = 0;
        this.totalBet = 0;
        this.initControlType();
        //this.betAreas = {};
    }

    isOnline() {
        return this.online;
    }

    updateRoundId(room: any) {
        this.roundId = genRoundId(room.nid, room.roomId, this.uid);
    }

    // 更新玩家在线装态
    upOnlineTrue() {
        this.online = true;
        this.leaveCount = 0;
    }

    // 更新玩家在线装态
    upOnlineFlase() {
        this.online = false;
    }

    // 检查玩家是否超过最大离线回合
    checkPlayerOnline() {
        return this.leaveCount >= 10;
    }

    // 玩家下注时的记录
    betHistory(area, betGold) {
        this.totalBet += betGold;
        if (!this.betAreas[area]) this.betAreas[area] = 0;
        this.betAreas[area] += betGold;
    }

    /**
     * 玩家扣钱
     * @param {Number} 扣除玩家相应的金币
     * @return {Boolean} 如果扣除金币失败则返回false 成功返回 true
     **/
    async deductGold(gold: number) {

        this.totalBet = gold;

        return true;
    }

    /**
     *
     * @param {Number} winGold 玩家赢取的金币
     * @param lotteryDetails 开奖结果
     * @param awardType 大奖类型
     * @param room 火锅房间
     * @return {Boolean} 如果加金币失败则返回false 成功返回 true
     **/
    /**
     * 玩家加钱
     * @param totalWin 盈利
     * @param BZProfit 麻辣奖盈利
     * @param lotteryResult 开价结果
     * @param lotteryDetails 中奖详情
     * @param awardType
     * @param room
     */
    async addGold(totalWin, BZProfit, lotteryResult: string[], lotteryDetails: {[str: string]: number}, awardType: string, room: SpicyhotPotRoom) {


        const record = buildRecordResult(awardType, BZProfit, lotteryResult, lotteryDetails, this.totalBet);
        const {playerRealWin, gold } = await createPlayerRecordService()
            .setPlayerBaseInfo(this.uid, false, this.isRobot , this.gold)
            .setGameInfo(room.nid, room.sceneId, room.roomId)
            .setGameRoundInfo(this.roundId, 1, )
            .addResult(record)
            .setControlType(this.controlType)
            .setGameRecordLivesResult(this.buildLiveRecord(record))
            .setGameRecordInfo(this.totalBet, this.totalBet, totalWin + BZProfit - this.totalBet, false)
            .sendToDB(1);

        this.gold = gold;
        this.profit = playerRealWin + this.totalBet;
        this.totalProfit += this.profit - this.totalBet;

        //播放跑马灯
        if (this.profit / this.totalBet > 20 && this.profit >= 100000) {
            sendBigWinNotice(room.nid, this.nickname, this.profit, this.isRobot, this.headurl);
        }

        return { playerRealWin: playerRealWin - BZProfit, reBZProfit: BZProfit };
    }

    // 玩家包装
    strip() {
        return {
            gold: this.gold,
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            totalProfit: this.totalProfit,
            robot: this.isRobot,
            totalBet: this.totalBet,
        }
    }

    getBetAreas() {
        return {
            betAreas: this.betAreas,
        }
    }


    buildLiveRecord(result: string) {
        return {
            uid: this.uid,
            result
        }
    }
};