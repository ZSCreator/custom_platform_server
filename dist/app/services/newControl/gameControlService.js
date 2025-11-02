"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePlayerKillControl = exports.changePoolConfig = exports.changeControlData = exports.changeBonusPoolAmount = exports.addProfitPoolAmount = exports.getPool = exports.GameControlService = void 0;
const personalControl_1 = require("./impl/personalControl");
const sceneControl_1 = require("./impl/sceneControl");
const JsonMgr_1 = require("../../../config/data/JsonMgr");
const pinus_1 = require("pinus");
const commonUtil_1 = require("../../utils/lottery/commonUtil");
const pinus_logger_1 = require("pinus-logger");
const Game_manager_1 = require("../../common/dao/daoManager/Game.manager");
const TenantControl_manager_1 = require("../../common/dao/daoManager/TenantControl.manager");
const totalPersonalControl_1 = require("./impl/totalPersonalControl");
const constants_1 = require("./constants");
function randomServerRpcId() {
    const serverList = pinus_1.pinus.app.getServersByType('control');
    return serverList[(0, commonUtil_1.randomFromRange)(0, serverList.length - 1)].id;
}
class GameControlService {
    constructor() {
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
        this.sceneControlMap = new Map();
        this.personalControlMap = new Map();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new GameControlService();
        }
        return this.instance;
    }
    async init({ nid, bankerGame }) {
        this.nid = nid;
        const { name, zname } = await Game_manager_1.default.findOne({ nid: this.nid });
        this.name = name;
        this.bankerGame = bankerGame || false;
        this.gameName = zname;
        await this.initSceneControl();
        await this.initPersonalControl();
    }
    async getControlInfo({ sceneId, players }) {
        let result = { personalControlPlayers: [], sceneWeights: 0 };
        const personalControl = this.personalControlMap.get(sceneId);
        if (!personalControl) {
            this.logger.error(`未找到个控实例 游戏id ${this.nid} 场id: ${sceneId} 场id类型${typeof sceneId} 个控实例字典${this.personalControlMap}`);
            throw new Error('获取调控结果失败');
        }
        result.personalControlPlayers = await personalControl.findPersonalControlPlayers(players, { sceneId, nid: this.nid });
        const sceneControl = this.sceneControlMap.get(sceneId);
        const sceneControlInfo = await sceneControl.getSceneControl();
        const pool = await this.getCorrectedValue(sceneControl.sceneId);
        result.sceneWeights = sceneControlInfo.lockPool ? sceneControlInfo.weights : conversionSceneWeight(pool.correctedValue);
        result.sceneControlState = await sceneControl.getSlotAndBRGameControlState({
            sceneControl: sceneControlInfo,
            players,
            pool
        });
        if (result.sceneControlState === constants_1.ControlState.NONE) {
            result.sceneControlState = constants_1.ControlState.NONE;
            const { platformId, tenantId } = getPlatformInfoWithLargest(players);
            result.sceneControlState = await this.getPlatformControl(platformId, tenantId, this.nid, 0);
            result.isPlatformControl = true;
        }
        else {
            result.isPlatformControl = false;
        }
        if (this.bankerGame) {
            result.bankerKill = sceneControl.bankerKill(sceneControlInfo);
        }
        return result;
    }
    async addProfitPoolAmount(sceneId, amount) {
        await pinus_1.pinus.app.rpc.control.mainRemote.addProfitPoolAmount.toServer(randomServerRpcId(), {
            nid: this.nid,
            sceneId,
            amount
        });
    }
    async getPlatformControl(platformId, tenantId, nid, betGold) {
        return await pinus_1.pinus.app.rpc.control.mainRemote.getPlatformControl.toServer(randomServerRpcId(), {
            nid: this.nid,
            tenantId,
            betGold,
            platformId
        });
    }
    async changeBonusPoolAmount(sceneId, amount, betAmount, changeStatus) {
        await pinus_1.pinus.app.rpc.control.mainRemote.changeBonusPoolAmount.toServer(randomServerRpcId(), {
            nid: this.nid,
            sceneId,
            amount,
            betAmount,
            changeStatus
        });
    }
    async getPool(sceneId) {
        return pinus_1.pinus.app.rpc.control.mainRemote.getPool.toServer(randomServerRpcId(), { nid: this.nid, sceneId });
    }
    changeControlData(sheet) {
        return pinus_1.pinus.app.rpc.control.mainRemote.changeControlData.toServer(randomServerRpcId(), sheet);
    }
    getCorrectedValue(sceneId) {
        return pinus_1.pinus.app.rpc.control.mainRemote.getCorrectedValueAndLockJackpot.toServer(randomServerRpcId(), {
            nid: this.nid,
            sceneId
        });
    }
    async initSceneControl() {
        const scenes = (0, JsonMgr_1.get)(`scenes/${this.name}`).datas;
        if (!scenes) {
            throw new Error(`${this.name}场调控初始化失败: 为获取到指定游戏的场信息, 游戏id ${this.nid}`);
        }
        await Promise.all(scenes.map(async (scene) => {
            const sceneControl = new sceneControl_1.SceneControl(scene, this.gameName, this.bankerGame, this.name);
            await sceneControl.init();
            this.sceneControlMap.set(scene.id, sceneControl);
        }));
    }
    async initPersonalControl() {
        const scenes = (0, JsonMgr_1.get)(`scenes/${this.name}`).datas;
        if (!scenes) {
            throw new Error(`${this.name}个人调控初始化失败: 为获取到指定游戏的场信息, 游戏id ${this.nid}`);
        }
        await Promise.all(scenes.map(async (scene) => {
            const personalControl = new personalControl_1.PersonalControl(scene, this.gameName, this.name);
            await personalControl.init();
            this.personalControlMap.set(scene.id, personalControl);
        }));
    }
}
exports.GameControlService = GameControlService;
function getPool(sceneId) {
    return GameControlService.getInstance().getPool(sceneId);
}
exports.getPool = getPool;
function addProfitPoolAmount(sceneId, amount) {
    return GameControlService.getInstance().addProfitPoolAmount(sceneId, amount);
}
exports.addProfitPoolAmount = addProfitPoolAmount;
function changeBonusPoolAmount(sceneId, amount, betAmount, changeStatus) {
    return GameControlService.getInstance().changeBonusPoolAmount(sceneId, amount, betAmount, changeStatus);
}
exports.changeBonusPoolAmount = changeBonusPoolAmount;
function changeControlData(sheet) {
    return GameControlService.getInstance().changeControlData(sheet);
}
exports.changeControlData = changeControlData;
function changePoolConfig(scene, changeParam) {
    return pinus_1.pinus.app.rpc.control.mainRemote.changePoolConfig.toServer(randomServerRpcId(), scene, changeParam);
}
exports.changePoolConfig = changePoolConfig;
async function changePlayerKillControl(player) {
    const profit = player.addDayTixian + player.gold - player.addDayRmb;
    if (profit > 0) {
        const awardKill = await TenantControl_manager_1.default.findAwardKillByTenantId(player.groupRemark);
        if (!!awardKill && awardKill.returnAwardRate < (profit / player.addDayRmb)) {
            return totalPersonalControl_1.TotalPersonalControl.addPlayer({
                uid: player.uid,
                probability: 100,
                killCondition: 0,
                remark: '返奖率超过租户返奖率',
                managerId: 'system',
            });
        }
    }
    if (player.dailyFlow > player.addDayRmb) {
        const totalKill = await TenantControl_manager_1.default.findTotalBetKillByTenantId(player.groupRemark);
        if (!!totalKill && totalKill.totalBet < (player.dailyFlow / player.addDayRmb)) {
            return totalPersonalControl_1.TotalPersonalControl.addPlayer({
                uid: player.uid,
                probability: 100,
                killCondition: 0,
                remark: '打码超过租户打码设定',
                managerId: 'system',
            });
        }
    }
}
exports.changePlayerKillControl = changePlayerKillControl;
function conversionSceneWeight(value) {
    return value * 100 - 100;
}
function getPlatformInfoWithLargest(players) {
    const sta = {};
    let platformId, tenantId;
    players.forEach(p => {
        if (!sta[p.platformId]) {
            sta[p.platformId] = 0;
        }
        sta[p.platformId] += 1;
        if (!platformId) {
            platformId = p.platformId;
            tenantId = p.groupRemark;
        }
        if (sta[p.platformId] > sta[platformId] && p.platformId !== platformId) {
            platformId = p.platformId;
            tenantId = p.groupRemark;
        }
    });
    return { platformId, tenantId };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZUNvbnRyb2xTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL25ld0NvbnRyb2wvZ2FtZUNvbnRyb2xTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLDREQUF1RDtBQUN2RCxzREFBaUQ7QUFDakQsMERBQThEO0FBQzlELGlDQUE2QjtBQUU3QiwrREFBK0Q7QUFDL0QsK0NBQStDO0FBQy9DLDJFQUFzRTtBQUN0RSw2RkFBcUY7QUFDckYsc0VBQWlFO0FBR2pFLDJDQUF5QztBQUV6QyxTQUFTLGlCQUFpQjtJQUN0QixNQUFNLFVBQVUsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBSXpELE9BQU8sVUFBVSxDQUFDLElBQUEsNEJBQWUsRUFBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNwRSxDQUFDO0FBS0QsTUFBYSxrQkFBa0I7SUFBL0I7UUFlSSxXQUFNLEdBQVcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM3QyxvQkFBZSxHQUE4QixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3ZELHVCQUFrQixHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBdUx6RSxDQUFDO0lBck1HLE1BQU0sQ0FBQyxXQUFXO1FBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7U0FDNUM7UUFFRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQWdCRCxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFFLFVBQVUsRUFDOEI7UUFDckQsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixNQUFNLEVB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