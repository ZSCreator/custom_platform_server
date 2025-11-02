"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneControl = void 0;
const sceneControlDAO_1 = require("../DAO/sceneControlDAO");
const pinus_logger_1 = require("pinus-logger");
const constants_1 = require("../constants");
const utils_1 = require("../../../utils");
const pinus_1 = require("pinus");
class SceneControl {
    constructor(scene, gameName, bankerGame, serverName) {
        this.serverName = '';
        this.bankerKillProbability = 0;
        this.weights = 0;
        this.baseSystemWinRate = 0.5;
        this.lockPool = false;
        this.blacklistConfig = new Map([
            [0, 1],
            [1, 1.25],
            [2, 1.5],
            [3, 2]
        ]);
        this.nid = scene.nid;
        this.sceneId = scene.id;
        this.sceneName = scene.name;
        this.gameName = gameName;
        this.bankerGame = bankerGame;
        this.serverName = serverName;
    }
    async init() {
        const data = await SceneControl.DAO.findOne({ nid: this.nid, sceneId: this.sceneId });
        if (data) {
            this.lockPool = data.lockPool;
            this.baseSystemWinRate = data.baseSystemWinRate;
            this.bankerKillProbability = data.bankerKillProbability;
            this.weights = data.weights;
            return SceneControl.DAO.initCache(this.nid);
        }
        const serverId = pinus_1.pinus.app.getServerId();
        const servers = pinus_1.pinus.app.getServersByType(this.serverName);
        if (serverId === servers[0].id) {
            return SceneControl.DAO.create({
                nid: this.nid,
                sceneId: this.sceneId,
                gameName: this.gameName,
                sceneName: this.sceneName,
                baseSystemWinRate: this.baseSystemWinRate,
                bankerKillProbability: this.bankerKillProbability,
                weights: this.weights,
                bankerGame: this.bankerGame,
                lockPool: this.lockPool,
            });
        }
    }
    getSceneControl() {
        return SceneControl.DAO.findOne({ nid: this.nid, sceneId: this.sceneId });
    }
    async getSlotAndBRGameControlState({ sceneControl, players, pool }) {
        if (!sceneControl) {
            return constants_1.ControlState.NONE;
        }
        const correctedValue = sceneControl.lockPool ? convertCorrectedValue(sceneControl.weights) : pool.correctedValue;
        const systemWinRate = this.getSystemWin(sceneControl, correctedValue, players);
        return calculateControlState(systemWinRate);
    }
    getSystemWin(sceneControlInfo, correctedValue, players) {
        if (players.length === 1) {
            const blackCorrectedValue = 1;
            return newPlayerALG(sceneControlInfo.baseSystemWinRate, correctedValue, blackCorrectedValue);
        }
        else {
            return ordinaryControlALG(sceneControlInfo.baseSystemWinRate, correctedValue);
        }
    }
    async getPlayersWinRate({ sceneControl, players, pool }) {
        let weights = 0;
        if (sceneControl) {
            weights = sceneControl.weights;
        }
        const correctedValue = sceneControl.lockPool ? convertCorrectedValue(weights) : pool.correctedValue;
        const realPlayer = players.filter(player => player.isRobot === 0), realPlayerCount = realPlayer.length, baseWinRate = 1 / players.length;
        return realPlayer.map(player => {
            let winRate;
            if (realPlayerCount === 1) {
                winRate = ordinaryPlayerControlALG(baseWinRate, correctedValue, 1);
            }
            else {
                winRate = playerControlALG(baseWinRate, correctedValue);
            }
            return { uid: player.uid, winRate };
        });
    }
    bankerKill(sceneControlInfo) {
        if (sceneControlInfo.bankerKillProbability > 0) {
            return (0, utils_1.random)(0, 100, 0) < sceneControlInfo.bankerKillProbability;
        }
        return false;
    }
    static async lockPool(nid, sceneId, lock) {
        if (!nid || typeof sceneId !== 'number' || typeof lock !== 'boolean') {
            throw new Error(`参数不合法`);
        }
        await this.DAO.updateOne({ nid, sceneId }, { lockPool: lock });
        await this.DAO.removeOutOfCache({ nid, sceneId });
        return true;
    }
    static async setBankerKill({ nid, sceneId, bankerKillProbability }) {
        if (bankerKillProbability > 100 || bankerKillProbability < 0) {
            throw new Error(`参数不正确 取值范围应为 0 - 100`);
        }
        await this.DAO.updateOne({ nid, sceneId }, { bankerKillProbability });
        await this.DAO.removeOutOfCache({ nid, sceneId });
    }
    static async setSceneControlWeight(scene, weights) {
        const sceneInfo = await this.DAO.findOne({ nid: scene.nid, sceneId: scene.id });
        if (!sceneInfo) {
            throw new Error(`未差找到找场控信息 传入输入游戏id: ${scene.nid} 场id ${scene.id}`);
        }
        if (!sceneInfo.lockPool) {
            throw new Error(`未锁定奖池无法更改场控权重`);
        }
        if (weights > 100 || weights < -100) {
            throw new Error(`权重值设置错误 取值范围为 -100 - 100`);
        }
        await this.DAO.updateOne({ nid: scene.nid, sceneId: scene.id }, { weights: weights });
        await this.DAO.removeOutOfCache({ nid: scene.nid, sceneId: scene.id });
    }
    static async getAllSceneControl() {
        return this.DAO.findDB({}, '-_id -updateTime -createTime -bankerGame -baseSystemWinRate');
    }
    static getOneGameSceneControl(nid) {
        return this.DAO.findDB({ nid }, '-_id -updateTime -createTime -bankerGame -baseSystemWinRate');
    }
    static getOneSceneControlInfo(nid, sceneId) {
        return this.DAO.findOne({ nid, sceneId });
    }
    static async getOneSceneWight(nid, sceneId) {
        const sceneInfo = await this.DAO.findOne({ nid, sceneId });
        return sceneInfo ? {
            weights: sceneInfo.weights,
            sceneId: sceneInfo.sceneId
        } : undefined;
    }
}
exports.SceneControl = SceneControl;
SceneControl.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
SceneControl.DAO = sceneControlDAO_1.default.getInstance();
function convertCorrectedValue(sceneWeight) {
    return (sceneWeight + 100) / 100;
}
function ordinaryPlayerControlALG(baseWinRate, bonusPoolCorrectedValue, blackCorrectedValue, personalCorrectedValue = 1, correctedValue = 2) {
    return baseWinRate *
        Math.abs(correctedValue - bonusPoolCorrectedValue) *
        Math.abs(correctedValue - blackCorrectedValue) *
        Math.abs(personalCorrectedValue - correctedValue);
}
function playerControlALG(baseWinRate, bonusPoolCorrectedValue, correctedValue = 2) {
    return baseWinRate * Math.abs(correctedValue - bonusPoolCorrectedValue);
}
function ordinaryControlALG(baseWinRate, bonusPoolCorrectedValue, correctedValue = 1) {
    return bonusPoolCorrectedValue - correctedValue;
}
function newPlayerALG(baseWinRate, bonusPoolCorrectedValue, blackCorrectedValue, personalCorrectedValue = 1, correctedValue = 1) {
    return bonusPoolCorrectedValue * blackCorrectedValue * personalCorrectedValue - correctedValue;
}
function calculateControlState(systemWinRate) {
    if (systemWinRate === 0) {
        return constants_1.ControlState.NONE;
    }
    if (systemWinRate > 0 && Math.random() < systemWinRate) {
        return constants_1.ControlState.SYSTEM_WIN;
    }
    if (systemWinRate < 0 && Math.random() < Math.abs(systemWinRate)) {
        return constants_1.ControlState.PLAYER_WIN;
    }
    return constants_1.ControlState.NONE;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmVDb250cm9sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL25ld0NvbnRyb2wvaW1wbC9zY2VuZUNvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsNERBQXFEO0FBQ3JELCtDQUF1QztBQUN2Qyw0Q0FBMEM7QUFDMUMsMENBQXNDO0FBRXRDLGlDQUE0QjtBQTBCNUIsTUFBYSxZQUFZO0lBY3JCLFlBQVksS0FBWSxFQUNaLFFBQWdCLEVBQ2hCLFVBQW1CLEVBQ25CLFVBQWtCO1FBVjlCLGVBQVUsR0FBVyxFQUFFLENBQUM7UUFFeEIsMEJBQXFCLEdBQVcsQ0FBQyxDQUFDO1FBQ2xDLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFDcEIsc0JBQWlCLEdBQVcsR0FBRyxDQUFDO1FBQ2hDLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFvRDFCLG9CQUFlLEdBQXdCLElBQUksR0FBRyxDQUFDO1lBQzNDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNOLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQztZQUNULENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNSLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNULENBQUMsQ0FBQztRQW5EQyxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztRQUM1QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUNqQyxDQUFDO0lBS0QsS0FBSyxDQUFDLElBQUk7UUFDTixNQUFNLElBQUksR0FBRyxNQUFNLFlBQVksQ0FB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