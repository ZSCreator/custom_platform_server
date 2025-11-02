"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlState = exports.buildControlState = void 0;
const constants_1 = require("../constants");
const PlatformControlState_manager_1 = require("../../../common/dao/daoManager/PlatformControlState.manager");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const PLATFORM_TRIGGER_GOLD = 10000000;
const PLATFORM_GAME_TRIGGER_GOLD = 1000000;
const TENANT_TRIGGER_GOLD = 5000000;
const TENANT_GAME_TRIGGER_GOLD = 2000000;
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
function buildControlState(platform, type) {
    return new ControlState(platform, type);
}
exports.buildControlState = buildControlState;
class ControlState {
    constructor(platform, type) {
        this.currentKillRate = 0;
        this.stage = 0;
        this.probability = StageProbability.base;
        this.platformId = platform.platformId;
        this.nid = platform.nid;
        this.killRate = platform.killRate;
        this.type = type;
        this.tenantId = platform.tenantId || '';
        this.triggerGold = trigger(type);
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
            type: this.type,
            tenantId: this.tenantId,
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
        const where = { platformId: this.platformId, tenantId: this.tenantId, type: this.type };
        switch (this.type) {
            case constants_1.PlatformControlType.GAME:
            case constants_1.PlatformControlType.TENANT_GAME: {
                where.nid = this.nid;
                break;
            }
            default: break;
        }
        await PlatformControlState_manager_1.default.updateOne(where, { killRate: rate });
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
exports.ControlState = ControlState;
function trigger(type) {
    switch (type) {
        case constants_1.PlatformControlType.GAME: return PLATFORM_GAME_TRIGGER_GOLD;
        case constants_1.PlatformControlType.PLATFORM: return PLATFORM_TRIGGER_GOLD;
        case constants_1.PlatformControlType.TENANT: return TENANT_TRIGGER_GOLD;
        case constants_1.PlatformControlType.TENANT_GAME: return TENANT_GAME_TRIGGER_GOLD;
        default: return 0;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbFN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL25ld0NvbnRyb2wvbGliL2NvbnRyb2xTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw0Q0FBbUY7QUFDbkYsOEdBQWtHO0FBQ2xHLCtDQUF5QztBQUN6QyxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBaUJuRCxNQUFNLHFCQUFxQixHQUFHLFFBQVEsQ0FBQztBQUd2QyxNQUFNLDBCQUEwQixHQUFHLE9BQU8sQ0FBQztBQUczQyxNQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQztBQUdwQyxNQUFNLHdCQUF3QixHQUFHLE9BQU8sQ0FBQztBQUt6QyxJQUFLLGdCQUlKO0FBSkQsV0FBSyxnQkFBZ0I7SUFDakIsMERBQVcsQ0FBQTtJQUNYLDZEQUFhLENBQUE7SUFDYiwyREFBVyxDQUFBO0FBQ2YsQ0FBQyxFQUpJLGdCQUFnQixLQUFoQixnQkFBZ0IsUUFJcEI7QUFLRCxJQUFLLGdCQUlKO0FBSkQsV0FBSyxnQkFBZ0I7SUFDakIsMkRBQXNCLENBQUE7SUFDdEIsZ0VBQXVCLENBQUE7SUFDdkIsOERBQXFCLENBQUE7QUFDekIsQ0FBQyxFQUpJLGdCQUFnQixLQUFoQixnQkFBZ0IsUUFJcEI7QUFHRCxNQUFNLGFBQWEsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBR2hDLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQztBQUcxQixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFPM0IsU0FBZ0IsaUJBQWlCLENBQUMsUUFBdUIsRUFBRSxJQUF5QjtJQUNoRixPQUFPLElBQUksWUFBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1QyxDQUFDO0FBRkQsOENBRUM7QUFFRCxNQUFhLFlBQVk7SUFtQ3JCLFlBQVksUUFBdUIsRUFBRSxJQUF5QjtR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