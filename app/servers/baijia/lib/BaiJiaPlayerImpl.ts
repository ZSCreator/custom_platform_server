import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import baijiaConst = require('./baijiaConst');
import utils = require('../../../utils/index');
import * as mailModule from '../../../modules/mailModule';
import BaiJiaRoomImpl from './BaiJiaRoomImpl';
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
import { getLogger } from 'pinus';
const baijiaLogger = getLogger('server_out', __filename);

/**一个玩家 */
export class BaiJiaPlayerImpl extends PlayerInfo {
    /**最后一次的押注 */
    lastBets: { area: string, bet: number }[] = [];
    bets: {
        play: { mul: number; bet: number; gain: number; }; // 闲
        draw: { mul: number; bet: number; gain: number; }; // 和
        bank: { mul: number; bet: number; gain: number; }; // 庄
        small: { mul: number; bet: number; gain: number; }; // 小
        pair0: { mul: number; bet: number; gain: number; }; // 闲对
        pair1: { mul: number; bet: number; gain: number; }; // 庄对
        big: { mul: number; bet: number; gain: number; };// 大
    };
    /**开和退钱总额 */
    refundNum: number = 0;
    /**最后一次的收益 */
    lastGain: number = 0;
    /**玩家自己最大押注 */
    maxBet: number = 0;

    /**当局下注 */
    bet: number = 0;
    /**回合总下注 */
    totalBet: number[] = [];
    /**回合盈利 */
    profit: number = 0;
    /**进入房间的总盈利 */
    totalProfit: number[] = [];
    /**待机轮数 */
    standbyRounds = 0;
    /**有效押注 */
    validBet: number = 0;
    // 调控状态
    controlState: CommonControlState;
    /**保留初始化金币 */
    initgold: number = 0;
    winRound: number = 0;
    constructor(opts: any) {
        super(opts);
        // this.lastBets = [];// 最后一次的押注
        this.bets = {
            play: { mul: 1, bet: 0, gain: 0 }, // 闲
            draw: { mul: 8, bet: 0, gain: 0 }, // 和
            bank: { mul: 0.95, bet: 0, gain: 0 }, // 庄
            small: { mul: 1.5, bet: 0, gain: 0 }, // 小
            pair0: { mul: 11, bet: 0, gain: 0 }, // 闲对
            pair1: { mul: 11, bet: 0, gain: 0 }, // 庄对
            big: { mul: 0.5, bet: 0, gain: 0 }, // 大
        };
        this.profit = 0;// 当前总收益
        this.refundNum = 0;//开和退钱总额
        this.lastGain = 0;// 最后一次的收益
        this.maxBet = 0;//玩家自己最大押注
        this.bet = 0;
        this.validBet = 0;      // 有效押注

        this.controlState = CommonControlState.RANDOM;  // 随机
        this.initgold = this.gold;
    }

    /**初始游戏信息 */
    async initGame(roomInfo: BaiJiaRoomImpl) {
        this.standbyRounds++;
        if (this.bet) {
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
            this.lastBets = [];
            for (let key in this.bets) {
                if (this.bets[key].bet != 0) {
                    this.lastBets.push({ area: key, bet: this.bets[key].bet });
                }
            }
            this.standbyRounds = 0;
        }
        if (roomInfo.zhuangInfo.uid == this.uid ||
            roomInfo.zj_List.find(pl => pl && pl.uid == this.uid)) {
            this.standbyRounds = 0;
        }

        this.validBet = 0;
        for (let key in this.bets) {
            this.bets[key].bet = 0;
            this.bets[key].gain = 0;
        }
        this.lastGain = this.profit;// 总收益
        this.profit = 0;// 当前收益
        this.refundNum = 0;
        this.maxBet = 0;
        this.bet = 0;

        this.controlState = CommonControlState.RANDOM;  // 随机
        this.initControlType();
    }

    /**获取总押注 */
    sumBetNum() {
        let num = 0;
        for (let key in this.bets) {
            num += this.bets[key].bet;
        }
        return num;
    }

    /**
     * 玩家有效押注
     * @param betNumber 
     */
    validBetCount(betNumber: number) {
        this.validBet = betNumber;
    }

    /**最后一次押注 */
    lastSumBetNum() {
        let num = 0;
        for (const lastBet of this.lastBets) {
            num += lastBet.bet;
        }
        return num;
    }

    /**结算 */
    settlement(ret: baijiaConst.KaiJiangReulst) {
        this.profit = 0;
        this.refundNum = 0;
        for (let key in ret) {
            /**true赢 反之 输 */
            const v = this.bets[key];
            if (ret[key]) {
                this.profit += Math.floor(v.bet * v.mul);
                this.bets[key].gain = Math.floor(v.bet * v.mul);
            } else {
                this.profit -= v.bet;
                this.bets[key].gain = -v.bet;
            }
        }
        // 如果是和 把压得庄和闲退回
        if (ret.draw) {
            this.refundNum += this.bets.play.bet;
            this.refundNum += this.bets.bank.bet;
            // console.log('-----和退钱：'+ this.refundNum);
            this.profit += this.refundNum;
        }
        this.lastGain = this.profit;
    }


    /**
     * 结算信息 - 参与发送邮件
     */
    toSettlementInfoByMail() {
        const content = `由于断线/退出游戏。您在[百家乐]游戏中押注:${this.bet / 100}金币已经自动结算，开奖结果如下：\n您的本局收益为:${this.profit / 100}`;
        mailModule.changeGoldsByMail2({ uid: this.uid, content })
    }

    /**
     * 返回给前端
     */
    result() {
        return {
            uid: this.uid,
            gold: this.gold,
            bet: this.bet,
            profit: this.profit,
            refundNum: this.refundNum,
            bets: this.bets,
            nickname: this.nickname,
            headurl: this.headurl,
        };
    }

    strip(hasRound?: number) {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            gold: this.gold,
            gain: this.lastGain,
            totalProfit: utils.sum(this.totalProfit),
            bet: this.bet,
            hasRound: hasRound,
        };
    }
    strip1() {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            gold: this.gold,
            gain: this.lastGain,
            totalProfit: utils.sum(this.totalProfit),
            bet: this.bet,
            isRobot: this.isRobot,
        };
    }

    /**获取本回合积累下注 */
    getAllBet() {
        let allBet = 0;
        for (let i in this.bets) {
            allBet += this.bets[i].bet;
        }
        return allBet;
    }

    /**
     * 检查是否押注超限
     */
    checkOverrunBet(params: { condition: number }): object {
        let transfiniteArea = {}, transfiniteCondition = params.condition * 100;
        if (transfiniteCondition === 0) return transfiniteArea;

        for (let area in this.bets) {
            if (this.bets[area].bet >= transfiniteCondition) {
                transfiniteArea[area] = this.bets[area].bet;
            }
        }

        return transfiniteArea;
    }

    /**
     * 设置玩家调控状态
     */
    setControlState(params: { state: CommonControlState }): void {
        this.controlState = params.state;
    }

    /**
     * 过滤掉被杀的区域
     * @param killAreas
     */
    filterBetNum(killAreas: Set<string>): number {
        let bet: number = 0;

        for (let area in this.bets) {
            if (killAreas.has(area)) {
                continue;
            }
            bet += this.bets[area].bet;
        }
        return bet;
    }


    /**更新玩家金币 */
    async updateGold(roomInfo: BaiJiaRoomImpl) {
        if ((this.uid == roomInfo.zhuangInfo.uid && roomInfo.allBets == 0) ||
            this.bet == 0) {
            return;
        }
        if (this.uid == roomInfo.zhuangInfo.uid) {
            this.bet = Math.abs(this.profit);
        }
        this.validBet = Math.abs(this.profit) > this.bet ? Math.abs(this.profit) : this.bet;
        try {
            roomInfo.calculateValidBet(this);
            let result = {
                uid: this.uid,
                isControl: roomInfo.controlLogic.isControl,
                banker: (roomInfo.zhuangInfo && roomInfo.zhuangInfo.uid == this.uid) ? true : false,
                area: this.bets,
                Kaijiang_area: roomInfo.area_bet,
                zhuangResult: roomInfo.zhuangInfo,
                regions_chang_gold: this.bets,
                regions: roomInfo.regions
            }
            const res = await createPlayerRecordService()
                .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
                .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
                .setControlType(this.controlType)
                .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
                .setGameRecordInfo(Math.abs(this.bet), Math.abs(this.validBet), this.profit, false)
                .setGameRecordLivesResult(result)
                .sendToDB(1);

            this.profit = res.playerRealWin;
            if (this.uid === roomInfo.zhuangInfo.uid) {
                roomInfo.zhuangInfo.profit = this.profit;
                roomInfo.zhuangInfo.money += this.profit;
            }
            this.gold = res.gold;
            this.initgold = this.gold;
            //添加跑马灯集合
            roomInfo.addNote(this, this.profit);
            // (this.isRobot == 0) && !this.onLine && this.toSettlementInfoByMail();
        } catch (error) {
            baijiaLogger.error('欢乐百人结算日志记录失败', error);
        }
    }
}
