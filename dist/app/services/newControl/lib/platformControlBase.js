"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformControlBase = void 0;
const controlGame_1 = require("./controlGame");
const utils_1 = require("./utils");
const Game_manager_1 = require("../../../common/dao/daoManager/Game.manager");
const pinus_logger_1 = require("pinus-logger");
const controlState_1 = require("./controlState");
const PlatformControl_manager_1 = require("../../../common/dao/daoManager/PlatformControl.manager");
const PlatformControlState_manager_1 = require("../../../common/dao/daoManager/PlatformControlState.manager");
const constants_1 = require("../constants");
const tenantControlBase_1 = require("./tenantControlBase");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
class PlatformControlBase {
    constructor(platformId) {
        this.gameList = [];
        this.gameMap = new Map();
        this.tenantMap = new Map();
        this.platformId = platformId;
    }
    async initPlatform() {
        const games = await Game_manager_1.default.findList({}, true);
        await Promise.all(games.map(g => this.addGame(g.nid)));
        const result = await PlatformControlState_manager_1.default.findOne({ platformId: this.platformId, type: constants_1.PlatformControlType.PLATFORM });
        if (result) {
            this.platformControlState = (0, controlState_1.buildControlState)(result, constants_1.PlatformControlType.PLATFORM);
            const monthBill = await PlatformControl_manager_1.default.getMonthlyGameBill({ platformId: this.platformId, type: constants_1.RecordTypes.SCENE, tenantId: '' });
            this.platformControlState.init(monthBill.betGoldAmount, monthBill.profit);
        }
    }
    async addTenantControl(tenantId, nid, sceneId) {
        let tenantControl = this.tenantMap.get(tenantId);
        if (!tenantControl) {
            tenantControl = (0, tenantControlBase_1.buildTenantControl)(this.platformId, tenantId);
            await tenantControl.init();
            this.tenantMap.set(tenantId, tenantControl);
        }
        await tenantControl.addGameScene(nid, sceneId);
    }
    async changeTenantControlKillRate(tenantId, killRate, nid) {
        let tenantControl = this.tenantMap.get(tenantId);
        if (!tenantControl) {
            tenantControl = (0, tenantControlBase_1.buildTenantControl)(this.platformId, tenantId);
            await tenantControl.init();
            this.tenantMap.set(tenantId, tenantControl);
        }
        return await tenantControl.changeControlKillRate(killRate, nid);
    }
    async removeTenantControl() {
        const values = this.tenantMap.values();
        for (let tenantControl of values) {
            if (tenantControl.needRemove()) {
                this.tenantMap.delete(tenantControl.tenantId);
                await tenantControl.updateToDB();
            }
        }
    }
    getControlState(tenantId, nid) {
        const tenant = this.tenantMap.get(tenantId);
        if (tenant) {
            const controlState = tenant.getControlState(nid);
            if (controlState) {
                return controlState;
            }
        }
        const game = this.gameMap.get(nid);
        if (!game) {
            console.warn(`未初始化该游戏 nid: ${nid} ${typeof nid}`);
            return this.platformControlState;
        }
        if (game.controlState) {
            return game.controlState;
        }
        return this.platformControlState;
    }
    getKillRateConfig(nid) {
        if (!!nid) {
            const game = this.gameMap.get(nid);
            if (!game) {
                return null;
            }
            return game.getKillRateConfig();
        }
        return !!this.platformControlState ? this.platformControlState.getKillRate() : null;
    }
    async addPlatformControl(killRate, nid) {
        if (nid) {
            const platformControlGame = this.gameMap.get(nid);
            if (!platformControlGame) {
                console.warn('没有游戏平台');
                return { success: false };
            }
            await platformControlGame.addControlGame(killRate);
            return { success: true, killRate };
        }
        if (this.platformControlState) {
            await this.platformControlState.changeKillRate(killRate);
            return { success: true, killRate };
        }
        this.platformControlState = new controlState_1.ControlState({ platformId: this.platformId, killRate: killRate / 100 }, constants_1.PlatformControlType.PLATFORM);
        const monthBill = await PlatformControl_manager_1.default.getMonthlyGameBill({ platformId: this.platformId, type: constants_1.RecordTypes.SCENE, tenantId: '' });
        this.platformControlState.init(monthBill.betGoldAmount, monthBill.profit);
        await this.platformControlState.createToDB();
        return { success: true, killRate };
    }
    async timingInitial() {
        await Promise.all(this.gameList.map(g => g.timingInitial()));
        await Promise.all([...this.tenantMap.values()].map(g => g.timingInitial()));
    }
    beginningMonthInit() {
        if (this.platformControlState) {
            this.platformControlState.init(0, 0);
        }
        this.gameList.forEach(g => g.beginningMonthInit());
        [...this.tenantMap.values()].forEach(tenant => tenant.beginningMonthInit());
    }
    async updateToDB() {
        await Promise.all(this.gameList.map(g => g.updateToDB()));
        await Promise.all([...this.tenantMap.values()].map(tenant => tenant.updateToDB()));
    }
    async addGame(nid) {
        const platformControlGame = (0, controlGame_1.buildControlGame)(this.platformId, '', nid);
        await platformControlGame.init();
        this.gameList.push(platformControlGame);
        this.gameMap.set(nid, platformControlGame);
        this.gameList.sort((x, y) => parseInt(x.nid) - parseInt(y.nid));
    }
    change(sheet) {
        const platformControlGame = this.gameMap.get(sheet.nid);
        if (!platformControlGame) {
            logger.warn(`PlatformControlBase 未找到游戏 nid ${sheet.nid}`);
            return;
        }
        platformControlGame.change(sheet);
        if (this.platformControlState) {
            this.platformControlState.change(sheet.betGold, sheet.profit);
        }
        const tenant = this.tenantMap.get(sheet.groupRemark);
        if (tenant) {
            tenant.change(sheet);
        }
    }
    getData(backend = false) {
        const data = this.gameList.map(g => g.summary(backend));
        return {
            platform: this.platformId,
            games: data,
            comprehensive: (0, utils_1.summaryList)([...(data.map(c => c.comprehensive))]),
            killRateConfig: this.getKillRateConfig(),
        };
    }
}
exports.PlatformControlBase = PlatformControlBase;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1Db250cm9sQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9uZXdDb250cm9sL2xpYi9wbGF0Zm9ybUNvbnRyb2xCYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtDQUE2RDtBQUM3RCxtQ0FBb0M7QUFDcEMsOEVBQXNFO0FBQ3RFLCtDQUF1QztBQUV2QyxpREFBK0Q7QUFDL0Qsb0dBQXdGO0FBQ3hGLDhHQUFrRztBQUNsRyw0Q0FBOEQ7QUFFOUQsMkRBQTBFO0FBRzFFLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFLbkQsTUFBYSxtQkFBbUI7SUFlNUIsWUFBWSxVQUFrQjtRQVg5QixhQUFRLEdBQWtCLEVBQUUsQ0FBQztRQUU3QixZQUFPLEdBQTZCLElBQUksR0FBRyxFQUFFLENBQUM7UUFJOUMsY0FBUyxHQUFrQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBTWpELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLENBQUM7SUFLRCxLQUFLLENBQUMsWUFBWTtRQUVkLE1BQU0sS0FBSyxHQUFHLE1BQU0sc0JBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25ELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBR3ZELE1BQU0sTUFBTSxHQUFHLE1BQU0sc0NBQXVCLENBQUMsT0FBTyxDQUFDLEVBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLCtCQUFtQixDQUFDLFFBQVEsRUFBQyxDQUFDLENBQUM7UUFFeEgsSUFBSSxNQUFNLEVBQUU7WUFDUixJQUFJ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