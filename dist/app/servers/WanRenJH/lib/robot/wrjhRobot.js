'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const utils = require("../../../../utils");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const robotBetUtil = require("../../../../utils/robot/robotBetUtil");
const mathUtil = require("../../../../utils/lottery/mathUtil");
const JsonMgr_1 = require("../../../../../config/data/JsonMgr");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
let pl_totalBets = [];
class Robot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.nowLun = 0;
        this.roundLun = utils.random(10, 50);
        this.bianlichishu = 0;
        this.isBanker = false;
        this.isApply = false;
        this.ApplyCont = 0;
        this.zj_sData = null;
        this.sumBets = [0, 0, 0, 0];
        this.isLeave = false;
    }
    async loaded() {
        try {
            const sceneInfo = (0, JsonMgr_1.get)('scenes/WanRenJH').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            if (!pl_totalBets.find(m => m.uid == this.uid)) {
                pl_totalBets.push({ uid: this.uid, roomId: this.roomId, totalBet: 0, flag: false });
            }
            let res = await this.requestByRoute("WanRenJH.mainHandler.loaded", {});
            this.compensate = res.room.compensate;
            this.lowBet = res.room.lowBet;
            this.upZhuangCond = res.room.upZhuangCond;
            this.gold = res.players.gold;
            let data = {
                downTime: res.room.countdownTime,
                status: res.room.status,
                isRenew: 0
            };
            if (data.status == "BETTING") {
                this.compBet(data);
            }
            return Promise.resolve(res);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async destroy() {
        this.isLeave = true;
        await this.leaveGameAndReset();
        pl_totalBets = pl_totalBets.filter(m => m.uid != this.uid);
    }
    registerListener() {
        this.Emitter.on("wr_onSettlement", this.onSettlement.bind(this));
        this.Emitter.on("wr_onBeting", this.onBet.bind(this));
        this.Emitter.on("wr_start", this.compBet.bind(this));
        this.Emitter.on("wr_onUpdateZhuangInfo", this.onUpdateZhuangInfo.bind(this));
    }
    onSettlement(data) {
        let pl_totalBet = pl_totalBets.find(m => m.roomId == this.roomId);
        if (pl_totalBet) {
            pl_totalBet.totalBet = 0;
            pl_totalBet.flag = false;
        }
        const Me = data.find(c => c.uid == this.uid);
        if (Me) {
            this.gold = Me.gold;
        }
    }
    async compBet(data) {
        try {
            if (this.isLeave) {
                return;
            }
            this.nowLun++;
            this.bianlichishu = 0;
            if (this.nowLun > this.roundLun) {
                this.destroy();
                return;
            }
            if (this.ApplyCont <= 3) {
                let ranLess = utils.random(1, 100);
                if (this.gold > this.upZhuangCond && ranLess <= 30 &&
                    !this.isApply && !this.isBanker) {
                    if (this.sceneId == 0 || (this.sceneId == 1 && this.gold >= this.lowBet * 300)) {
                        this.isApply = true;
                        let data = await this.requestByRoute("WanRenJH.mainHandler.applyUpzhuang", {});
                    }
                }
            }
            const stopBetTimeOut = Date.now() + data.downTime * 1000 - 1000;
            let randomFactor = utils.random(1, 100);
            const { betArea, betArr } = robotBetUtil.getBullFightBetInfo(randomFactor, this.gold - this.lowBet, (this.zj_sData && this.zj_sData.zhuangInfo) ? this.zj_sData.zhuangInfo.gold : 0, this.ChipList);
            if (commonUtil.isNullOrUndefined(betArea) || commonUtil.isNullOrUndefined(betArr) || !betArr.length) {
                return await this.destroy();
            }
            let delayTime = commonUtil.randomFromRange(5000, 8000);
            const delayArr = mathUtil.divideSumToNumArr(data.downTime * 1000 - delayTime, betArr.length);
            delayArr.unshift(delayTime);
            let sumCount = 0;
            if (this.zj_sData && this.zj_sData.zhuangInfo) {
                let delay = 1000;
                let zj_gold_peifu = this.zj_sData.zhuangInfo.gold / this.compensate * 0.6;
                let pl_totalBet = pl_totalBets.find(m => m.roomId == this.roomId);
                pl_totalBet.totalBet += utils.sum(betArr);
                if (pl_totalBet.totalBet > zj_gold_peifu) {
                    delay = 2000;
                }
                for (let idx = 0; idx < delayArr.length; idx++) {
                    delayArr[idx] = delayArr[idx] + delay;
                }
            }
            for (let i = 0; i < delayArr.length; i++) {
                delayTime = delayArr[i];
                if (Date.now() + delayTime >= stopBetTimeOut || this.isBanker) {
                    break;
                }
                if (i > betArr.length - 1) {
                    break;
                }
                sumCount = sumCount + betArr[i];
                if (sumCount * this.compensate > this.gold)
                    continue;
                try {
                    await this.delayRequest('WanRenJH.mainHandler.bet', {
                        betNum: betArr[i],
                        area: betArea
                    }, delayTime);
                    this.gold -= betArr[i];
                }
                catch (error) {
                    robotlogger.info(`wrjh|${this.isBanker}|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`);
                    break;
                }
            }
        }
        catch (error) {
            robotlogger.error(error);
        }
    }
    async onUpdateZhuangInfo(data) {
        this.ApplyCont = data.applyZhuangs.length;
        this.zj_sData = data;
        if (data.zhuangInfo && data.zhuangInfo.uid == this.uid) {
            this.isBanker = true;
            this.isApply = false;
        }
        else {
            this.isBanker = false;
        }
    }
    async onBet(res) {
        if (res.sumBets) {
            this.sumBets = res.sumBets;
            this.curBetNums = res.sumBets;
        }
    }
}
exports.default = Robot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JqaFJvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvV2FuUmVuSkgvbGliL3JvYm90L3dyamhSb2JvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFzQkEsWUFBWSxDQUFDOztBQUViLDJFQUF3RTtBQUN4RSwyQ0FBNEM7QUFDNUMsbUVBQW1FO0FBRW5FLHFFQUFzRTtBQUN0RSwrREFBZ0U7QUFHaEUsZ0VBQTZFO0FBRTdFLCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBR3ZELElBQUksWUFBWSxHQUFxRSxFQUFFLENBQUM7QUFFeEYsTUFBcUIsS0FBTSxTQUFRLHFCQUFTO0lBc0J4QyxZQUFZLElBQVM7UUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBcEJoQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBRW5CLGFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNoQyxpQkFBWSxHQUFXLENBQUMsQ0FBQztRQUd6QixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBRWpCLFlBQU8sR0FBRyxLQUFLLENBQUM7UUFFaEIsY0FBUyxHQUFHLENBQUMsQ0FBQztRQU9kLGFBQVEsR0FBMEMsSUFBSSxDQUFDO1FBSW5ELElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztJQUN6QixDQUFDO0lBR0QsS0FBSyxDQUFDLE1BQU07UUFDUixJQUFJO1lBQ0EsTUFBTSxTQUFTLEdBQWMsSUFBQSxhQUFnQixFQUFDLGlCQUFpQixDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FB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