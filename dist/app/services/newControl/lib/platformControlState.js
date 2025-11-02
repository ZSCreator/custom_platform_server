"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformControlState = void 0;
const constants_1 = require("../constants");
const PlatformControlState_manager_1 = require("../../../common/dao/daoManager/PlatformControlState.manager");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const PLATFORM_TRIGGER_GOLD = 10000000;
const PLATFORM_GAME_TRIGGER_GOLD = 1000000;
var StageProbability;
(function (StageProbability) {
    StageProbability[StageProbability["base"] = 0.25] = "base";
    StageProbability[StageProbability["second"] = 0.5] = "second";
    StageProbability[StageProbability["third"] = 0.7] = "third";
})(StageProbability || (StageProbability = {}));
var StageBurningTime;
(function (StageBurningTime) {
    StageBurningTime[StageBurningTime["base"] = 90000] = "base";
    StageBurningTime[StageBurningTime["second"] = 120000] = "second";
    StageBurningTime[StageBurningTime["third"] = 180000] = "third";
})(StageBurningTime || (StageBurningTime = {}));
const TIME_INTERVAL = 60 * 1000;
const SECTION_NUM = 0.015;
const BALANCE_VALUE = 0.01;
class PlatformControlState {
    constructor(platform) {
        this.currentKillRate = 0;
        this.stage = 0;
        this.probability = StageProbability.base;
        this.platformId = platform.platformId;
        this.nid = platform.nid;
        this.killRate = platform.killRate;
        this.isPlatform = !this.nid;
        this.triggerGold = this.isPlatform ? PLATFORM_TRIGGER_GOLD : PLATFORM_GAME_TRIGGER_GOLD;
        const now = Date.now();
        this.triggerTime = now;
        this.endTime = now;
    }
    init(betGoldAmount, profit) {
        this.betGoldAmount = betGoldAmount;
        this.profit = profit;
        if (betGoldAmount !== 0) {
            this.currentKillRate = this.profit / this.betGoldAmount;
        }
        const now = Date.now();
        this.triggerTime = now;
        this.endTime = now;
    }
    async createToDB() {
        await PlatformControlState_manager_1.default.createOne({
            platformId: this.platformId,
            killRate: this.killRate,
            nid: this.nid,
            type: this.isPlatform ? constants_1.PlatformControlType.PLATFORM : constants_1.PlatformControlType.GAME
        });
    }
    change(betGold, profit) {
        this.betGoldAmount += betGold;
        this.profit -= profit;
        if (this.betGoldAmount !== 0) {
            this.currentKillRate = this.profit / this.betGoldAmount;
            const now = Date.now();
            const intervalTime = now - this.endTime;
            if (now < this.endTime || (intervalTime < TIME_INTERVAL)) {
                return;
            }
            const diffValue = Math.abs(this.killRate - this.currentKillRate);
            if (diffValue < SECTION_NUM) {
                if (diffValue > BALANCE_VALUE) {
                    this.triggerTime = now;
                    this.probability = StageProbability.base;
                    this.endTime = this.triggerTime + StageBurningTime.base;
                }
                return;
            }
            this.triggerTime = now;
            if (this.killRate > this.currentKillRate) {
                this.probability = StageProbability.third;
                this.endTime = this.triggerTime + StageBurningTime.third;
            }
            else {
                this.probability = StageProbability.second;
                this.endTime = this.triggerTime + StageBurningTime.second;
            }
        }
    }
    getKillRate() {
        return this.killRate;
    }
    async changeKillRate(rate) {
        rate /= 100;
        if (this.isPlatform) {
            await PlatformControlState_manager_1.default.updateOne({ platformId: this.platformId, type: constants_1.PlatformControlType.PLATFORM }, { killRate: rate });
        }
        else {
            await PlatformControlState_manager_1.default.updateOne({ platformId: this.platformId, type: constants_1.PlatformControlType.PLATFORM, nid: this.nid }, { killRate: rate });
        }
        this.killRate = rate;
    }
    needKill(betGold) {
        const now = Date.now();
        const intervalTime = now - this.endTime;
        logger.warn('变化数据', this.killRate, this.currentKillRate, this.probability, this.profit, this.betGoldAmount, intervalTime);
        if (this.betGoldAmount < this.triggerGold ||
            this.killRate <= 0 ||
            (intervalTime > 0 && intervalTime < TIME_INTERVAL) ||
            (Math.abs(this.killRate - this.currentKillRate) < SECTION_NUM)) {
            return constants_1.ControlState.NONE;
        }
        if (this.killRate > this.currentKillRate && Math.random() < this.probability) {
            return constants_1.ControlState.SYSTEM_WIN;
        }
        if (this.killRate < this.currentKillRate && Math.random() > this.probability) {
            return constants_1.ControlState.PLAYER_WIN;
        }
        return constants_1.ControlState.NONE;
    }
}
exports.PlatformControlState = PlatformControlState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1Db250cm9sU3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvbmV3Q29udHJvbC9saWIvcGxhdGZvcm1Db250cm9sU3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNENBQStEO0FBQy9ELDhHQUFrRztBQUNsRywrQ0FBeUM7QUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQWNuRCxNQUFNLHFCQUFxQixHQUFHLFFBQVEsQ0FBQztBQUd2QyxNQUFNLDBCQUEwQixHQUFHLE9BQU8sQ0FBQztBQUszQyxJQUFLLGdCQUlKO0FBSkQsV0FBSyxnQkFBZ0I7SUFDakIsMERBQVcsQ0FBQTtJQUNYLDZEQUFhLENBQUE7SUFDYiwyREFBVyxDQUFBO0FBQ2YsQ0FBQyxFQUpJLGdCQUFnQixLQUFoQixnQkFBZ0IsUUFJcEI7QUFLRCxJQUFLLGdCQUlKO0FBSkQsV0FBSyxnQkFBZ0I7SUFDakIsMkRBQXNCLENBQUE7SUFDdEIsZ0VBQXVCLENBQUE7SUFDdkIsOERBQXFCLENBQUE7QUFDekIsQ0FBQyxFQUpJLGdCQUFnQixLQUFoQixnQkFBZ0IsUUFJcEI7QUFHRCxNQUFNLGFBQWEsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBR2hDLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQztBQUcxQixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFFM0IsTUFBYSxvQkFBb0I7SUFnQzdCLFlBQVksUUFBOEI7UUFqQmxDLG9CQUFlLEdBQVcsQ0FBQyxDQUFDO1FBWXBDLFVBQUssR0FBVyxDQUFDLENBQUM7UUFHbEIsZ0JBQVcsR0FBcUIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDO1FBR2xELElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztRQUN0QyxJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FB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