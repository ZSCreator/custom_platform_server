import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import ttzRoom from './ttzRoom';
import * as mailModule from '../../../modules/mailModule';
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';


export default class ttzPlayer extends PlayerInfo {
    /**当局下注 */
    bet: number = 0;
    /**回合总下注 */
    totalBet: number[] = [];
    /**回合盈利 */
    profit: number = 0;
    /**进入房间的总盈利 */
    totalProfit: number[] = [];

    /**center=中 east=东 north=南 west=西 south=北 */
    betList = {
        center: { bet: 0, profit: 0 },
        east: { bet: 0, profit: 0 },
        north: { bet: 0, profit: 0 },
        west: { bet: 0, profit: 0 },
        south: { bet: 0, profit: 0 }
    }
    /**当局押注 续压用*/
    betAreas: { area: string, bet: number }[] = [];
    /**续压用 */
    lastBets: { area: string, bet: number }[] = [];
    /**是否强行下庄 */
    forceZhuang: boolean = false;
    /**手续费 */
    commission: number = 0;
    winRound: number = 0;
    /**待机轮数 */
    standbyRounds = 0;
    /**保留初始化金币 */
    initgold: number = 0;
    constructor(opts: any) {
        super(opts);
        this.gold = opts.gold;//金币
        this.commission = 0;//手续费
        this.initgold = this.gold;
    }

    /**初玩家信息 */
    playerInit(roomInfo: ttzRoom) {
        this.standbyRounds++;
        if (this.bet) {
            this.standbyRounds = 0;
            this.totalProfit.push(this.profit > 0 ? this.profit : 0);
            this.totalBet.push(this.bet);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
            this.winRound = this.totalProfit.reduce((total, Value) => {
                if (Value > 0) {
                    total++;
                }
                return total;
            }, 0);
            this.lastBets = this.betAreas;
        }
        if (roomInfo.zhuangInfo.uid == this.uid || roomInfo.zj_queues.find(pl => pl && pl.uid == this.uid)) {
            this.standbyRounds = 0;
        }
        this.betAreas = [];
        this.betList = {
            center: { bet: 0, profit: 0 },
            east: { bet: 0, profit: 0 },
            north: { bet: 0, profit: 0 },
            west: { bet: 0, profit: 0 },
            south: { bet: 0, profit: 0 }
        }
        this.bet = 0;
        this.profit = 0;
        this.commission = 0;//手续费
        this.initControlType();
    }

    /**下注操作 */
    handler_bet(roomInfo: ttzRoom, bets: { area: string, bet: number }) {
        // let bet = bets.bet;
        roomInfo.totalBet += bets.bet;
        let situation = roomInfo.situations.find(m => m.area == bets.area);
        if (!situation) {
            roomInfo.situations.push({ area: bets.area, betList: [], totalBet: 0 });
            situation = roomInfo.situations.find(m => m.area == bets.area);
        }
        situation.betList.push({
            uid: this.uid,
            bet: bets.bet,
            updatetime: new Date().getTime() / 1000
        });
        situation.totalBet += bets.bet;

        this.gold -= bets.bet;
        this.bet += bets.bet;
        this.betList[bets.area].bet += bets.bet;
        this.betAreas.push({ area: bets.area, bet: bets.bet });
    }

    // 包装玩家数据
    strip(hasRound: number) {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            gold: this.gold,
            totalProfit: this.totalProfit,
            hasRound: hasRound,
            online: this.onLine,
            isRobot: this.isRobot,
            bet: this.bet,
        }
    }

    // 发送邮件的时候包装玩家信息
    mailStrip() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            gain: this.profit,
        }
    }

    async addGold(roomInfo: ttzRoom) {
        let result = {
            uid: this.uid,
            isControl: roomInfo.control.isControl,
            banker: (this.uid == roomInfo.zhuangInfo.uid) ? true : false,
            regions_chang_gold: this.betList,
            lotterys: roomInfo.lotterys
        };
        if (this.uid == roomInfo.zhuangInfo.uid) {
            this.bet = Math.abs(this.profit);
        }
        let validBet = this.bet;
        if (Math.abs(this.profit) > this.bet && this.profit < 0) {
            validBet = Math.abs(this.profit);
        }
        try {
            const res = await createPlayerRecordService()
                .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
                .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
                .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
                .setGameRecordInfo(Math.abs(this.bet), validBet, this.profit, false)
                .addResult(roomInfo.zipResult)
                .setControlType(this.controlType)
                .setGameRecordLivesResult(result)
                .sendToDB(1);

            this.profit = res.playerRealWin;
            this.gold = res.gold;
            this.initgold = this.gold;
        } catch (error) {
            console.warn(this.gold, this.profit, this.betList);
        }
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
     * 获取押注超限的区域
     * @param condition 必杀条件
     */
    checkOverrunBet(condition: number): string[] {
        let areas: string[] = [];

        for (let area in this.betList) {
            if (condition <= this.betList[area].bet) {
                areas.push(area);
            }
        }

        return areas;
    }
}

