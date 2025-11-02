import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import utils = require('../../../utils/index');
import wrjhRoom from './wrjhRoom';
import * as mailModule from '../../../modules/mailModule';
import { getLogger } from 'pinus';
const Logger = getLogger('server_out', __filename);
// 一个玩家
export default class wrjhPlayer extends PlayerInfo {
    /**天地玄黄 对应下注 */
    bets = [{ bet: 0, profit: 0 }, { bet: 0, profit: 0 }, { bet: 0, profit: 0 }, { bet: 0, profit: 0 }];
    /**续压用 */
    lastBets: { area: number, betNum: number }[] = [];
    /**是否下过注 */
    isBet: boolean = false;
    /**最后一次的收益 */
    lastProfit: number = 0;
    /**在房间里面的累计下注 */
    addUpBet: number = 0;
    zhuang: boolean = false;
    /**回合盈利 */
    profit: number = 0;
    /**进入房间的总盈利 */
    totalProfit: number[] = [];
    /**当局下注 */
    bet: number = 0;
    /**回合总下注 */
    totalBet: number[] = [];
    /**待机轮数 */
    standbyRounds = 0;
    regions_chang_gold: { area: number, chang_gold: number }[] = []
    winRound: number = 0;
    /**保留初始化金币 */
    initgold: number = 0;
    constructor(opts: any) {
        super(opts);
        this.gold = utils.sum(opts.gold);
        this.initgold = this.gold;
    }

    /**初始游戏信息 */
    initGame(roomInfo: wrjhRoom) {
        this.initControlType();
        this.standbyRounds++;
        if (this.bet) {
            this.lastProfit = this.profit;
            this.totalProfit.push(this.profit > 0 ? this.profit : 0);
            this.totalBet.push(this.bet);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
            this.lastBets = [];
            for (const situation of roomInfo.situations) {
                for (const bet_ of situation.betList) {
                    if (bet_.uid == this.uid)
                        this.lastBets.push({ area: situation.area, betNum: bet_.bet })
                }
            }
            this.standbyRounds = 0;
        }
        if (roomInfo.zhuangInfo.uid == this.uid || roomInfo.applyZhuangs.find(pl => pl.uid == this.uid)) {
            this.standbyRounds = 0;
        }
        this.regions_chang_gold = [];
        this.lastProfit = this.profit;
        this.profit = 0;// 当前收益
        this.bet = 0;//当前押注
        this.bets = [{ bet: 0, profit: 0 }, { bet: 0, profit: 0 }, { bet: 0, profit: 0 }, { bet: 0, profit: 0 }];
        this.isBet = false;
        this.winRound = this.totalProfit.reduce((total, Value) => {
            if (Value > 0) {
                total++;
            }
            return total;
        }, 0);
    }

    /**结算 */
    settlementBairenPlayer(roomInfo: wrjhRoom) {
        for (let i = this.bets.length - 1; i >= 0; i--) {
            const num = this.bets[i];
            if (num.bet > 0) {
                // this.sumBet += num.bet;
                num.profit = (roomInfo.regions[i].isWin ? 1 : -1) * (roomInfo.regions[i].multiple * num.bet);
                this.profit += num.profit
                this.regions_chang_gold.push({ area: i, chang_gold: this.profit });
            }
        }
    }
    /**是否可以续压 */
    isCanRenew(roomInfo: wrjhRoom) {
        if (this.isRobot == 2) {
            return 0;
        }
        let tatalBet = this.lastBets.reduce((total, Value) => {
            total += Value.betNum;
            return total;
        }, 0);
        if (roomInfo.compensate * tatalBet > this.gold) {
            return 0;
        }
        return this.lastBets.length;
    }
    /**是否有下注 */
    hasBet() {
        return this.bets.some(m => m.bet > 0);
    }

    /**结算信息 - 参与发送邮件 */
    toSettlementInfoByMail() {
        return {
            uid: this.uid,
            profit: this.profit,
            sumBet: this.bet,
            bets: this.bets
        }
    }

    /**返回给前端 */
    result() {
        return {
            uid: this.uid,
            gold: this.gold,
            profit: this.profit,
            bet: this.bet,
            nickname: this.nickname,
            headurl: this.headurl,
            bets: this.bets
        };
    }

    strip(hasRound) {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            gold: this.gold,
            profit: this.lastProfit,
            hasRound: hasRound
        };
    }

    strip1() {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            bet: this.bet,
            gold: this.gold,
            robot: this.isRobot,
        };
    }

    /**排行榜数据包装 */
    strip2() {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            gold: this.gold,
            profit: this.profit,
            bets: this.bets,
            isRobot: this.isRobot
        };
    }
    loadedStrip(roomInfo: wrjhRoom) {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            bet: this.bet,
            bets: this.bets,
            gold: this.gold,
            // lastBets: this.lastBets,
            isRenew: this.isCanRenew(roomInfo)
        };
    }
    /**更新玩家金币 */
    async updateGold(roomInfo: wrjhRoom) {
        let result = {
            uid: this.uid,
            banker: (roomInfo.zhuangInfo && roomInfo.zhuangInfo.uid == this.uid) ? true : false,
            area: this.bets,
            Kaijiang_area: roomInfo.regions,
            zhuangResult: roomInfo.zhuangResult,
            regions_chang_gold: this.regions_chang_gold
        };
        let validBet = this.bet;
        if (Math.abs(this.profit) > this.bet && this.profit < 0) {
            validBet = Math.abs(this.profit);
        }
        //添加战绩
        const res = await createPlayerRecordService()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setControlType(this.controlType)
            .setGameRecordInfo(this.bet, validBet, this.profit, roomInfo.zhuangInfo.uid === this.uid)
            .setGameRecordLivesResult(result)
            .sendToDB(1);

        this.profit = res.playerRealWin;
        this.gold = utils.sum(res.gold);
        this.initgold = this.gold;
        //记录庄家累计收益
        if (roomInfo.zhuangInfo.uid == this.uid) {
            roomInfo.zhuangInfo.money += this.profit;
        }
        //添加跑马灯
        this.profit > 0 && roomInfo.addResult(this, this.profit);

        //给离线玩家发送邮件
        // !this.onLine && mailModule.changeGoldsByMail21({
        //     zhuangResult: roomInfo.zhuangResult,
        //     regions: roomInfo.regions,
        //     zhuangUid: roomInfo.zhuangInfo.uid
        // }, this);
    }

    /**
     * 获取超限押注
     * @param condition 超限条件 这里条件值跟金币是 1 : 100 所以计算的时候要 * 100
     */
    checkOverrunBet(condition: number): CommonControlState[] {
        const con = condition * 100;

        return this.bets.map(betNumber => {
            return betNumber.bet >= con ? CommonControlState.LOSS : CommonControlState.RANDOM;
        });
    }
}
