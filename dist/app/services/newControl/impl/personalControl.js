"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalControl = void 0;
const personalControlDAO_1 = require("../DAO/personalControlDAO");
const totalPersonalControl_1 = require("./totalPersonalControl");
const pinus_1 = require("pinus");
const TenantControl_manager_1 = require("../../../common/dao/daoManager/TenantControl.manager");
class PersonalControl {
    constructor(scene, gameName, serverName) {
        this.conditionDescription = '';
        this.totalPersonalControl = totalPersonalControl_1.TotalPersonalControl;
        this.nid = scene.nid;
        this.sceneId = scene.id;
        this.sceneName = scene.name;
        this.gameName = gameName;
        this.serverName = serverName;
    }
    async init() {
        const data = await PersonalControl.DAO.findOne({ nid: this.nid, sceneId: this.sceneId });
        if (data) {
            return PersonalControl.DAO.initCache(this.nid);
        }
        const serverId = pinus_1.pinus.app.getServerId();
        const servers = pinus_1.pinus.app.getServersByType(this.serverName);
        if (serverId === servers[0].id) {
            return PersonalControl.DAO.create({
                nid: this.nid,
                gameName: this.gameName,
                sceneId: this.sceneId,
                playersCount: 0,
                conditionDescription: this.conditionDescription,
                controlPlayersMap: {},
                sceneName: this.sceneName,
            });
        }
    }
    async findPersonalControlPlayers(players, sceneInfo) {
        const personalControl = await PersonalControl.DAO.findOne({ sceneId: this.sceneId, nid: this.nid });
        const hasPlayers = Reflect.has(personalControl, 'controlPlayersMap') &&
            Object.keys(personalControl.controlPlayersMap).length > 0;
        return (await Promise.all(players.map(async (p) => {
            if (hasPlayers && !!personalControl.controlPlayersMap[p.uid]) {
                return personalControl.controlPlayersMap[p.uid];
            }
            let c = await this.totalPersonalControl.findPlayer(p.uid);
            if (c) {
                return c;
            }
            const probability = await TenantControl_manager_1.default.findGameBySceneInfo(p.groupRemark, sceneInfo.nid, sceneInfo.sceneId);
            const betKill = await TenantControl_manager_1.default.findBetKillByTenantId(p.groupRemark);
            if (probability !== null && probability !== 0) {
                return {
                    uid: p.uid,
                    probability: probability,
                    killCondition: (betKill && betKill.bet > 0) ? betKill.bet / 100 : 0,
                };
            }
            if (betKill && betKill.bet > 0) {
                return {
                    uid: p.uid,
                    probability: 0,
                    killCondition: betKill.bet / 100,
                };
            }
            return null;
        }))).filter(c => !!c);
    }
    static async addPlayer(scene, player) {
        const data = await this.DAO.findOne({ nid: scene.nid, sceneId: scene.id });
        if (!data) {
            throw new Error(`未获取到游戏id${scene.nid} 场id的${scene.id} 的个控信息`);
        }
        if (!Reflect.has(data, 'controlPlayersMap')) {
            data.controlPlayersMap = {};
        }
        if (!Reflect.has(data.controlPlayersMap, player.uid)) {
            data.playersCount++;
        }
        if (player.probability > 100 || player.probability < -100) {
            throw new Error('调控概率取值范围为 -100 - 100');
        }
        data.controlPlayersMap[player.uid] = player;
        await this.DAO.updateOne({
            nid: scene.nid,
            sceneId: scene.id,
        }, {
            playersCount: data.playersCount,
            controlPlayersMap: data.controlPlayersMap
        });
        await this.DAO.removeOutOfCache({ nid: scene.nid, sceneId: scene.id });
        return;
    }
    static async removePlayer(scene, uid) {
        const data = await this.DAO.findOne({ nid: scene.nid, sceneId: scene.id });
        if (Reflect.has(data.controlPlayersMap, uid)) {
            Reflect.deleteProperty(data.controlPlayersMap, uid);
            data.playersCount--;
            await this.DAO.updateOne({ nid: scene.nid, sceneId: scene.id }, {
                controlPlayersMap: data.controlPlayersMap,
                playersCount: data.playersCount,
            });
            await this.DAO.removeOutOfCache({ nid: scene.nid, sceneId: scene.id });
        }
        return true;
    }
    static async getControlPlayers(scene) {
        const data = await this.DAO.findOne({ nid: scene.nid, sceneId: scene.id });
        return {
            controlPlayers: data.controlPlayersMap || {},
            conditionDescription: data.conditionDescription,
        };
    }
    static async setConditionDescription({ nid, sceneId, description }) {
        await this.DAO.updateOne({ nid, sceneId }, {
            conditionDescription: description,
        });
        return this.DAO.removeOutOfCache({ nid, sceneId });
    }
    static async getOneControlPlayer(scene, uid) {
        const data = await this.DAO.findOne({ nid: scene.nid, sceneId: scene.id });
        if (!Reflect.has(data, 'controlPlayersMap')) {
            return;
        }
        return data.controlPlayersMap[uid];
    }
}
exports.PersonalControl = PersonalControl;
PersonalControl.DAO = personalControlDAO_1.default.getPersonalControlDAO();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyc29uYWxDb250cm9sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL25ld0NvbnRyb2wvaW1wbC9wZXJzb25hbENvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsa0VBQTJEO0FBQzNELGlFQUE4RDtBQUU5RCxpQ0FBOEI7QUFDOUIsZ0dBQXdGO0FBYXhGLE1BQWEsZUFBZTtJQVd4QixZQUFZLEtBQVksRUFBRSxRQUFnQixFQUFFLFVBQWtCO1FBSjlELHlCQUFvQixHQUFXLEVBQUUsQ0FBQztRQUNsQyx5QkFBb0IsR0FBRywyQ0FBb0IsQ0FBQztRQUl4QyxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztRQUM1QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUNqQyxDQUFDO0lBS0QsS0FBSyxDQUFDLElBQUk7UUFDTixNQUFNLElBQUksR0FBRyxNQUFNLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBR3pGLElBQUksSUFBSSxFQUFFO1lBQ04sT0FBTyxlQUFlLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDbEQ7UUFHRCxNQUFNLFFBQVEsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3pDLE1BQU0sT0FBTyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxD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