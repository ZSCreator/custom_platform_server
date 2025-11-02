"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlGame = exports.buildControlGame = void 0;
const controlScene_1 = require("./controlScene");
const Scene_manager_1 = require("../../../common/dao/daoManager/Scene.manager");
const PlatformControl_manager_1 = require("../../../common/dao/daoManager/PlatformControl.manager");
const PlatformControlState_manager_1 = require("../../../common/dao/daoManager/PlatformControlState.manager");
const constants_1 = require("../constants");
const pinus_logger_1 = require("pinus-logger");
const controlState_1 = require("./controlState");
const utils_1 = require("./utils");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function buildControlGame(platformId, tenantId, nid) {
    return new ControlGame(platformId, tenantId, nid);
}
exports.buildControlGame = buildControlGame;
class ControlGame {
    constructor(platformId, tenantId, nid) {
        this.platformId = platformId;
        this.tenantId = tenantId || '';
        this.nid = nid;
        this.sceneList = [];
        this.type = this.tenantId ? constants_1.RecordTypes.TENANT_SCENE : constants_1.RecordTypes.SCENE;
    }
    async initScene(sceneId) {
        if (this.sceneList.find(s => s.sceneId === sceneId)) {
            return;
        }
        const scene = (0, controlScene_1.buildControlScene)(this.platformId, this.tenantId, this.nid, sceneId);
        const sceneData = this.type === constants_1.RecordTypes.TENANT_SCENE ?
            await PlatformControl_manager_1.default.findOneByTenantIdAndSceneId(this.platformId, this.tenantId, scene.nid, scene.sceneId) :
            await PlatformControl_manager_1.default.findOneBySceneId(constants_1.RecordTypes.SCENE, this.platformId, scene.nid, scene.sceneId);
        if (!!sceneData) {
            scene.init(false, sceneData);
        }
        else {
            scene.init(true);
            await scene.crateToDB();
        }
        this.sceneList.push(scene);
    }
    async init() {
        const scenes = await Scene_manager_1.default.findList({ nid: this.nid });
        for (let scene of scenes) {
            await this.initScene(scene.sceneId);
        }
        await this.initControlState();
    }
    async initControlState() {
        if (this.controlState) {
            return;
        }
        const type = this.type === constants_1.RecordTypes.TENANT_SCENE ? constants_1.PlatformControlType.TENANT_GAME : constants_1.PlatformControlType.GAME;
        let result = await PlatformControlState_manager_1.default.findOne({ platformId: this.platformId, tenantId: this.tenantId, type, nid: this.nid });
        if (result) {
            this.controlState = (0, controlState_1.buildControlState)(result, type);
            const monthBill = await PlatformControl_manager_1.default.getMonthlyGameBill({ type: this.type, platformId: this.platformId, nid: this.nid, tenantId: this.tenantId });
            this.controlState.init(monthBill.betGoldAmount, monthBill.profit);
        }
    }
    async timingInitial() {
        return await Promise.all(this.sceneList.map(async (s) => {
            s.init(true);
            await s.crateToDB();
        }));
    }
    beginningMonthInit() {
        if (this.controlState) {
            this.controlState.init(0, 0);
        }
    }
    async updateToDB() {
        const sceneList = this.sceneList.filter(s => s.needToBeUpdate());
        if (sceneList.length > 0) {
            return Promise.all(sceneList.map(s => s.updateToDB()));
        }
    }
    getKillRateConfig() {
        return !!this.controlState ? this.controlState.getKillRate() : null;
    }
    async addControlGame(killRate) {
        if (this.controlState) {
            await this.controlState.changeKillRate(killRate);
            return { success: true, killRate };
        }
        const type = this.type === constants_1.RecordTypes.SCENE ? constants_1.PlatformControlType.GAME : constants_1.PlatformControlType.TENANT_GAME;
        const result = await PlatformControlState_manager_1.default.findOne({ platformId: this.platformId, nid: this.nid,
            tenantId: this.tenantId, type });
        if (!result) {
            this.controlState = (0, controlState_1.buildControlState)({
                platformId: this.platformId, nid: this.nid, killRate: killRate / 100, tenantId: this.tenantId
            }, type);
            const monthBill = await PlatformControl_manager_1.default.getMonthlyGameBill({ platformId: this.platformId, nid: this.nid, tenantId: this.tenantId, type: this.type });
            this.controlState.init(monthBill.betGoldAmount, monthBill.profit);
            await this.controlState.createToDB();
            return { success: true, killRate };
        }
        else {
            this.controlState = (0, controlState_1.buildControlState)({
                platformId: this.platformId, nid: this.nid, killRate: result.killRate, tenantId: this.tenantId
            }, type);
            await this.controlState.changeKillRate(killRate);
        }
        return { success: true, killRate };
    }
    change(sheet) {
        const scene = this.sceneList.find(s => s.sceneId === sheet.sceneId);
        if (!scene) {
            logger.warn(`PlatformControlGame 未找到场, 数据 nid:${sheet.nid}, sceneId:${sheet.sceneId}`);
            return;
        }
        scene.dealWithSheet(sheet);
        if (this.controlState) {
            this.controlState.change(sheet.betGold, sheet.profit);
        }
    }
    summary(backend = false) {
        const data = this.sceneList.map(s => s.getBaseData());
        return {
            nid: this.nid,
            details: backend ? this.sceneList.map(s => s.getBaseData(true)) : data,
            comprehensive: (0, utils_1.summaryList)(data),
            killRateConfig: this.getKillRateConfig(),
        };
    }
}
exports.ControlGame = ControlGame;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbEdhbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvbmV3Q29udHJvbC9saWIvY29udHJvbEdhbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaURBQXlFO0FBQ3pFLGdGQUF3RTtBQUN4RSxvR0FBd0Y7QUFDeEYsOEdBQWtHO0FBQ2xHLDRDQUE4RDtBQUM5RCwrQ0FBdUM7QUFDdkMsaURBQStEO0FBQy9ELG1DQUFvQztBQUdwQyxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBUW5ELFNBQWdCLGdCQUFnQixDQUFDLFVBQWtCLEVBQUUsUUFBZ0IsRUFBRSxHQUFnQjtJQUNuRixPQUFPLElBQUksV0FBVyxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUcsR0FBRyxDQUFDLENBQUM7QUFDdkQsQ0FBQztBQUZELDRDQUVDO0FBRUQsTUFBYSxXQUFXO0lBYXBCLFlBQVksVUFBa0IsRUFBRSxRQUFnQixFQUFFLEdBQWdCO1FBQzlELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxJQUFJLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsdUJBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLHVCQUFXLENBQUMsS0FBSyxDQUFDO0lBQzdFLENBQUM7SUFNRCxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQWU7UUFFM0IsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDLEVB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