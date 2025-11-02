import { IPersonalControl } from "../interfaces/personalControl";
import { ControlPlayer, PersonalControlInfo, Scene, PersonalControlPlayer } from "..";
import PersonalControlDAO from "../DAO/personalControlDAO";
import { TotalPersonalControl } from "./totalPersonalControl";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import { pinus } from "pinus";
import TenantControlManager from "../../../common/dao/daoManager/TenantControl.manager";


/**
 * 个控初始化
 * @property nid 初始化nid
 * @property sceneId 初始化场id
 * @property gameName 游戏名字
 * @property sceneName 场名字
 * @property conditionDescription 调控描述

 * @property DAO 个控DAO模型
 */
export class PersonalControl implements IPersonalControl {
    static DAO: PersonalControlDAO = PersonalControlDAO.getPersonalControlDAO();
    serverName: string ;
    nid: string;
    sceneId: number;
    gameName: string;
    sceneName: string;
    conditionDescription: string = '';
    totalPersonalControl = TotalPersonalControl;


    constructor(scene: Scene, gameName: string, serverName: string) {
        this.nid = scene.nid;
        this.sceneId = scene.id;
        this.sceneName = scene.name;
        this.gameName = gameName;
        this.serverName = serverName;
    }

    /**
     * 服务开启初始化
     */
    async init(): Promise<any> {
        const data = await PersonalControl.DAO.findOne({ nid: this.nid, sceneId: this.sceneId });

        // 如果有则删除redis老旧数据
        if (data) {
            return PersonalControl.DAO.initCache(this.nid);
        }

        // 获取初始化的
        const serverId = pinus.app.getServerId();
        const servers = pinus.app.getServersByType(this.serverName);

        // 由第一个负责初始化
        if (serverId === servers[0].id) {
            // 创建一个
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

    /**
     * 查看这几个玩家是否是调控玩家
     * @param players 玩家列表
     * @param sceneInfo 场信息
     */
    async findPersonalControlPlayers(players: ControlPlayer[], sceneInfo: {nid: string, sceneId: number})
        : Promise<PersonalControlPlayer[]> {
        const personalControl: PersonalControlInfo = await PersonalControl.DAO.findOne({ sceneId: this.sceneId, nid: this.nid });

        // 个控队列列表是否有玩家
        const hasPlayers = Reflect.has(personalControl, 'controlPlayersMap') &&
            Object.keys(personalControl.controlPlayersMap).length > 0;

        return (await Promise.all(players.map(async p => {
            // 如果有玩家 且 有这个包含调控玩家 优先取个控列表的玩家
            if (hasPlayers && !!personalControl.controlPlayersMap[p.uid]) {
                return personalControl.controlPlayersMap[p.uid];
            }

            // 如果个控玩家里面没有查找总控里面是否有调控玩家
            let c = await this.totalPersonalControl.findPlayer(p.uid);

            if (c) {
                return c;
            }

            // 查找租户必杀条件
            // 如果调控都没有查找租户调控
            const probability = await TenantControlManager.findGameBySceneInfo(p.groupRemark, sceneInfo.nid, sceneInfo.sceneId);
            const betKill = await TenantControlManager.findBetKillByTenantId(p.groupRemark);
            if (probability !== null && probability !== 0) {
                return {
                    uid: p.uid,
                    probability: probability,
                    killCondition: (betKill && betKill.bet > 0) ? betKill.bet / 100 : 0,
                }
            }

            if (betKill && betKill.bet > 0) {
                return {
                    uid: p.uid,
                    probability: 0,
                    killCondition: betKill.bet / 100,
                }
            }
            return null;
        }))).filter(c => !!c);
    }

    /**
     * 添加调控玩家
     * @param scene  场信息
     * @param player 调控玩家信息
     */
    static async addPlayer(scene: Scene, player: PersonalControlPlayer) {
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

        // 取值范围不合理就返回
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

        // 删除缓存
        await this.DAO.removeOutOfCache({ nid: scene.nid, sceneId: scene.id });

        return;
    }

    /**
     * 删除调控玩家
     * @param scene 场信息
     * @param uid 删除玩家id
     *
     */
    static async removePlayer(scene: Scene, uid: string) {
        const data = await this.DAO.findOne({ nid: scene.nid, sceneId: scene.id });

        /**
         * 如果有才更新
         */
        if (Reflect.has(data.controlPlayersMap, uid)) {
            Reflect.deleteProperty(data.controlPlayersMap, uid);
            data.playersCount--;

            await this.DAO.updateOne({ nid: scene.nid, sceneId: scene.id },
                {
                    controlPlayersMap: data.controlPlayersMap,
                    playersCount: data.playersCount,
                }
            );

            // 删除缓存
            await this.DAO.removeOutOfCache({ nid: scene.nid, sceneId: scene.id });
        }

        return true;
    }

    /**
     * 获取所有调控玩家
     * @param scene 场信息
     */
    static async getControlPlayers(scene: Scene): Promise<object> {
        const data = await this.DAO.findOne({nid: scene.nid, sceneId: scene.id});
        
        return {
            controlPlayers: data.controlPlayersMap || {},
            conditionDescription: data.conditionDescription,
        }
    }

    /**
     * 设备必杀条件的描述
     * @param nid  游戏nid
     * @param sceneId 场id
     * @param description 描述
     */
    static async setConditionDescription({ nid, sceneId, description }: {
        nid: GameNidEnum, sceneId: number, description: string
    }): Promise<any> {
        await this.DAO.updateOne({ nid, sceneId }, {
            conditionDescription: description,
        });

        return this.DAO.removeOutOfCache({ nid, sceneId });
    }

    /**
     * 获取一个场的调控玩家
     * @param scene
     * @param uid 玩家
     */
    static async getOneControlPlayer(scene: Scene, uid: string): Promise<PersonalControlPlayer | undefined> {
        const data = await this.DAO.findOne({nid: scene.nid, sceneId: scene.id});

        // 如果没有 调控玩家就返回
        if (!Reflect.has(data, 'controlPlayersMap')) {
            return;
        }

        return  data.controlPlayersMap[uid];
    }
}