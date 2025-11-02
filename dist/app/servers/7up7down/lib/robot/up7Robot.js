'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../../../../utils");
const up7Const = require("../up7Const");
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const CommonUtil = require("../../../../utils/lottery/commonUtil");
const mathUtil = require("../../../../utils/lottery/mathUtil");
const robotBetUtil = require("../../../../utils/robot/robotBetUtil");
const JsonMgr_1 = require("../../../../../config/data/JsonMgr");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
class up7Robot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.playRound = 0;
        this.leaveRound = CommonUtil.randomFromRange(10, 100);
    }
    async Loaded() {
        try {
            const sceneInfo = (0, JsonMgr_1.get)('scenes/7up7down').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            let res = await this.requestByRoute("7up7down.mainHandler.loaded", {});
            this.playerGold = res.pl.gold;
            this.lowBet = res.room.lowBet;
            this.tallBet = res.room.tallBet;
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
        this.Emitter.on("7up7down.result", (resultData) => this.onSicboResult(resultData));
        this.Emitter.on("7up7down.userChange", async (changeData) => await this.onSicboUserChange(changeData));
        this.Emitter.on("7up7down.start", (onBetData) => this.onSicboStart(onBetData));
    }
    onSicboResult(resultData) {
        const dataOfRobot = resultData.userWin.find(c => c.uid == this.uid);
        if (dataOfRobot) {
            this.playerGold = dataOfRobot.gold;
        }
    }
    async onSicboUserChange(changeData) {
    }
    async onSicboStart(onBetData) {
        const countdown = onBetData.countDown * 1000;
        const stopBetTimeOut = Date.now() + countdown - 1000;
        if (this.playRound > this.leaveRound || this.playerGold < this.lowBet) {
            return this.destroy();
        }
        const betType = up7Const.points[utils.random(0, 2)];
        const { betArr } = robotBetUtil.getUp7BetTypeAndGold(this.playerGold, this.sceneId, this.ChipList);
        if (CommonUtil.isNullOrUndefined(betType) || !betArr.length) {
            return this.destroy();
        }
        let tallBet = this.tallBet;
        if (betType == up7Const.BetAreas.BB) {
            tallBet = this.tallBet / 2;
        }
        do {
            if (tallBet < utils.sum(betArr)) {
                betArr.shift();
            }
            else {
                break;
            }
        } while (true);
        let delayTime = CommonUtil.randomFromRange(2000, 3000);
        const delayArr = mathUtil.divideSumToNumArr(countdown - delayTime, betArr.length - 1);
        delayArr.unshift(delayTime);
        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];
            if (!betArr[i] || Date.now() + delayTime > stopBetTimeOut || this.playerGold < this.lowBet || this.playerGold < betArr[i]) {
                break;
            }
            let bets = { area: betType, bet: betArr[i] };
            try {
                let res = await this.delayRequest("7up7down.mainHandler.userBet", bets, delayTime);
                this.playerGold = res.gold;
            }
            catch (error) {
                logger.warn(`7up下注出错|${this.uid}|${this.roomId}|${JSON.stringify(error)}`);
                logger.warn(`${this.roomId}`, utils.cDate(stopBetTimeOut), utils.cDate(Date.now() + delayTime));
                break;
            }
        }
        this.playRound++;
    }
}
exports.default = up7Robot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXA3Um9ib3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy83dXA3ZG93bi9saWIvcm9ib3QvdXA3Um9ib3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUdiLDJDQUE0QztBQUM1Qyx3Q0FBeUM7QUFDekMsMkVBQXdFO0FBR3hFLG1FQUFvRTtBQUNwRSwrREFBZ0U7QUFDaEUscUVBQXNFO0FBQ3RFLGdFQUE2RTtBQUU3RSwrQ0FBeUM7QUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUdsRCxNQUFxQixRQUFTLFNBQVEscUJBQVM7SUFPM0MsWUFBWSxJQUFJO1FBQ1osS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUUxRCxDQUFDO0lBR0QsS0FBSyxDQUFDLE1BQU07UUFDUixJQUFJO1lBQ0EsTUFBTSxTQUFTLEdBQWMsSUFBQSxhQUFnQixFQUFDLGlCQUFpQixDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hILElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUNuQyxJQUFJLEdBQUcsR0FBd0MsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLDZCQUE2QixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzVHLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7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