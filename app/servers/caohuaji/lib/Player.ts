import utils = require('../../../utils/index');
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import Room from './Room';
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';

export default class Player extends PlayerInfo {
    /**回合盈利 */
    profit: number;
    /**进入房间的总盈利 */
    totalProfit: number[] = [];
    bet: number;
    /**回合总下注 */
    totalBet: number[] = [];

    isWang: boolean;
    betArea: { [area: string]: number };
    /**20局 胜利 回合 */
    winRound = 0;

    betDetails: { [area: string]: { bet: number, win: number } };
    controlState: CommonControlState;
    /**保留初始化金币 */
    initgold: number = 0;
    constructor(opts: any) {
        super(opts);
        this.profit = 0;//一局的收益
        this.bet = 0;//一局的下注
        // this.addUpGain = [];//玩家累计收益
        this.isWang = false;
        this.betArea = {};
        this.controlState = CommonControlState.RANDOM;
        this.betDetails = {};
        this.initgold = this.gold;
    }

    /**初始化 */
    init() {
        if (this.bet) {
            this.totalProfit.push(this.profit > 0 ? this.profit : 0);
            this.totalBet.push(this.bet);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
            // 保留上一局的押注
            this.standbyRounds = 0;
        } else {
            this.standbyRounds++;
        }

        this.winRound = this.totalProfit.reduce((total, Value) => {
            if (Value > 0) {
                total++;
            }
            return total;
        }, 0);
        this.profit = 0;
        this.bet = 0;
        this.isWang = false;
        this.betArea = {};
        this.betDetails = {};



        this.controlState = CommonControlState.RANDOM;
        this.initControlType();
    }

    /**下注 */
    bets(roomInfo: Room, area: string, bet: number) {
        //改变金币
        let isExit = roomInfo.area[area].arr.find(m => m.uid == this.uid);
        if (isExit) {
            isExit.bet += bet;
        } else {
            roomInfo.area[area].arr.push({ uid: this.uid, bet: bet });
        }

        this.addBetInfo(area, bet);

        roomInfo.area[area].allBet += bet;
        roomInfo.allBet += bet;
        this.bet += bet;//玩家本局累计下注
    }

    /**
     * 添加个人押注记录
     * @param area
     * @param bet
     */
    addBetInfo(area: string, bet: number) {
        if (!this.betArea[area]) {
            this.betArea[area] = 0;
        }

        this.betArea[area] += bet;
    }

    strip() {
        return {
            uid: this.uid,
            gold: this.gold,
            headurl: this.headurl,
            nickname: this.nickname,
        }
    }

    strip1() {
        return {
            uid: this.uid,
            gold: this.gold,
            headurl: this.headurl,
            nickname: this.nickname,
            profit: this.profit,
            isWang: this.isWang,
        }
    }

    strip2() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            profit: this.profit,
            headurl: this.headurl,
            // addUpGain: this.addUpGain,
            bet: this.bet,
            gold: utils.sum(this.gold),
        }
    }

    /**
     * 获取超限押注
     * @param params
     */
    checkOverrunBet(params: { condition: number }): object {
        const transfiniteCondition = params.condition * 100;
        let controlArea = {};
        if (transfiniteCondition === 0) return controlArea;

        for (let index in this.betArea) {
            controlArea[index] = this.betArea[index] >= transfiniteCondition ? CommonControlState.LOSS : CommonControlState.RANDOM;
        }

        return controlArea;
    }

    /**
     * 设置玩家调控状态
     */
    setControlState(params: { state: CommonControlState }): void {
        this.controlState = params.state;
    }

    /**
     * 获取下注区域金额
     */
    getBetAreas() {
        return this.betArea;
    }
    //更新玩家金币
    async updateGold(roomInfo: Room, index: string) {
        const { gold } = await createPlayerRecordService()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setControlType(this.controlType)
            .setGameRecordInfo(Math.abs(this.bet), Math.abs(this.bet), this.profit - this.bet, false)
            .setGameRecordLivesResult(this.buildLiveRecord(index))
            .sendToDB(1);
        this.gold = gold;
        this.initgold = this.gold;
        // !this.onLine && this.profit > 0 && mailModule.changeGoldsByMail6({}, this.strip2());
    }


    buildLiveRecord(index) {
        return {
            uid: this.uid,
            areas: this.betDetails,
            index
        }
    }
}
