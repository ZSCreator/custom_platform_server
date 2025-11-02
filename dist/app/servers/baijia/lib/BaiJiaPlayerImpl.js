"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaiJiaPlayerImpl = void 0;
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const utils = require("../../../utils/index");
const mailModule = require("../../../modules/mailModule");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const pinus_1 = require("pinus");
const baijiaLogger = (0, pinus_1.getLogger)('server_out', __filename);
class BaiJiaPlayerImpl extends PlayerInfo_1.PlayerInfo {
    constructor(opts) {
        super(opts);
        this.lastBets = [];
        this.refundNum = 0;
        this.lastGain = 0;
        this.maxBet = 0;
        this.bet = 0;
        this.totalBet = [];
        this.profit = 0;
        this.totalProfit = [];
        this.standbyRounds = 0;
        this.validBet = 0;
        this.initgold = 0;
        this.winRound = 0;
        this.bets = {
            play: { mul: 1, bet: 0, gain: 0 },
            draw: { mul: 8, bet: 0, gain: 0 },
            bank: { mul: 0.95, bet: 0, gain: 0 },
            small: { mul: 1.5, bet: 0, gain: 0 },
            pair0: { mul: 11, bet: 0, gain: 0 },
            pair1: { mul: 11, bet: 0, gain: 0 },
            big: { mul: 0.5, bet: 0, gain: 0 },
        };
        this.profit = 0;
        this.refundNum = 0;
        this.lastGain = 0;
        this.maxBet = 0;
        this.bet = 0;
        this.validBet = 0;
        this.controlState = commonConst_1.CommonControlState.RANDOM;
        this.initgold = this.gold;
    }
    async initGame(roomInfo) {
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
        this.lastGain = this.profit;
        this.profit = 0;
        this.refundNum = 0;
        this.maxBet = 0;
        this.bet = 0;
        this.controlState = commonConst_1.CommonControlState.RANDOM;
        this.initControlType();
    }
    sumBetNum() {
        let num = 0;
        for (let key in this.bets) {
            num += this.bets[key].bet;
        }
        return num;
    }
    validBetCount(betNumber) {
        this.validBet = betNumber;
    }
    lastSumBetNum() {
        let num = 0;
        for (const lastBet of this.lastBets) {
            num += lastBet.bet;
        }
        return num;
    }
    settlement(ret) {
        this.profit = 0;
        this.refundNum = 0;
        for (let key in ret) {
            const v = this.bets[key];
            if (ret[key]) {
                this.profit += Math.floor(v.bet * v.mul);
                this.bets[key].gain = Math.floor(v.bet * v.mul);
            }
            else {
                this.profit -= v.bet;
                this.bets[key].gain = -v.bet;
            }
        }
        if (ret.draw) {
            this.refundNum += this.bets.play.bet;
            this.refundNum += this.bets.bank.bet;
            this.profit += this.refundNum;
        }
        this.lastGain = this.profit;
    }
    toSettlementInfoByMail() {
        const content = `由于断线/退出游戏。您在[百家乐]游戏中押注:${this.bet / 100}金币已经自动结算，开奖结果如下：\n您的本局收益为:${this.profit / 100}`;
        mailModule.changeGoldsByMail2({ uid: this.uid, content });
    }
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
    strip(hasRound) {
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
    getAllBet() {
        let allBet = 0;
        for (let i in this.bets) {
            allBet += this.bets[i].bet;
        }
        return allBet;
    }
    checkOverrunBet(params) {
        let transfiniteArea = {}, transfiniteCondition = params.condition * 100;
        if (transfiniteCondition === 0)
            return transfiniteArea;
        for (let area in this.bets) {
            if (this.bets[area].bet >= transfiniteCondition) {
                transfiniteArea[area] = this.bets[area].bet;
            }
        }
        return transfiniteArea;
    }
    setControlState(params) {
        this.controlState = params.state;
    }
    filterBetNum(killAreas) {
        let bet = 0;
        for (let area in this.bets) {
            if (killAreas.has(area)) {
                continue;
            }
            bet += this.bets[area].bet;
        }
        return bet;
    }
    async updateGold(roomInfo) {
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
            };
            const res = await (0, RecordGeneralManager_1.default)()
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
            roomInfo.addNote(this, this.profit);
        }
        catch (error) {
            baijiaLogger.error('欢乐百人结算日志记录失败', error);
        }
    }
}
exports.BaiJiaPlayerImpl = BaiJiaPlayerImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFpSmlhUGxheWVySW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2JhaWppYS9saWIvQmFpSmlhUGxheWVySW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1RUFBb0U7QUFDcEUsa0ZBQXNGO0FBRXRGLDhDQUErQztBQUMvQywwREFBMEQ7QUFHMUQsbUZBQWlGO0FBQ2pGLGlDQUFrQztBQUNsQyxNQUFNLFlBQVksR0FBRyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBR3pELE1BQWEsZ0JBQWlCLFNBQVEsdUJBQVU7SUFvQzVDLFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFuQ2hCLGFBQVEsR0FBb0MsRUFBRSxDQUFDO1FBVy9DLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFFdEIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUVyQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBR25CLFFBQUcsR0FBVyxDQUFDLENBQUM7UUFFaEIsYUFBUSxHQUFhLEVBQUUsQ0FBQztRQUV4QixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBRW5CLGdCQUFXLEdBQWEsRUFBRSxDQUFDO1FBRTNCLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBRWxCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFJckIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBSWpCLElBQUksQ0FBQyxJQUFJLEdBQUc7WUFDUixJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRTtZQUNqQyxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRTtZQUNqQyxJQUFJLEVBQUUsRUFBRSxHQUFH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