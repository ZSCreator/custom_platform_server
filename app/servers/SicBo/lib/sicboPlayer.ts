import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import * as gameUtil2 from '../../../utils/gameUtil2';
import * as util from '../../../utils/index';
import { betLimit, mapping, mappingAreas } from './sicboConst';
import sicboRoom from './sicboRoom';
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";

export default class sicboPlayer extends PlayerInfo {
    /**回合盈利 */
    profit: number = 0;
    /**进入房间的总盈利 */
    totalProfit: number[] = [];
    /**当局下注 */
    bet: number = 0;
    /**回合总下注 */
    totalBet: number[] = [];
    /**玩家下注情况 输赢计算用 */
    bets: { [area: string]: { bet: number, profit: number } } = {};
    /**当局押注 续压用*/
    betAreas: { area: string, bet: number }[] = [];
    /**续压用 */
    lastBets: { area: string, bet: number }[] = [];
    /**玩家进入房间时间 */
    entryTime = new Date().getTime();
    /**当局有效押注 */
    validBet: number = 0;

    /**玩家最大押注 */
    maxBet: number = 0;
    /**上一把获得 */
    lastGain: number = 0;
    winRound: number = 0;

    /** 调控状态 */
    controlState = CommonControlState.RANDOM;
    /**待机轮数 */
    standbyRounds = 0;
    /**保留初始化金币 */
    initgold: number = 0;
    constructor(opts: any) {
        super(opts)
        this.initgold = this.gold;
    }

    siboInit() {
        this.initControlType();
        this.standbyRounds++;
        if (this.bet > 0) {
            this.standbyRounds = 0;
            this.totalBet.push(this.bet);
            this.totalProfit.push(this.profit);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
            this.lastBets = this.betAreas;
        }
        this.betAreas = [];
        this.validBet = 0;
        this.bets = {};
        this.maxBet = 0;
        this.bet = 0;
        this.profit = 0;
        this.controlState = CommonControlState.RANDOM;

        this.winRound = this.totalProfit.reduce((total, Value) => {
            if (Value > 0) {
                total++;
            }
            return total;
        }, 0);
    }

    strip() {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            money: util.sum(this.gold),
            totalProfit: util.sum(this.totalProfit),
            gold: this.gold,
            bet: this.bet,
            lastGain: this.lastGain,
        }
    }

    strip1() {
        return {
            uid: this.uid,
            bet: this.bet,
        }
    }

    strip2() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            bet: this.bet,
            profit: this.profit,
            language: this.language
        }
    }

    /**玩家下注记录 */
    betHistory(area: string, gold: number) {
        this.betAreas.push({ area, bet: gold });

        if (!this.bets[area])
            this.bets[area] = { bet: 0, profit: 0 };
        this.bets[area].bet += gold;
    }

    /**玩家有效押注 */
    validBetCount(betNumber: number) {
        this.validBet = betNumber;
    }

    /**
     * 对押检查
     * @param bets
     * @param room
     */
    betCheck(bets: { area: string, bet: number }, roomInfo: sicboRoom) {
        // for (let area in bets) {
        // 如果是对压区域
        if (mappingAreas.includes(bets.area)) {
            const mappingArea = mapping[bets.area],
                areaBet = roomInfo.area_bet[bets.area] ? roomInfo.area_bet[bets.area].allBet + bets[bets.area] : bets[bets.area],
                mappingBet = roomInfo.area_bet[mappingArea] ? roomInfo.area_bet[mappingArea].allBet : 0,
                max = Math.max(areaBet, mappingBet),
                min = Math.min(areaBet, mappingBet);


            if (max - min > betLimit) {
                return true;
            }
        }
        return false;
    }

    playerBet(roomInfo: sicboRoom, bets: { area: string, bet: number }) {
        this.betHistory(bets.area, bets.bet);
        let bet = bets.bet;
        this.bet += bet;
        this.maxBet += bet;
        if (roomInfo.area_bet[bets.area] == undefined) {
            roomInfo.area_bet[bets.area] = { playerArr: [], allBet: 0 }
        }
        let isExist = roomInfo.area_bet[bets.area].playerArr.find(m => m.uid == this.uid);
        if (isExist) {
            isExist.bet += bet;
            isExist.betList.push(bet);
            isExist.betRepeat = gameUtil2.getArrNum(isExist.betList);
        } else {
            roomInfo.area_bet[bets.area].playerArr.push({
                uid: this.uid,
                bet: bet,
                betList: [bet],
                betRepeat: gameUtil2.getArrNum([bet])
            });
        }
        roomInfo.area_bet[bets.area].allBet += bet;//记录区域押注总数
        roomInfo.allBetNum += bet;//记录所有押注总数

        // 如果是真人玩家 则添加房间的真人押注
        if (this.isRobot === RoleEnum.REAL_PLAYER) roomInfo.realPlayerTotalBet += bet;
    }

    /**
     * 设置玩家调控状态
     */
    setControlState(state: CommonControlState): void {
        this.controlState = state;
    }

    /**是否可以续压 */
    isCanRenew() {
        if (this.isRobot == 2) {
            return 0;
        }
        let tatalBet = this.lastBets.reduce((total, Value) => {
            total += Value.bet;
            return total;
        }, 0);
        if (tatalBet > this.gold) {
            return 0;
        }
        return this.lastBets.length;
    }

    /**
     * 检查是否押注超限
     * @param condition 超限金额
     */
    checkOverrunBet(condition: number): object {
        let transfiniteArea = {}, transfiniteCondition = condition * 100;
        if (transfiniteCondition === 0) return transfiniteArea;

        for (let area in this.bets) {
            if (this.bets[area].bet >= transfiniteCondition) {
                transfiniteArea[area] = this.bets[area].bet;
            }
        }

        return transfiniteArea;
    }
}