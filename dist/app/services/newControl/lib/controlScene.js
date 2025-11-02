"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlScene = exports.buildControlScene = void 0;
const constants_1 = require("../constants");
const PlatformControl_manager_1 = require("../../../common/dao/daoManager/PlatformControl.manager");
const utils_1 = require("../../../utils/utils");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function buildControlScene(platformId, tenantId, nid, sceneId) {
    return new ControlScene(platformId, tenantId, nid, sceneId);
}
exports.buildControlScene = buildControlScene;
class ControlScene {
    constructor(platform, tenantId, nid, sceneId) {
        this.betPlayersSet = new Set();
        this.controlStateStatistical = {
            [constants_1.ControlTypes.platformControlWin]: 0,
            [constants_1.ControlTypes.platformControlLoss]: 0,
            [constants_1.ControlTypes.sceneControlWin]: 0,
            [constants_1.ControlTypes.sceneControlLoss]: 0,
            [constants_1.ControlTypes.personalControlWin]: 0,
            [constants_1.ControlTypes.personalControlLoss]: 0,
            [constants_1.ControlTypes.none]: 0
        };
        this.nid = nid;
        this.sceneId = sceneId;
        this.platformId = platform;
        this.tenantId = tenantId;
        const now = Date.now();
        this.dateLastUpdated = now;
        this.dateChanged = now;
    }
    init(first, history) {
        if (first) {
            this.betGoldAmount = 0;
            this.profit = 0;
            this.betPlayersSet.clear();
            this.playerWinCount = 0;
            this.systemWinRate = 0;
            this.systemWinCount = 0;
            this.killRate = 0;
            this.controlWinCount = 0;
            this.controlLossCount = 0;
            this.controlEquality = 0;
            this.betRoundCount = 0;
            this.serviceCharge = 0;
            this.equalityCount = 0;
            this.controlStateStatistical = {
                [constants_1.ControlTypes.platformControlWin]: 0,
                [constants_1.ControlTypes.platformControlLoss]: 0,
                [constants_1.ControlTypes.sceneControlWin]: 0,
                [constants_1.ControlTypes.sceneControlLoss]: 0,
                [constants_1.ControlTypes.personalControlWin]: 0,
                [constants_1.ControlTypes.personalControlLoss]: 0,
                [constants_1.ControlTypes.none]: 0
            };
        }
        else {
            this.betGoldAmount = history.betGoldAmount;
            this.profit = history.profit;
            history.betPlayersSet.forEach(uid => this.betPlayersSet.add(uid));
            this.playerWinCount = history.playerWinCount;
            this.systemWinRate = history.systemWinRate;
            this.killRate = history.killRate;
            this.controlWinCount = history.controlWinCount;
            this.controlLossCount = history.controlLossCount;
            this.controlEquality = history.controlEquality;
            this.betRoundCount = history.betRoundCount;
            this.serviceCharge = history.serviceCharge;
            this.controlStateStatistical = history.controlStateStatistical;
            this.systemWinCount = history.systemWinCount;
            this.equalityCount = history.equalityCount;
            this._id = history.id;
        }
    }
    async updateToDB() {
        this.dateLastUpdated = Date.now();
        await PlatformControl_manager_1.default.updateSummaryData(this._id, this.getBaseData());
    }
    async crateToDB() {
        const now = Date.now();
        this.dateLastUpdated = now;
        this.dateChanged = now;
        const result = await PlatformControl_manager_1.default.createOne(this.getBaseData());
        this._id = result.id;
    }
    needToBeUpdate() {
        return this.dateChanged > this.dateLastUpdated;
    }
    getBaseData(backend = false) {
        return {
            platformId: this.platformId,
            tenantId: this.tenantId,
            nid: this.nid,
            sceneId: this.sceneId,
            betGoldAmount: this.betGoldAmount,
            profit: this.profit,
            betPlayersSet: backend ? this.betPlayersSet.size : [...this.betPlayersSet.values()],
            playerWinCount: this.playerWinCount,
            systemWinCount: this.systemWinCount,
            equalityCount: this.equalityCount,
            systemWinRate: this.systemWinRate,
            killRate: this.killRate,
            controlWinCount: this.controlWinCount,
            controlLossCount: this.controlLossCount,
            controlEquality: this.controlEquality,
            betRoundCount: this.betRoundCount,
            serviceCharge: this.serviceCharge,
            controlStateStatistical: this.controlStateStatistical,
            type: this.tenantId ? constants_1.RecordTypes.TENANT_SCENE : constants_1.RecordTypes.SCENE,
        };
    }
    dealWithSheet(sheet) {
        if (!(0, utils_1.isNumberObject)(sheet.profit) || !(0, utils_1.isNumberObject)(sheet.betGold) || !(0, utils_1.isNumberObject)(sheet.serviceCharge)) {
            logger.warn(`平台调控处理数据出错 ${JSON.stringify(sheet)}`);
            return;
        }
        const profit = Math.floor(sheet.profit);
        const betGold = Math.floor(sheet.betGold);
        const serviceCharge = Math.floor(sheet.serviceCharge);
        this.betRoundCount++;
        this.betPlayersSet.add(sheet.uid);
        this.profit -= profit;
        this.betGoldAmount += betGold;
        this.serviceCharge += serviceCharge;
        if (profit > 0) {
            this.playerWinCount++;
        }
        else if (profit < 0) {
            this.systemWinCount++;
        }
        else {
            this.equalityCount++;
        }
        if (sheet.controlType !== constants_1.ControlTypes.none) {
            if (profit > 0) {
                this.controlWinCount++;
            }
            else if (profit < 0) {
                this.controlLossCount++;
            }
            else {
                this.controlEquality++;
            }
            this.controlStateStatistical[sheet.controlType]++;
        }
        else {
            this.controlStateStatistical[sheet.controlType]++;
        }
        this.killRate = this.profit / this.betGoldAmount;
        this.systemWinRate = this.systemWinCount / this.betRoundCount;
        this.killRate = Math.floor(this.killRate * 100) / 100;
        this.systemWinRate = Math.floor(this.systemWinRate * 100) / 100;
        this.dateChanged = Date.now();
    }
}
exports.ControlScene = ControlScene;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbFNjZW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL25ld0NvbnRyb2wvbGliL2NvbnRyb2xTY2VuZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw0Q0FBdUQ7QUFDdkQsb0dBQXdGO0FBQ3hGLGdEQUFvRDtBQUNwRCwrQ0FBK0M7QUFHL0MsTUFBTSxNQUFNLEdBQVcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQXVGM0QsU0FBZ0IsaUJBQWlCLENBQUMsVUFBa0IsRUFBRSxRQUFnQixFQUFFLEdBQWdCLEVBQUUsT0FBZTtJQUNyRyxPQUFPLElBQUksWUFBWSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2hFLENBQUM7QUFGRCw4Q0FFQztBQUdELE1BQWEsWUFBWTtJQWdDckIsWUFBWSxRQUFnQixFQUFFLFFBQWdCLEVBQUUsR0FBZ0IsRUFBRSxPQUFlO1FBeEJqRixrQkFBYSxHQUFnQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBYXZDLDRCQUF1QixHQUFHO1lBQ3RCLENBQUMsd0JBQVksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7WUFDcEMsQ0FBQyx3QkFBWSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQztZQUNyQyxDQUFDLHdCQUFZLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQztZQUNqQyxDQUFDLHdCQUFZLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO1lBQ2xDLENBQUMsd0JBQVksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7WUFDcEMsQ0FBQyx3QkFBWSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQztZQUNyQyxDQUFDLHdCQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztTQUN6QixDQUFDO1FBSUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJ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