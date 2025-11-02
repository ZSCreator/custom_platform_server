import {sum} from "../../../utils";
import RoomStandAlone from "./RoomStandAlone";
import {genRoundId} from "../../../utils/utils";
import {buildRecordResult} from "./util/roomUtil";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";
import SlotMachinePlayer from "../../../common/classes/game/slotMachinePlayer";


/**
 * 水果机玩家
 * @property profit 回合收益
 * @property totalProfit 进入房间后的净盈利
 * @property totalBet 回合总押注
 * @property betAreas 押注区域详情
 * @property leaveCount 离线次数统计
 * @property roundId 回合id
 */
export default class Player extends SlotMachinePlayer {
    profit: number = 0;
    totalProfit: number = 0;
    totalBet: number = 0;
    betAreas: { [area: string]: number } = {};
    leaveCount: number = 0;
    roundId: string;

    constructor(opts: any) {
        super(opts);
        this.gold = opts.gold || 0;            // 房间内的金币
    }

    /**
     * 初始化
     */
    init() {
        this.profit = 0;
        this.totalBet = 0;
        this.betAreas = {};
        this.initControlType();
    }

    /**
     * 检查是否金币不足
     */
    isLackGold(bets: {[area: string]: number}) {
        for (let area in bets) {
            if (typeof bets[area] !== 'number' || bets[area] <= 0) {
                return true;
            }
        }

        return this.gold < (sum(bets));
    }

    /**
     * 设置回合id
     * @param roundId
     */
    setRoundId(roundId: string) {
        this.roundId = roundId;
    }

    /**
     * 返回玩家数据
     */
    strip() {
        return {
            gold: this.gold,
            betAreas: this.betAreas,
            totalBet: this.totalBet
        }
    }

    /**
     * 玩家下注时的记录
     * @param area 区域
     * @param betGold 区域金币
     */
    betHistory(area: string, betGold: number) {
        this.totalBet += betGold;
        if (!this.betAreas[area]) this.betAreas[area] = 0;
        this.betAreas[area] += betGold;
    }

    /**
     * 押注
     * @param bets
     */
    async bet(bets: { [area: string]: number }) {
        // 减除本地玩家金币
        this.gold -= sum(bets);

        // 记录押注区域
        for (let area in bets) {
            this.betHistory(area, bets[area]);
        }
    }

    /**
     * 玩家加钱
     * @param winGold   玩家赢取的金币
     * @param odds      玩家赢取的最大倍率
     * @param lotteryResult
     * @param details 下注输赢详情
     * @param room 房间
     */
    async addGold(winGold: number, odds, lotteryResult, details, room: RoomStandAlone) {
        // 添加游戏记录以及更新玩家金币

        const record = buildRecordResult(lotteryResult.data);
        const {playerRealWin, gold} = await createPlayerRecordService()
            .setPlayerBaseInfo(this.uid, false, this.isRobot , this.gold)
            .setGameInfo(room.nid, room.sceneId, room.roomId)
            .setGameRoundInfo(genRoundId(room.nid, room.roomId, this.uid), 1, )
            .addResult(record)
            .setControlType(this.controlType)
            .setGameRecordLivesResult(this.buildLiveRecord(details, record))
            .setGameRecordInfo(this.totalBet, this.totalBet, winGold - this.totalBet, false)
            .sendToDB(1);

        this.gold = gold;

        // 纯利润 未抽水 因为如果用 返回值做收益那么收益就可能为复数
        this.profit = winGold;
        this.totalProfit += playerRealWin;

        // 更新记录
        // this.updateResult(winArea, settlement_info, gameRecordId);
        return playerRealWin;
    }


    /**
     * 更新开奖结果
     * @param winArea
     * @param settlement_info
     * @param gameRecordId
     */
    // updateResult(winArea, settlement_info, gameRecordId) {
    //     // 只有真人才构造结果
    //     if (this.isRobot === 0) {
    //         const result = this.buildResult(winArea, settlement_info);
    //         PlayerHistoryService.updateGameRecord(GameNidEnum.FruitMachine, this.uid, '水果机', result, gameRecordId);
    //     }
    // }

    /**
     * 构造开奖结果
     */
    buildLiveRecord(areas, record: string) {
        return {
            uid: this.uid,
            areas,
            result: record
        }
    }

    /**
     * 构建开奖结果
     * @param winArea
     * @param settlement_info
     */
    buildResult(winArea, settlement_info) {
        let settleDetails = {};

        for (let area in this.betAreas) {
            settleDetails[area] = winArea[area] ? { win: winArea[area], bet: this.betAreas[area] } :
                { win: -(this.betAreas[area]), bet: this.betAreas[area] };
        }

        return {
            uid: this.uid,
            area: settleDetails,
            settlement_info
        }
    }
};