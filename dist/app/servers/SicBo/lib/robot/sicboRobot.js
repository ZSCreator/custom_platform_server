'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const CommonUtil = require("../../../../utils/lottery/commonUtil");
const mathUtil = require("../../../../utils/lottery/mathUtil");
const robotBetUtil = require("../../../../utils/robot/robotBetUtil");
const JsonMgr_1 = require("../../../../../config/data/JsonMgr");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
class SicboRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.playRound = 0;
        this.leaveRound = CommonUtil.randomFromRange(10, 100);
        this.betLowLimit = opts.betLowLimit;
    }
    async sicboLoaded() {
        try {
            const sceneInfo = (0, JsonMgr_1.get)('scenes/SicBo').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            const res = await this.requestByRoute("SicBo.mainHandler.loaded", {});
            this.playerGold = res.pl.gold;
            if (res.room.roomStatus == "BETTING") {
                this.onSicboStart({ countDown: res.room.countDown });
            }
            return Promise.resolve();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async destroy() {
        await this.leaveGameAndReset();
    }
    registerListener() {
        this.Emitter.on("SicBo.result", (resultData) => this.onSicboResult(resultData));
        this.Emitter.on("SicBo.userChange", async (changeData) => await this.onSicboUserChange(changeData));
        this.Emitter.on("SicBo.start", (onBetData) => this.onSicboStart(onBetData));
    }
    onSicboResult(resultData) {
        const dataOfRobot = resultData.userWin[this.uid];
        if (dataOfRobot && typeof dataOfRobot === 'object' && dataOfRobot.totalWin) {
            this.playerGold += dataOfRobot.totalWin;
        }
    }
    async onSicboUserChange(changeData) {
    }
    async onSicboStart(onBetData) {
        const countdown = onBetData.countDown * 1000;
        const stopBetTimeOut = Date.now() + countdown - 1000;
        if (this.playRound > this.leaveRound ||
            this.playerGold < this.betLowLimit ||
            (this.isRobot == 2 && (this.playerGold < this.gold_min || this.playerGold > this.gold_max))) {
            return this.destroy();
        }
        const { betType, betArr } = robotBetUtil.getSicboBetTypeAndGold(this.playerGold, this.sceneId, this.ChipList);
        if (CommonUtil.isNullOrUndefined(betType) || !betArr.length) {
            return this.destroy();
        }
        let delayTime = CommonUtil.randomFromRange(2000, 3000);
        const delayArr = mathUtil.divideSumToNumArr(countdown - delayTime, betArr.length - 1);
        delayArr.unshift(delayTime);
        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];
            if (Date.now() + delayTime >= stopBetTimeOut || this.playerGold < this.betLowLimit) {
                break;
            }
            let bets = { area: betType, bet: betArr[i] };
            try {
                await this.delayRequest("SicBo.mainHandler.userBet", bets, delayTime);
                this.playerGold -= betArr[i];
            }
            catch (error) {
                robotlogger.info(`骰宝下注出错|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`);
                break;
            }
        }
        this.playRound++;
    }
}
exports.default = SicboRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ljYm9Sb2JvdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1NpY0JvL2xpYi9yb2JvdC9zaWNib1JvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYiwyRUFBd0U7QUFHeEUsbUVBQW9FO0FBQ3BFLCtEQUFnRTtBQUNoRSxxRUFBc0U7QUFDdEUsZ0VBQTZFO0FBRTdFLCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBR3ZELE1BQXFCLFVBQVcsU0FBUSxxQkFBUztJQU03QyxZQUFZLElBQUk7UUFDWixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUN4QyxDQUFDO0lBR0QsS0FBSyxDQUFDLFdBQVc7UUFDYixJQUFJO1lBQ0EsTUFBTSxTQUFTLEdBQWMsSUFBQSxhQUFnQixFQUFDLGNBQWMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3RyxJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDbkMsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLDBCQUEwQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLEVB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