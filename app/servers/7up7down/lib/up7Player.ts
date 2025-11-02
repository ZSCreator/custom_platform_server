import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import * as util from '../../../utils/index';
import up7Room from './up7Room';
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
import JsonConfig = require('../../../pojo/JsonConfig');
import MessageService = require('../../../services/MessageService');
import * as mailModule from '../../../modules/mailModule';

export default class up7Player extends PlayerInfo {
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

    /**上一把获得 */
    lastGain: number = 0;
    winRound: number = 0;
    /**保留初始化金币 */
    initgold: number = 0;
    constructor(opts: any) {
        super(opts)
        this.initgold = this.gold;
    }

    up7Init() {
        this.standbyRounds++;
        if (this.bet > 0) {
            this.totalBet.push(this.bet);
            this.totalProfit.push(this.profit);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
            this.lastBets = this.betAreas;
            this.standbyRounds = 0;
        }
        this.betAreas = [];
        this.bets = {};
        this.bet = 0;
        this.profit = 0;

        this.winRound = this.totalProfit.reduce((total, Value) => {
            if (Value > 0) {
                total++;
            }
            return total;
        }, 0);
        this.initControlType();
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

    playerBet(roomInfo: up7Room, RecordBets: { area: string, bet: number }) {
        let situation = roomInfo.situations.find(c => c.area == RecordBets.area);
        situation.totalBet += RecordBets.bet;
        situation.betList.push({ uid: this.uid, bet: RecordBets.bet });
        // 如果是真人玩家 则添加房间的真人押注
        if (this.isRobot === RoleEnum.REAL_PLAYER) roomInfo.realPlayerTotalBet += RecordBets.bet;
        // --
        this.gold -= RecordBets.bet;
        this.bet += RecordBets.bet;
        this.betAreas.push(RecordBets);

        if (!this.bets[RecordBets.area])
            this.bets[RecordBets.area] = { bet: 0, profit: 0 };
        this.bets[RecordBets.area].bet += RecordBets.bet;
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

    /**
     * 检查是否押注超限
     * @param killCondition 超限金额
     */
    getOverrunBetAreas(killCondition: number): string[] {
        const areas: string[] = [];

        for (let areaName in this.bets) {
            if (this.bets[areaName].bet > killCondition) {
                areas.push(areaName);
            }
        }

        return areas;
    }

    /**更新玩家金币 */
    async updateGold(roomInfo: up7Room) {
        roomInfo.endTime = Date.now();
        try {
            // 添加游戏记录以及更新玩家金币
            const res = await createPlayerRecordService()
                .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
                .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
                .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
                .setControlType(this.controlType)
                .setGameRecordInfo(Math.abs(this.profit), Math.abs(this.profit), this.profit, false)
                .setGameRecordLivesResult(roomInfo.buildPlayerGameRecord(this.uid))
                .addResult(roomInfo.zipResult)
                .sendToDB(1);
            this.profit = res.playerRealWin;
            this.gold = res.gold;
            this.initgold = this.gold;
            //播放跑马灯
            if (this.profit >= 100000) {
                const zname = JsonConfig.get_games(roomInfo.nid).zname;
                //播放跑马灯
                MessageService.sendBigWinNotice(roomInfo.nid, this.nickname, this.profit, this.isRobot, this.headurl);
            }
            //离线玩家发送邮件
            // !this.onLine && mailModule.changeGoldsByMail3({}, this.strip2());
        } catch (error) {
            console.error(error);
        }
    }
}