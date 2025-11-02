"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summaryList = exports.PlatformControlGame = void 0;
const platformControlScene_1 = require("./platformControlScene");
const Scene_manager_1 = require("../../../common/dao/daoManager/Scene.manager");
const PlatformControl_manager_1 = require("../../../common/dao/daoManager/PlatformControl.manager");
const PlatformControlState_manager_1 = require("../../../common/dao/daoManager/PlatformControlState.manager");
const constants_1 = require("../constants");
const pinus_logger_1 = require("pinus-logger");
const platformControlState_1 = require("./platformControlState");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
class PlatformControlGame {
    constructor(platformId, nid) {
        this.platformId = platformId;
        this.nid = nid;
        this.sceneList = [];
    }
    async init() {
        const scenes = await Scene_manager_1.default.findList({ nid: this.nid });
        scenes.forEach(scene => this.sceneList.push(new platformControlScene_1.PlatformControlScene(this.platformId, this.nid, scene.sceneId)));
        await Promise.all(this.sceneList.map(async (s) => {
            const platformScene = await PlatformControl_manager_1.default.findOneBySceneId(this.platformId, s.nid, s.sceneId);
            if (!!platformScene) {
                s.init(false, platformScene);
            }
            else {
                s.init(true);
                await s.crateToDB();
            }
        }));
        let result = await PlatformControlState_manager_1.default.findOne({ platformId: this.platformId, type: constants_1.PlatformControlType.GAME, nid: this.nid });
        if (result) {
            this.platformControlState = new platformControlState_1.PlatformControlState(result);
            const monthBill = await PlatformControl_manager_1.default.getMonthlyGameBill({ platformId: this.platformId, nid: this.nid });
            this.platformControlState.init(monthBill.betGoldAmount, monthBill.profit);
        }
    }
    async timingInitial() {
        return await Promise.all(this.sceneList.map(async (s) => {
            s.init(true);
            await s.crateToDB();
        }));
    }
    beginningMonthInit() {
        if (this.platformControlState) {
            this.platformControlState.init(0, 0);
        }
    }
    async updateToDB() {
        const sceneList = this.sceneList.filter(s => s.needToBeUpdate());
        if (sceneList.length > 0) {
            return Promise.all(sceneList.map(s => s.updateToDB()));
        }
    }
    getKillRateConfig() {
        return !!this.platformControlState ? this.platformControlState.getKillRate() : null;
    }
    async addPlatformControlGame(killRate) {
        if (this.platformControlState) {
            await this.platformControlState.changeKillRate(killRate);
            return { success: true, killRate };
        }
        this.platformControlState = new platformControlState_1.PlatformControlState({ platformId: this.platformId, nid: this.nid, killRate: killRate / 100 });
        const monthBill = await PlatformControl_manager_1.default.getMonthlyGameBill({ platformId: this.platformId, nid: this.nid });
        this.platformControlState.init(monthBill.betGoldAmount, monthBill.profit);
        await this.platformControlState.createToDB();
        return { success: true, killRate };
    }
    change(sheet) {
        const scene = this.sceneList.find(s => s.sceneId === sheet.sceneId);
        if (!scene) {
            logger.warn(`PlatformControlGame 未找到场, 数据 nid:${sheet.nid}, sceneId:${sheet.sceneId}`);
            return;
        }
        scene.dealWithSheet(sheet);
        if (this.platformControlState) {
            this.platformControlState.change(sheet.betGold, sheet.profit);
        }
    }
    summary(backend = false) {
        const data = this.sceneList.map(s => s.getBaseData());
        return {
            nid: this.nid,
            details: backend ? this.sceneList.map(s => s.getBaseData(true)) : data,
            comprehensive: summaryList(data),
            killRateConfig: this.getKillRateConfig(),
        };
    }
}
exports.PlatformControlGame = PlatformControlGame;
function summaryList(data) {
    const result = data.reduce((base, value) => {
        base.betGoldAmount += value.betGoldAmount;
        base.profit += value.profit;
        value.betPlayersSet.forEach(uid => base.betPlayersSet.add(uid));
        base.betRoundCount += value.betRoundCount;
        base.serviceCharge += value.serviceCharge;
        base.controlStateStatistical = {
            [constants_1.ControlTypes.platformControlWin]: base.controlStateStatistical[constants_1.ControlTypes.platformControlWin] + value.controlStateStatistical[constants_1.ControlTypes.platformControlWin],
            [constants_1.ControlTypes.platformControlLoss]: base.controlStateStatistical[constants_1.ControlTypes.platformControlLoss] + value.controlStateStatistical[constants_1.ControlTypes.platformControlLoss],
            [constants_1.ControlTypes.sceneControlWin]: base.controlStateStatistical[constants_1.ControlTypes.sceneControlWin] + value.controlStateStatistical[constants_1.ControlTypes.sceneControlWin],
            [constants_1.ControlTypes.sceneControlLoss]: base.controlStateStatistical[constants_1.ControlTypes.sceneControlLoss] + value.controlStateStatistical[constants_1.ControlTypes.sceneControlLoss],
            [constants_1.ControlTypes.personalControlWin]: base.controlStateStatistical[constants_1.ControlTypes.personalControlWin] + value.controlStateStatistical[constants_1.ControlTypes.personalControlWin],
            [constants_1.ControlTypes.personalControlLoss]: base.controlStateStatistical[constants_1.ControlTypes.personalControlLoss] + value.controlStateStatistical[constants_1.ControlTypes.personalControlLoss],
            [constants_1.ControlTypes.none]: base.controlStateStatistical[constants_1.ControlTypes.none] + value.controlStateStatistical[constants_1.ControlTypes.none],
        };
        base.controlLossCount += value.controlLossCount;
        base.controlWinCount += value.controlWinCount;
        base.controlEquality += value.controlEquality;
        base.systemWinCount += value.systemWinCount;
        base.playerWinCount += value.playerWinCount;
        base.equalityCount += value.equalityCount;
        if (base.betGoldAmount !== 0) {
            base.killRate = base.profit / base.betGoldAmount;
        }
        if (base.betRoundCount !== 0) {
            base.systemWinRate = base.systemWinCount / base.betRoundCount;
        }
        return base;
    }, {
        betGoldAmount: 0,
        profit: 0,
        betPlayersSet: new Set(),
        betRoundCount: 0,
        serviceCharge: 0,
        controlStateStatistical: {
            [constants_1.ControlTypes.platformControlWin]: 0,
            [constants_1.ControlTypes.platformControlLoss]: 0,
            [constants_1.ControlTypes.sceneControlWin]: 0,
            [constants_1.ControlTypes.sceneControlLoss]: 0,
            [constants_1.ControlTypes.personalControlWin]: 0,
            [constants_1.ControlTypes.personalControlLoss]: 0,
            [constants_1.ControlTypes.none]: 0
        },
        controlLossCount: 0,
        controlWinCount: 0,
        controlEquality: 0,
        killRate: 0,
        systemWinRate: 0,
        playerWinCount: 0,
        systemWinCount: 0,
        equalityCount: 0
    });
    result.betPlayersSet = [...result.betPlayersSet.values()];
    return result;
}
exports.summaryList = summaryList;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1Db250cm9sR2FtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9uZXdDb250cm9sL2xpYi9wbGF0Zm9ybUNvbnRyb2xHYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlFQUE2RjtBQUM3RixnRkFBd0U7QUFDeEUsb0dBQXdGO0FBQ3hGLDhHQUFrRztBQUNsRyw0Q0FBK0Q7QUFDL0QsK0NBQXVDO0FBQ3ZDLGlFQUE0RDtBQUU1RCxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRW5ELE1BQWEsbUJBQW1CO0lBTTVCLFlBQVksVUFBa0IsRUFBRSxHQUFXO1FBQ3ZDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJO1FBRU4sTUFBTSxNQUFNLEdBQUcsTUFBTyx1QkFBWSxDQUFDLFFBQVEsQ0FBQyxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFDLENBQUMsQ0FBQztRQUM3RCxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSwyQ0FBb0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVqSCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxFQUFFO1lBRTNDLE1BQU0sYUFBYSxHQUFHLE1BQU0saUNBQWtCLENBQUMsZ0JBQWdCLENBQUMsSUFB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