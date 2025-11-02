"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const utils = require("../../../../utils");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const robotBetUtil = require("../../../../utils/robot/robotBetUtil");
const mathUtil = require("../../../../utils/lottery/mathUtil");
const JsonMgr_1 = require("../../../../../config/data/JsonMgr");
const pl_totalBets = [];
class TTZRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.isBanker = false;
        this.bankerLength = 0;
        this.zhuangInfo = null;
        this.playRound = 0;
        this.leaveRound = commonUtil.randomFromRange(50, 100);
        this.richRobotUid = '';
        this.robotListLength = 0;
    }
    async ttzLoaded() {
        try {
            const sceneInfo = (0, JsonMgr_1.get)('scenes/bairenTTZ').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            const data = await this.requestByRoute(`bairenTTZ.mainHandler.loaded`, {});
            if (data.roomInfo.status == 'BETTING') {
            }
            this.upZhuangCond = data.roomInfo.upZhuangCond;
            this.lowBet = data.roomInfo.lowBet;
            if (!pl_totalBets.find(m => m.roomId == this.roomId)) {
                pl_totalBets.push({ roomId: this.roomId, totalBet: 0, flag: false });
            }
            this.playerGold = data.pl.gold;
            if (data.roomInfo.status == "BETTING") {
                const result = { countdown: data.roomInfo.countdown, lotterys: null, isRenew: null, roundId: null, robotNum: null, gold: null };
                this.onTTZStartBet(result);
            }
            return Promise.resolve();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async destroy() {
        await this.leaveGameAndReset(false);
    }
    checkLeave() {
        if (this.isBanker) {
            return false;
        }
        if (this.playerGold < this.lowBet || this.playRound > this.leaveRound) {
            return true;
        }
        return this.richRobotUid === this.uid;
    }
    registerListener() {
        this.Emitter.on(`TTZ_BETTING`, this.onTTZStartBet.bind(this));
        this.Emitter.on("TTZ_Start", this.onTTZ_Start.bind(this));
        this.Emitter.on(`TTZ_OtherBets`, (data) => {
            if (data && data.uid == this.uid) {
                this.playerGold = data.gold;
            }
        });
        this.Emitter.on(`bairenTTZ_zj_info`, (data) => {
            if (data.zhuangInfo && data.zhuangInfo.uid == this.uid) {
                this.isBanker = true;
            }
            else {
                this.isBanker = false;
            }
            this.bankerLength = data.applyZhuangsNum;
            this.zhuangInfo = data;
        });
        this.Emitter.on("TTZ_Lottery", this.onSettlement.bind(this));
    }
    async onTTZ_Start(data) {
        this.playerGold = data.gold;
        if (this.checkLeave()) {
            return this.destroy();
        }
        this.checkBanker();
    }
    onSettlement() {
        let pl_totalBet = pl_totalBets.find(m => m.roomId == this.roomId);
        if (pl_totalBet) {
            pl_totalBet.totalBet = 0;
            pl_totalBet.flag = false;
        }
    }
    async onTTZStartBet(data) {
        if (this.isBanker)
            return;
        const betCountdown = data.countdown;
        const stopBetTimeStamp = Date.now() + betCountdown * 1000;
        const randomFactor = commonUtil.randomFromRange(1, 100);
        const { betArea, betArr } = robotBetUtil.getTTZBetInfo(randomFactor, this.sceneId, this.playerGold, this.ChipList);
        let delayTime = commonUtil.randomFromRange(400, 1000);
        const delayArr = mathUtil.divideSumToNumArr(betCountdown * 1000 - delayTime, betArr.length).filter(num => num >= 1000);
        delayArr.unshift(delayTime);
        if (this.zhuangInfo && this.zhuangInfo.zhuangInfo) {
            let delay = 1000;
            let zj_gold_peifu = this.zhuangInfo.zhuangInfo.gold * 0.6;
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
            if (Date.now() + delayTime >= stopBetTimeStamp) {
                break;
            }
            if (i > betArr.length - 1 || this.playerGold < betArr[i]) {
                continue;
            }
            try {
                let bets = { area: betArea, bet: betArr[i] };
                let res = await this.delayRequest(`bairenTTZ.mainHandler.userBet`, bets, delayTime);
                this.playerGold -= betArr[i];
            }
            catch (error) {
                break;
            }
        }
        this.playRound++;
    }
    async checkBanker() {
        if (this.isBanker) {
            return;
        }
        const ranLess = commonUtil.randomFromRange(1, 100) <= 30;
        if (this.playerGold > this.upZhuangCond && ranLess && this.bankerLength <= 3) {
            try {
                let res = await this.requestByRoute(`bairenTTZ.mainHandler.applyZhuang`, { apply: true });
            }
            catch (error) {
            }
        }
    }
}
exports.default = TTZRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHR6Um9ib3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9iYWlyZW5UVFovbGliL3JvYm90L3R0elJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsMkVBQXdFO0FBQ3hFLDJDQUE0QztBQUM1QyxtRUFBb0U7QUFDcEUscUVBQXNFO0FBR3RFLCtEQUFnRTtBQUNoRSxnRUFBNkU7QUFJN0UsTUFBTSxZQUFZLEdBQXdELEVBQUUsQ0FBQztBQUs3RSxNQUFxQixRQUFTLFNBQVEscUJBQVM7SUFpQjNDLFlBQVksSUFBSTtRQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQWpCaEIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQVF2QixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBRWpCLGlCQUFZLEdBQVcsQ0FBQyxDQUFDO1FBSXpCLGVBQVUsR0FBZ0MsSUFBSSxDQUFDO1FBSzNDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUdELEtBQUssQ0FBQyxTQUFTO1FBQ1gsSUFBSTtZQUNBLE1BQU0sU0FBUyxHQUFjLElBQUEsYUFBZ0IsRUFBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqSCxJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDbkMsTUFBTSxJQUFJLEdBQTJDLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyw4QkFBOEIs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