"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformControlScene = void 0;
const constants_1 = require("../constants");
const PlatformControl_manager_1 = require("../../../common/dao/daoManager/PlatformControl.manager");
const utils_1 = require("../../../utils/utils");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
class PlatformControlScene {
    constructor(platform, nid, sceneId) {
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
            type: constants_1.RecordTypes.SCENE,
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
exports.PlatformControlScene = PlatformControlScene;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1Db250cm9sU2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvbmV3Q29udHJvbC9saWIvcGxhdGZvcm1Db250cm9sU2NlbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNENBQXVEO0FBQ3ZELG9HQUF3RjtBQUN4RixnREFBb0Q7QUFDcEQsK0NBQWlEO0FBR2pELE1BQU0sTUFBTSxHQUFXLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUE2RTNELE1BQWEsb0JBQW9CO0lBK0I3QixZQUFZLFFBQVEsRUFBRSxHQUFHLEVBQUUsT0FBZTtRQXhCMUMsa0JBQWEsR0FBZ0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQWF2Qyw0QkFBdUIsR0FBRztZQUN0QixDQUFDLHdCQUFZLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDO1lBQ3BDLENBQUMsd0JBQVksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7WUFDckMsQ0FBQyx3QkFBWSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7WUFDakMsQ0FBQyx3QkFBWSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQztZQUNsQyxDQUFDLHdCQUFZLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDO1lBQ3BDLENBQUMsd0JBQVksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7WUFDckMsQ0FBQyx3QkFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7U0FDekIsQ0FBQztRQUlFLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7UUFDM0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDO1FB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