import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import benzRoom from './benzRoom';
import benzConst = require('./benzConst');
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';

export default class benzPlayer extends PlayerInfo {
    /**当局下注 */
    bet: number = 0;
    /**回合总下注 */
    totalBet: number[] = [];
    /**回合盈利 */
    profit: number = 0;
    /**进入房间的总盈利 */
    totalProfit: number[] = [];

    betList: { area: benzConst.BetAreas, bet: number, profit: number }[] = [];
    /**续压用 */
    lastBets: { area: benzConst.BetAreas, bet: number, profit: number }[] = [];
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
    playerInit() {
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
            this.lastBets = this.betList;
        }
        // this.betAreas = [];
        this.betList = []
        this.bet = 0;
        this.profit = 0;
        this.commission = 0;//手续费
        this.initControlType();
    }

    /**下注操作 */
    handler_bet(roomInfo: benzRoom, betList: { uid: string, area: benzConst.BetAreas, bet: number }[]) {
        for (const bet_e of betList) {
            roomInfo.totalBet += bet_e.bet;
            let situation = roomInfo.situations.find(m => m.area == bet_e.area);
            if (!situation) {
                roomInfo.situations.push({ area: bet_e.area, betList: [], totalBet: 0 });
                situation = roomInfo.situations.find(m => m.area == bet_e.area);
            }
            situation.betList.push({
                uid: this.uid,
                bet: bet_e.bet,
                updatetime: new Date().getTime() / 1000
            });
            situation.totalBet += bet_e.bet;

            this.bet += bet_e.bet;
            this.gold -= bet_e.bet;
            this.betList.push({ area: bet_e.area, bet: bet_e.bet, profit: 0 });
        }
        const opts = {
            bet: betList,
            rankingList: roomInfo.rankingLists().slice(0, 6)
        }
        roomInfo.channelIsPlayer("Benz.OtherBets", opts);
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

    async addGold(roomInfo: benzRoom) {
        /**
         * 添加战绩
         */
        let result = {
            uid: this.uid,
            lotterys: roomInfo.lotterys,
            regions_chang_gold: this.betList
        };
        result.regions_chang_gold = [];
        for (const eee of this.betList) {
            if (!result.regions_chang_gold.find(c => c.area == eee.area)) {
                result.regions_chang_gold.push({ area: eee.area, bet: 0, profit: 0 });
            }
            let temp = result.regions_chang_gold.find(c => c.area == eee.area);
            temp.bet += eee.bet;
            temp.profit += eee.profit;
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
            console.warn(this.gold, this.profit, this.bet);
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
     * 检查是否押注超限
     * @param condition
     */
    checkOverrunBet(condition: number) {
        const areas = {};
        const bets = {};

        this.betList.forEach(lattice => {
            if (!bets[lattice.area]) {
                bets[lattice.area] = 0;
            }

            bets[lattice.area] += lattice.bet;
        });

        for (let area in bets) {
           if (bets[area] >= condition) {
               areas[area] = bets[area];
           }
        }

        return areas;
    }
}

