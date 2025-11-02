'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../../../../utils");
const benzConst = require("../benzConst");
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const CommonUtil = require("../../../../utils/lottery/commonUtil");
const mathUtil = require("../../../../utils/lottery/mathUtil");
const robotBetUtil = require("../../../../utils/robot/robotBetUtil");
const JsonMgr_1 = require("../../../../../config/data/JsonMgr");
const gamesBetAstrict_1 = require("../../../../../config/data/gamesBetAstrict");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
class up7Robot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.playRound = 0;
        this.leaveRound = CommonUtil.randomFromRange(10, 100);
    }
    async Loaded() {
        try {
            const sceneInfo = (0, JsonMgr_1.get)('scenes/BenzBmw').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            let res = await this.requestByRoute("BenzBmw.mainHandler.loaded", {});
            this.playerGold = res.pl.gold;
            this.lowBet = res.roomInfo.lowBet;
            return Promise.resolve();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async destroy() {
        await this.leaveGameAndReset(false);
    }
    registerListener() {
        this.Emitter.on("Benz.Lottery", this.onSicboResult.bind(this));
        this.Emitter.on("Benz.BETTING", this.onSicboStart.bind(this));
    }
    onSicboResult(resultData) {
        const dataOfRobot = resultData.userWin.find(c => c.uid == this.uid);
        if (dataOfRobot) {
            this.playerGold = dataOfRobot.gold;
        }
    }
    async onSicboStart(onBetData) {
        const countdown = onBetData.countdown * 1000;
        const stopBetTimeOut = Date.now() + countdown - 1000;
        if (this.playRound > this.leaveRound || this.playerGold < this.lowBet) {
            return this.destroy();
        }
        const betType = benzConst.points[utils.random(0, benzConst.points.length - 1)];
        const { betArr } = robotBetUtil.getUp7BetTypeAndGold(this.playerGold, this.sceneId, this.ChipList);
        if (CommonUtil.isNullOrUndefined(betType) || !betArr.length) {
            return this.destroy();
        }
        let delayTime = CommonUtil.randomFromRange(2000, 3000);
        const delayArr = mathUtil.divideSumToNumArr(countdown - delayTime, betArr.length - 1);
        delayArr.unshift(delayTime);
        let tallBet = 0;
        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];
            if (!betArr[i] || (Date.now() + delayTime + 200) > stopBetTimeOut || this.playerGold < this.lowBet || this.playerGold < betArr[i]) {
                break;
            }
            tallBet += betArr[i];
            if (tallBet > gamesBetAstrict_1.BenzLimit_totalBet.find(c => c.area == betType.area).Limit[this.sceneId]) {
                break;
            }
            let bets = { area: betType.area, bet: betArr[i] };
            try {
                let res = await this.delayRequest("BenzBmw.mainHandler.userBet", bets, delayTime);
                this.playerGold = res.gold;
            }
            catch (error) {
                robotlogger.warn(`BenzBmw|下注出错|${this.uid}|${this.roomId}|${JSON.stringify(error)}`);
                robotlogger.warn(`BenzBmw|${this.roomId}`, utils.cDate(stopBetTimeOut), utils.cDate(Date.now()));
                break;
            }
        }
        this.playRound++;
    }
}
exports.default = up7Robot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVuelJvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQmVuekJtdy9saWIvcm9ib3QvYmVuelJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYiwyQ0FBNEM7QUFDNUMsMENBQTJDO0FBQzNDLDJFQUF3RTtBQUd4RSxtRUFBb0U7QUFDcEUsK0RBQWdFO0FBQ2hFLHFFQUFzRTtBQUN0RSxnRUFBNkU7QUFFN0UsZ0ZBQWdGO0FBQ2hGLCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBR3ZELE1BQXFCLFFBQVMsU0FBUSxxQkFBUztJQVEzQyxZQUFZLElBQUk7UUFDWixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRTFELENBQUM7SUFHRCxLQUFLLENBQUMsTUFBTTtRQUNSLElBQUk7WUFDQSxNQUFNLFNBQVMsR0FBYyxJQUFBLGFBQWdCLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0csSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ25DLElBQUksR0FBRyxHQUEwQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsNEJBQTRCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDN0csSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsRUFBRSxD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