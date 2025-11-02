import {PlayerInfo} from "../../../common/pojo/entity/PlayerInfo";
import {areas, BetAreasName} from "./config/betAreas";
import {Room} from "./room";
import {clone} from "../../../utils";
import {RoleEnum} from "../../../common/constant/player/RoleEnum";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";
import {sendBigWinNotice} from "../../../services/MessageService";


/**
 * 番摊玩家
 * @property totalBet 总押注
 * @property profit 收益
 * @property bets 下注收益
 * @property winRoundCount 赢的回合
 * @property lastBets 上一局押注
 */
export default class Player extends PlayerInfo {
    private totalBet: number = 0;
    private profit: number = 0;
    private bets: { [key in BetAreasName]: number } = initBetDetail();
    private winRoundCount: number = 0;
    private lastBets = this.bets;

    constructor(opt: any) {
        super(opt);
    }

    /**
     * 玩家回合初始化
     */
    init() {
        // 如果上一局有押注 则保留上一局
        if (this.totalBet) {
            // 保留上一局的押注
            this.lastBets = clone(this.bets);
            this.standbyRounds = 0;
        } else {
            this.standbyRounds++;
        }

        // 下注区域置空
        for (let key in this.bets) {
            this.bets[key] = 0;
        }

        this.profit = 0;
        this.totalBet = 0;
        this.initControlType();
    }

    /**
     * 添加下注区域
     * @param areaName
     * @param num
     */
    addBets(areaName: BetAreasName, num: number) {
        this.bets[areaName] += num;

        this.totalBet += num;

        // 扣除金币
        this.deductGold(num);
    }

    /**
     * 检查是否金币不足
     */
    isLackGold(num: number) {
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
     * 玩家结算
     */
    async settlement(room: Room) {
        // 添加游戏记录以及更新玩家金币
        const { playerRealWin, gold } = await createPlayerRecordService()
            .setPlayerBaseInfo(this.uid, false, this.isRobot ,this.gold + this.totalBet)
            .setGameInfo(room.nid, room.sceneId, room.roomId)
            .setGameRoundInfo(room.roundId, 1, )
            .addResult(room.getResult().toString())
            .setControlType(this.controlType)
            .setGameRecordLivesResult(this.buildLiveRecord(room))
            .setGameRecordInfo(this.totalBet, this.totalBet, this.profit, false)
            .sendToDB(1);


        if (playerRealWin > 0) {
            this.winRoundCount++;
        }

        // 播放跑马灯
        if (this.profit >= 100000) {
            sendBigWinNotice(room.nid, this.nickname, this.profit, this.isRobot, this.headurl);
        }

        this.gold = gold;
        this.profit = playerRealWin + this.totalBet;
    }

    buildLiveRecord(room: Room) {
        if (this.isRobot === RoleEnum.ROBOT) {
            return {};
        }

        const betAreas = room.getBetAreas();
        const areas = {};

        for (let name in betAreas) {
            const area = betAreas[name].getPlayerBetAndWin(this.uid);

            if (area) {
                areas[name] = area;
            }
        }

        return {
            uid: this.uid,
            doubleAreas: room.getDoubleAreas(),
            winAreas: room.getWinAreas(),
            areas
        }
    }


    /**
     * 是否有押注
     */
    isBet() {
        return this.totalBet > 0;
    }

    /**
     * 添加收益
     * @param profit
     */
    addProfit(profit: number) {
        this.profit += profit;
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
     * 获取押注详情
     */
    getBetsDetail() {
        return this.bets;
    }

    /**
     * 上一局是否押注
     */
    isLastBet() {
        for (let [, num] of Object.entries(this.lastBets)) {
            if (num > 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * 是真实玩家且已经下注
     */
    isRealPlayerAndBet() {
        return this.isRobot === RoleEnum.REAL_PLAYER && this.totalBet > 0;
    }

    /**
     * 检查押注区域
     * @param bets
     */
    checkBetAreas(bets: { [key in BetAreasName]: number }) {
        // 不是一个对象返回错误
        if (typeof bets !== 'object') {
            return false;
        }

        const betAreas = Object.keys(bets);

        for (const key of betAreas) {
            // 如果没有该押注区域，押注同样无效
            if (!areas.includes(key as BetAreasName)) {
                return false;
            }
        }


        // 押注区域同时存在单双也不合法
        if (betAreas.includes(BetAreasName.SINGLE) && betAreas.includes(BetAreasName.DOUBLE)) {
            return false;
        }


        for (let key in bets) {
            // 如果押注金币小于等于0 不合法
            if (typeof bets[key] !== 'number' || bets[key] <= 0) {
                return false;
            }

            // 如果押注区域为单且双已经押注 则押注不合法
            if (key === BetAreasName.SINGLE && this.bets[BetAreasName.DOUBLE] > 0) {
                return false;
            }

            // 如果区域为双且单已经押注 则押注不合法
            if (key === BetAreasName.DOUBLE && this.bets[BetAreasName.SINGLE] > 0) {
                return false;
            }
        }

        return true;
    }


    /**
     * 获取上一局押注
     */
    getLastBets(): {[areaName: string]: number} {
        let lastBets = {};

        for (let [areaName, num] of Object.entries(this.lastBets)) {
            if (num > 0) {
                lastBets[areaName] = num;
            }
        }

        return lastBets;
    }

    /**
     * 结算结果需要数据
     */
    settlementResult() {
        return {
            uid: this.uid,
            gold: this.gold,
            profit: this.profit,
            bets: this.bets,
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
     * 检查超限的区域
     * @param killCondition
     */
    getOverrunBetAreas(killCondition: number): BetAreasName[] {
        const areas: BetAreasName[] = [];

        for (let areaName in this.bets) {
            if (this.bets[areaName] > killCondition) {
                areas.push(areaName as BetAreasName);
            }
        }

        return areas;
    }
}

/**
 * 初始化下注详情
 */
function initBetDetail(): { [key in BetAreasName]: number } {
    const bets: any = {};

    areas.forEach(area => bets[area] = 0);

    return bets;
}