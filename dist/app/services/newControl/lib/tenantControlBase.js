"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantControlBase = exports.buildTenantControl = void 0;
const controlGame_1 = require("./controlGame");
const pinus_logger_1 = require("pinus-logger");
const controlState_1 = require("./controlState");
const PlatformControl_manager_1 = require("../../../common/dao/daoManager/PlatformControl.manager");
const PlatformControlState_manager_1 = require("../../../common/dao/daoManager/PlatformControlState.manager");
const constants_1 = require("../constants");
const PlatformControl_manager_2 = require("../../../common/dao/daoManager/PlatformControl.manager");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function buildTenantControl(platformId, tenantId) {
    return new TenantControlBase(platformId, tenantId);
}
exports.buildTenantControl = buildTenantControl;
class TenantControlBase {
    constructor(platformId, tenantId) {
        this.gameList = [];
        this.gameMap = new Map();
        this.platformId = platformId;
        this.tenantId = tenantId;
        this.dateChanged = Date.now();
    }
    async init() {
        const result = await PlatformControlState_manager_1.default.findOne({ platformId: this.platformId, type: constants_1.PlatformControlType.TENANT, tenantId: this.tenantId });
        if (result) {
            this.controlState = (0, controlState_1.buildControlState)(result, constants_1.PlatformControlType.TENANT);
            const monthBill = await PlatformControl_manager_1.default.getMonthlyGameBill({ platformId: this.platformId, tenantId: this.tenantId, type: constants_1.RecordTypes.TENANT_SCENE });
            this.controlState.init(monthBill.betGoldAmount, monthBill.profit);
        }
    }
    needRemove() {
        return Date.now() - this.dateChanged > 1000 * 60 * 60 * 2;
    }
    getControlState(nid) {
        const game = this.gameMap.get(nid);
        if (!game) {
            console.warn(`未初始化该游戏 nid: ${nid} ${typeof nid}`);
            return this.controlState;
        }
        if (game.controlState) {
            return game.controlState;
        }
        return this.controlState;
    }
    async timingInitial() {
        await Promise.all(this.gameList.map(g => g.timingInitial()));
    }
    beginningMonthInit() {
        if (this.controlState) {
            this.controlState.init(0, 0);
        }
        this.gameList.forEach(g => g.beginningMonthInit());
    }
    async updateToDB() {
        return Promise.all(this.gameList.map(g => g.updateToDB()));
    }
    async addGameScene(nid, sceneId) {
        let controlGame = this.gameMap.get(nid);
        if (!controlGame) {
            controlGame = (0, controlGame_1.buildControlGame)(this.platformId, this.tenantId, nid);
            this.gameList.push(controlGame);
            this.gameMap.set(nid, controlGame);
            this.gameList.sort((x, y) => parseInt(x.nid) - parseInt(y.nid));
        }
        await controlGame.initScene(sceneId);
    }
    change(sheet) {
        this.dateChanged = Date.now();
        const controlGame = this.gameMap.get(sheet.nid);
        if (!controlGame) {
            logger.warn(`tenantControlBase 未找到游戏 nid ${sheet.nid}`);
            return;
        }
        controlGame.change(sheet);
        if (this.controlState) {
            this.controlState.change(sheet.betGold, sheet.profit);
        }
    }
    async changeControlKillRate(killRate, nid) {
        if (nid) {
            let controlGame = this.gameMap.get(nid);
            if (!controlGame) {
                controlGame = (0, controlGame_1.buildControlGame)(this.platformId, this.tenantId, nid);
            }
            await controlGame.addControlGame(killRate);
            return { success: true, killRate };
        }
        if (this.controlState) {
            await this.controlState.changeKillRate(killRate);
            return { success: true, killRate };
        }
        this.controlState = (0, controlState_1.buildControlState)({ platformId: this.platformId, tenantId: this.tenantId, killRate: killRate / 100 }, constants_1.PlatformControlType.TENANT);
        const monthBill = await PlatformControl_manager_2.default.getMonthlyGameBill({ platformId: this.platformId, type: constants_1.RecordTypes.SCENE, tenantId: '' });
        this.controlState.init(monthBill.betGoldAmount, monthBill.profit);
        await this.controlState.createToDB();
        return { success: true, killRate };
    }
}
exports.TenantControlBase = TenantControlBase;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVuYW50Q29udHJvbEJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvbmV3Q29udHJvbC9saWIvdGVuYW50Q29udHJvbEJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0NBQTREO0FBQzVELCtDQUF1QztBQUV2QyxpREFBK0Q7QUFDL0Qsb0dBQXdGO0FBQ3hGLDhHQUEwRjtBQUMxRiw0Q0FBOEQ7QUFFOUQsb0dBQXdGO0FBRXhGLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFPbkQsU0FBZ0Isa0JBQWtCLENBQUMsVUFBa0IsRUFBRSxRQUFnQjtJQUNuRSxPQUFPLElBQUksaUJBQWlCLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZELENBQUM7QUFGRCxnREFFQztBQUtELE1BQWEsaUJBQWlCO0lBZTFCLFlBQVksVUFBa0IsRUFBRSxRQUFnQjtRQVZoRCxhQUFRLEdBQWtCLEVBQUUsQ0FBQztRQUM3QixZQUFPLEdBQTZCLElBQUksR0FBRyxFQUFFLENBQUM7UUFVMUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUtELEtBQUssQ0FBQyxJQUFJO1FBRU4sTUFBTSxNQUFNLEdBQUcsTUFBTSxzQ0FBZSxDQUFDLE9BQU8sQ0FDeEMsRUFBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsK0JBQW1CLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUU5RixJQUFJLE1BQU0sRUFBRTtZQUNSLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBQSxn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