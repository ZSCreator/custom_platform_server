import { Injectable } from '@nestjs/common';
import * as GameController from '../../../../../services/hall/gameController';
import { getLogger } from "pinus-logger";
import { changePoolConfig } from "../../../../../services/newControl/gameControlService";
import { BackendControlService } from "../../../../../services/newControl/backendControlService";
import { SLOT_WIN_LIMIT_NID_LIST } from "../../../../../consts/hallConst";
import { WinLimitConfig } from "../../../../../domain/CommonControl/interface/commonInterface";
import SlotWinLimitDAOImpl from "../../../../../domain/CommonControl/DAO/winLimitConfigDAOImpl";
import { createSlotLimitConfigObserver } from "../../../../../domain/CommonControl/slotLimitConfigObserver";
import { getTriggerOpts } from "../../../../../services/bonusPools/schedule";
import bonusPoolMysqlDao from "../../../../../common/dao/mysql/BonusPool.mysql.dao";
import PlayerManagerDao from "../../../../../common/dao/daoManager/Player.manager";
import * as controlRecordDAO from "../../../../../services/newControl/DAO/controlRecordDAO";
import SystemGameTypeManager from "../../../../../common/dao/daoManager/SystemGameType.manager";
import GameManager from "../../../../../common/dao/daoManager/Game.manager";
import SceneManagerDao from "../../../../../common/dao/daoManager/Scene.manager";
import RoomManager from "../../../../../common/dao/daoManager/Room.manager";
import GameRecordRedisDao from "../../../../../common/dao/redis/GameRecord.redis.dao";
import GameRecordMysqlDao from "../../../../../common/dao/mysql/GameRecord.mysql.dao";
import HotGameDataMysqlDao from "../../../../../common/dao/mysql/HotGameData.mysql.dao";
import { nid } from "../../../../MJ/lib/mjConst";
import OnlinePlayerRedisDao from "../../../../../common/dao/redis/OnlinePlayer.redis.dao";
import * as FileExprotData from "../../../../../services/manager/fileData/FileExprotData";
const game_scenes = require('../../../../../../config/data/game_scenes.json');
import PlatformNameAgentListRedisDao from "../../../../../common/dao/redis/PlatformNameAgentList.redis.dao";
import * as moment from "moment";
import ShareTenantRoomSituationRedisDao from '../../../../../common/dao/redis/ShareTenantRoomSituation.redis.dao';
import {get_games, getScenes} from "../../../../../pojo/JsonConfig";

const ManagerErrorLogger = getLogger('http', __filename);

interface res_info {
    nid: string,
    sceneId: number,
    name: string,
    entryCond: number,
    room_count: number
}

@Injectable()
export class GameService {
    /**
     * 获取 所有游戏开放的游戏
     * @param
     */
    async getAllGames(): Promise<any> {
        try {
            const allGames = await GameManager.findList({}, true);
            const list = allGames.map(m => {
                return {
                    zname: m.zname,
                    nid: m.nid,
                    opened: m.opened,
                }
            });
            return { code: 200, data: { list } };
        } catch (error) {
            ManagerErrorLogger.warn(`getAllGames ==>error: ${error}`);
            console.info(`getAllGames ==>error: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 获取 所有游戏开放的游戏 以及没有开放的游戏
     * @param
     */
    async getCloseGamesAndOpen(): Promise<any> {
        try {
            const allGames = await GameManager.findList({});
            let colseList = [];
            const openList = allGames.map(m => {
                if (m.opened) {
                    return {
                        zname: m.zname,
                        nid: m.nid,
                        opened: m.opened,
                    }
                } else {
                    colseList.push({
                        zname: m.zname,
                        nid: m.nid,
                        opened: m.opened,
                    })
                }

            })
            return { code: 200, data: { openList, colseList } };
        } catch (error) {
            ManagerErrorLogger.warn(`getCloseGamesAndOpen ==>error: ${error}`);
            console.info(`getCloseGamesAndOpen ==>error: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 设置某个游戏关闭
     * @param
     */
    async setOneGameClose(nid: string, opened: boolean): Promise<any> {
        try {
            await GameManager.updateOne({ nid }, { opened: opened });
            return true;
        } catch (error) {
            ManagerErrorLogger.warn(`setOneGameClose ==>error: ${error}`);
            console.info(`setOneGameClose ==>error: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 总后台  === 修改单个游戏列表类型
     */
    async setSystemTypeForNid(gameType: any): Promise<any> {
        try {
            await SystemGameTypeManager.updateOne({ typeId: gameType.typeId }, gameType);
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`setSystemTypeForNid ==>error: ${error}`);
            console.info(`setSystemTypeForNid==>error: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 总后台  === 获取缓存中所有的游戏列表
     */
    async getSystemType(): Promise<any> {
        try {
            const record = await SystemGameTypeManager.findList({});
            console.log("getSystemType", record);
            return record;
        } catch (error) {
            ManagerErrorLogger.info(`setSystemTypeForNid ==>error: ${error}`);
            console.info(`setSystemTypeForNid==>error: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 总后台  === 获取单个游戏的列表
     */
    async getSystemTypeForGameTypeId(typeId: number): Promise<any> {
        try {
            const game = await SystemGameTypeManager.findOne({ typeId: typeId });
            return game;
        } catch (error) {
            ManagerErrorLogger.info(`getSystemTypeForGameTypeId ==>error: ${error}`);
            console.info(`getSystemTypeForGameTypeId==>error: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 通过id查询游戏纪录信息
     *  id
     */
    async getGameRecordsForOtherTable(platformUid: string, page: number, pageSize: number, thirdUid: string, nid: string, uid: string, gameOrder: string, roundId: string, startTime: string, endTime: string): Promise<any> {
        try {
            //获取要查询的表组成数组
            let table1 = null;  //今日表
            let table2 = null;   // 月表
            if (startTime && endTime) {
                const day = moment(endTime).diff(moment(startTime), 'day');
                if (day + 1 > 10) {
                    return Promise.reject("查询范围请不要超过10天");
                }
                const start = moment(startTime).format("YYYYMM");
                const end = moment(endTime).format("YYYYMM");
                if (start != end) {
                    table1 = start;
                    table2 = end;
                } else {
                    table1 = start;
                }
            } else {
                let today = moment().format("YYYYMM");
                table1 = today;
            }
            let where = null;
            if (startTime && endTime) {
                where = `Sp_GameRecord.createTimeDate > "${startTime}"  AND Sp_GameRecord.createTimeDate <= "${endTime}"`;
            } else if(!roundId && !gameOrder){
                let start = moment().format("YYYY-MM-DD 00:00:00");
                let end = moment().format("YYYY-MM-DD 23:59:59.999");
                where = `Sp_GameRecord.createTimeDate > "${start}"  AND Sp_GameRecord.createTimeDate <= "${end}"`;
            }

            if (roundId) {
                where = `Sp_GameRecord.round_id = "${roundId}"`;
                let platformUidList = await PlatformNameAgentListRedisDao.findAllPlatformUidList(false);
                const {
                    list,
                    count
                } = await GameRecordMysqlDao.findListToLimitForRoundId(platformUidList, table1, where, page, pageSize);
                if (list.length !== 0) {
                    const res = list.map((info) => {
                        let sceneName = null;
                        const games = game_scenes.find(x => x.nid == info.nid);
                        if (games) {
                            let scene = games.scenes.find(x => x.scene == info.sceneId);
                            if (scene) {
                                sceneName = scene.name;
                            } else {
                                sceneName = info.sceneId;
                            }
                        }
                        return { sceneName, ...info };
                    });
                    return { list: res, count: count };
                } else {
                    return { list: [], count: 0 };
                }
            }


            if (gameOrder) {

                if (where) {
                    where = where + ` AND Sp_GameRecord.game_order_id = "${gameOrder}"`;
                } else {
                    where = `Sp_GameRecord.game_order_id = "${gameOrder}"`;
                }

                /**针对只有注单号的时候查询 */
                const list = gameOrder.split('-');

                if (list[0]) {
                    platformUid = list[0];
                }
                if (list[2] && list[2].length == 13) {
                    table1 =  moment(parseInt(list[2])).format("YYYYMM");
                }else{
                    table1 =  list[2].substring(0, 6);;
                }

            }


            if (uid) {
                const player = await PlayerManagerDao.findOneForUid(uid);
                if (player) {
                    platformUid = player.group_id ? player.group_id : null;
                }

                if (where) {
                    where = where + ` AND Sp_GameRecord.uid = "${uid}"`;
                } else {
                    where = `Sp_GameRecord.uid = "${uid}"`;
                }
            }

            if (thirdUid) {
                const player = await PlayerManagerDao.findOneForthirdUid(thirdUid);
                if (player) {
                    platformUid = player.group_id ? player.group_id : null;
                }

                if (where) {
                    where = where + ` AND Sp_GameRecord.thirdUid = "${thirdUid}"`;
                } else {
                    where = `Sp_GameRecord.thirdUid = "${thirdUid}"`;
                }
            }

            if (nid) {

                if (where) {
                    where = where + ` AND Sp_GameRecord.game_id = "${nid}"`;
                } else {
                    where = `Sp_GameRecord.game_id = "${nid}"`;
                }

            }


            if (where) {
                const {
                    list,
                    count
                } = await GameRecordMysqlDao.findListToLimitForWhereForMoreTable(platformUid, table1, table2, where, page, pageSize);
                if (list.length !== 0) {
                    const res = list.map((info) => {
                        let sceneName = null;
                        const games = game_scenes.find(x => x.nid == info.nid);
                        if (games) {
                            let scene = games.scenes.find(x => x.scene == info.sceneId);
                            if (scene) {
                                sceneName = scene.name;
                            } else {
                                sceneName = info.sceneId;
                            }
                        }
                        return { sceneName, ...info };
                    });
                    return { list: res, count: count };
                } else {
                    return { list: [], count: 0 };
                }

            } else {
                return { list: [], count: 0 };
            }


            // const { list, count } = await GameRecordMysqlDao.findListToLimit( page,20);
            // return { list, count };

        } catch (error) {
            ManagerErrorLogger.info(`getGameRecords ==>error: ${error}`);
            console.info(`getGameRecords==>error: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 通过id查询游戏纪录信息
     *  id
     */
    async findGameResultById(platformUid: string = null, rootAgent: string, gameOrder: string, createTimeDate: string, groupRemark: string): Promise<any> {
        try {
            let platformTableName = platformUid;
            if (!platformUid && rootAgent) {
                platformTableName = await PlatformNameAgentListRedisDao.findPlatformUid({ platformName: rootAgent });
            }

            if (!platformUid && !rootAgent) {
                if (groupRemark) {
                    platformTableName = await PlatformNameAgentListRedisDao.findPlatformUidForAgent({ agent: groupRemark });
                }
            }
            let createTimeTable = moment(createTimeDate).format("YYYYMM");
            let table = `Sp_GameRecord_${createTimeTable}`;
            if (platformTableName) {
                table = `Sp_GameRecord_${platformTableName}_${createTimeTable}`;
            }
            let endTime = moment(createTimeDate).add(10, 'm').format("YYYY-MM-DD HH:mm:ss");
            let startTime = moment(createTimeDate).subtract(1, 'm').format("YYYY-MM-DD HH:mm:ss");
            const record = await GameRecordMysqlDao.findForGameOrder(table, gameOrder, startTime, endTime);
            if (record) {
                let result = [];
                result.push(JSON.parse(record.result));
                return {
                    result: result,
                    id: record.id,
                    nid: record.nid,
                    gameName: record.gameName,
                    createTime: record.createTimeDate,
                    uid: record.uid,
                    status: record.status
                };
            } else {
                return null;
            }
        } catch (error) {
            ManagerErrorLogger.info(`findGameResultById ==>error: ${error}`);
            console.info(`findGameResultById==>error: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 获取游戏房间信息
     *  get_nid_scene
     */
    async get_nid_scene(): Promise<any> {
        let gamesList: { res: any[], name: string }[] = [];
        try {
            const games = await GameManager.findList({});
            const nidList = games.map(m => m.nid);
            for (const nid of nidList) {
                // @ts-ignore
                let res: res_info[] = await SceneManager.findList({ nid });
                res = res.map(m => {
                    return {
                        nid: m.nid,
                        sceneId: m.sceneId,
                        name: m.name,
                        entryCond: m.entryCond,
                        room_count: m.room_count
                    }
                });
                let game = await GameManager.findOne({ nid });
                gamesList.push({ res, name: game ? game.zname : "" });
            }
            return gamesList;
        } catch (error) {
            ManagerErrorLogger.info(`get_nid_scene ==>error: ${error}`);
            console.info(`get_nid_scene==>error: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 修改游戏房间信息
     *  update_nid_scene
     */
    async update_nid_scene(data: any): Promise<any> {
        try {
            for (const game of data) {
                let res: res_info[] = game.res;
                for (const res_one of res) {
                    await SceneManagerDao.updateOne({ nid: res_one.nid, sceneId: res_one.sceneId }, res_one);
                }
            }
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`update_nid_scene: ${error}`);
            console.info(`update_nid_scene: ${error}`);
            return Promise.reject(error);
        }
    }





    /**
     * 获取调控信息
     *  getControlPlanTwoInfo
     */
    async getControlPlanTwoInfo(): Promise<any> {
        try {
            return [];
            // return await getAllControlInfo();
        } catch (error) {
            ManagerErrorLogger.info(`getControlPlanTwoInfo: ${error}`);
            console.info(`getControlPlanTwoInfo: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 更新调控信息
     *  updateControlPlanState
     */
    async updateControlPlanState(nid: string, sceneId: number, state: any): Promise<any> {
        try {
            // await changeControlPlan({ nid, sceneId, state });
            return true
        } catch (error) {
            ManagerErrorLogger.info(`updateControlPlanState: ${error}`);
            console.info(`updateControlPlanState: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 更新调控信息
     *  updateControlPlanState
     */
    async getPersonalInfo(): Promise<any> {
        try {
            const personalInfo = await BackendControlService.getAllSceneControl();
            return personalInfo;
        } catch (error) {
            ManagerErrorLogger.info(`getPersonalInfo: ${error}`);
            console.info(`getPersonalInfo: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 设置调控权重
     *  updateControlPlanState
     */
    async setControlWeightValue(nid: any, sceneId: number, weights: any, managerId: string, remark: string): Promise<any> {
        try {
            // 获取游戏信息
            const game = await GameManager.findOne({ nid });

            if (!game) {
                return Promise.reject(`没有nid为 ${nid}的游戏`);
            }

            const scene = await SceneManagerDao.findOne({ nid, sceneId });

            if (!scene) {
                return Promise.reject(`没有sceneId为 ${sceneId}的场`);
            }

            // 获取前值
            const { weights: beforeWeights } = await BackendControlService.getOneSceneControlWeight(nid, sceneId);

            await BackendControlService.setSceneControlWeight({ nid, id: sceneId }, weights);

            // 添加记录
            await controlRecordDAO.addRecord({
                name: managerId || '',
                remark: remark || '',
                type: controlRecordDAO.ControlRecordType.SCENE,
                nid,
                data: {
                    sceneId,
                    gameName: game.zname,
                    sceneName: scene.name,
                    beforeWeights,
                    weights,
                }
            });
            await BackendControlService.setSceneControlWeight({ nid, id: sceneId }, weights);
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`setControlWeightValue: ${error}`);
            console.info(`setControlWeightValue: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 添加调控玩家
     *  addControlPlayer
     */
    async addControlPlayer(nid: any, sceneId: number, uid: string, probability: any, killCondition: any, managerId: string, remark: string): Promise<any> {
        try {
            // 获取游戏信息
            const game = await GameManager.findOne({ nid });

            if (!game) {
                return Promise.reject(`没有nid为 ${nid}的游戏`);
            }

            const scene = await SceneManagerDao.findOne({ nid, sceneId });

            if (!scene) {
                return Promise.reject(`没有sceneId为 ${sceneId}的场`);
            }

            const player = await PlayerManagerDao.findOne({ uid });

            if (!player) {
                return Promise.reject(`没有uid为 ${uid}的玩家`);
            }
            // 获取未修改前的玩家
            const controlPlayer = await BackendControlService.getOnePersonalControlPlayer({ nid, id: sceneId }, uid);

            // 当前调控概率 当前必杀条件 没有则为0
            let beforeProbability = 0, beforeKillCondition = 0;

            if (!!controlPlayer) {
                beforeKillCondition = controlPlayer.killCondition;
                beforeProbability = controlPlayer.probability;
            }
            await BackendControlService.addSceneControlPlayer({ nid, id: sceneId }, { uid, probability, killCondition });

            // 添加记录
            await controlRecordDAO.addRecord({
                name: managerId,
                remark: remark || '',
                type: controlRecordDAO.ControlRecordType.PERSONAL,
                uid,
                nid,
                data: {
                    sceneId,
                    gameName: game.zname,
                    sceneName: scene.name,
                    probability,
                    killCondition,
                    beforeProbability,
                    beforeKillCondition
                }
            });
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`addControlPlayer: ${error}`);
            console.info(`addControlPlayer: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 移除调控玩家
     *  removeControlPlayer
     */
    async removeControlPlayer(nid: any, sceneId: number, uid: string, managerId: string): Promise<any> {
        try {
            const game = get_games(nid);
            const scenes = getScenes(game.name).datas;
            const scene = scenes.find(s => s.id === sceneId);

            // 添加记录
            await controlRecordDAO.addRecord({
                name: managerId || '',
                type: controlRecordDAO.ControlRecordType.REMOVE_PERSONAL,
                remark: '',
                uid,
                data: {
                    nid,
                    sceneId,
                    sceneName: scene.name,
                }
            });
            await BackendControlService.removeSceneControlPlayer({ nid, id: sceneId }, uid);
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`removeControlPlayer: ${error}`);
            console.info(`removeControlPlayer: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 设置庄杀
     *  设置庄杀
     */
    async setBankerKill(nid: any, sceneId: number, bankerKillProbability: any, managerId: string, remark: string): Promise<any> {
        try {


            // 获取游戏信息
            const game = await GameManager.findOne({ nid });

            if (!game) {
                return Promise.reject(`没有nid为 ${nid}的游戏`);
            }

            const scene = await SceneManagerDao.findOne({ nid, sceneId });

            if (!scene) {
                return Promise.reject(`没有sceneId为 ${sceneId}的场`);
            }

            const sceneControlInfo = await BackendControlService.getOneGameSceneControlInfo({ nid, id: sceneId });

            if (!sceneControlInfo) {
                return Promise.reject(`未找到 nid为:${nid}, sceneId 为 ${sceneId}的场控信息， 请确认数据正确性`);
            }

            await BackendControlService.setBankerKill({ nid, sceneId, bankerKillProbability });

            // 添加记录
            await controlRecordDAO.addRecord({
                name: managerId || '',
                type: controlRecordDAO.ControlRecordType.BANKER,
                remark: remark,
                nid,
                data: {
                    sceneId,
                    gameName: game.zname,
                    sceneName: scene.name,
                    bankerKillProbability,
                    beforeBankerKillProbability: sceneControlInfo.bankerKillProbability,
                }
            });
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`setBankerKill: ${error}`);
            console.info(`setBankerKill: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 获取调控玩家
     */
    async getControlPlayers(nid: any, sceneId: number): Promise<any> {
        try {
            const controlPlayers = await BackendControlService.getSceneControlPlayers({ nid, sceneId });
            return controlPlayers;
        } catch (error) {
            ManagerErrorLogger.info(`getControlPlayers: ${error}`);
            console.info(`getControlPlayers: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 一键清除小黑屋
     */
    async deleteAllControlPlayers(managerId: string): Promise<any> {
        try {

            // 获取所有总控玩家
            const blackPlayersUidList = await BackendControlService.getAllTotalControlPlayersUidList();

            // 移除总控玩家
            await BackendControlService.removeControlPlayers();

            // 添加移除记录
            await Promise.all(blackPlayersUidList.map(uid => {
                return controlRecordDAO.addRecord({
                    name: managerId,
                    type: controlRecordDAO.ControlRecordType.REMOVE_TOTAL_PERSONAL,
                    remark: '',
                    uid,
                    data: {}
                });
            }))

            return true;
        } catch (error) {
            ManagerErrorLogger.info(`deleteAllControlPlayers: ${error}`);
            console.info(`deleteAllControlPlayers: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 获取slot游戏兜底列表
     */
    async getSlotWinLimitGamesList(): Promise<any> {
        try {
            const games = await GameManager.findList({}, false);
            let result = [];
            for (let key of SLOT_WIN_LIMIT_NID_LIST) {
                const item = games.find(m => m.nid == key)
                if (item) {
                    result.push({
                        zname: item.zname,
                        nid: item.nid,
                    })
                }
            }
            return result;
        } catch (error) {
            ManagerErrorLogger.info(`获取slot游戏兜底列表: ${error}`);
            console.info(`获取slot游戏兜底列表: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 获取slot游戏兜底配置出错
     */
    async getSlotWinLimitConfig(nid: string): Promise<any> {
        try {
            if (!nid || !SLOT_WIN_LIMIT_NID_LIST.includes(nid)) {
                return Promise.reject("该游戏无兜底配置");
            }
            const result: WinLimitConfig[] = await SlotWinLimitDAOImpl.getInstance().findOneConfig(nid);
            if (!result) {
                return Promise.reject(`未查找到游戏id ${nid} 的限押配置`);
            }

            return result;
        } catch (error) {
            ManagerErrorLogger.info(`getSlotWinLimitConfig: ${error}`);
            console.info(`getSlotWinLimitConfig: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 获取slot游戏兜底配置出错
     */
    async updateSlotWinLimitConfig(nid: any, updateFields: any): Promise<any> {
        try {
            const limitConfigObserver = await createSlotLimitConfigObserver(nid);

            // 更新配置
            await limitConfigObserver.updateOneGameConfig(nid, updateFields);
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`getSlotWinLimitConfig: ${error}`);
            console.info(`getSlotWinLimitConfig: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 获取清空奖池定时任务信息
     */
    async clearBonusPoolsJobInfo(): Promise<any> {
        try {
            const result = await getTriggerOpts();
            return result;
        } catch (error) {
            ManagerErrorLogger.info(`clearBonusPoolsJobInfo: ${error}`);
            console.info(`clearBonusPoolsJobInfo: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 获取清空奖池定时任务信息
     */
    async setClearBonusPoolsJobInfo(period: any, start: any): Promise<any> {
        try {
            await BackendControlService.updateClearPoolsAmountTimeConfig({ period, start });
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`setClearBonusPoolsJobInfo: ${error}`);
            console.info(`setClearBonusPoolsJobInfo: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 清空奖池
     */
    async clearBonusPools(): Promise<any> {
        try {
            await BackendControlService.clearAllPoolsAmount();
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`clearBonusPools: ${error}`);
            console.info(`clearBonusPools: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 锁定奖池
     */
    async setLockJackpot(nid: any, sceneId: number, lockJackpot: any, managerId: string, remark: string): Promise<any> {
        try {
            const game = get_games(nid);
            console.warn('666', game)
            const scenes = getScenes(game.name).datas;
            console.warn('666', scenes)
            const scene = scenes.find(s => s.id === sceneId);

            await BackendControlService.lockPool(nid, sceneId, lockJackpot);
            // 添加记录
            await controlRecordDAO.addRecord({
                name: managerId || '',
                type: controlRecordDAO.ControlRecordType.LOCK_JACKPOT,
                remark: remark ? remark : "",
                nid,
                data: {
                    sceneId,
                    lockJackpot,
                    sceneName: scene.name,
                    beforeLockJackpot: !lockJackpot,
                }
            });
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`clearBonusPools: ${error}`);
            console.info(`clearBonusPools: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 获取奖池配置信息
     */
    async getBonusPoolsConfigInfo(): Promise<any> {
        try {
            const recordList = await bonusPoolMysqlDao.findList({});
            return recordList;
        } catch (error) {
            ManagerErrorLogger.info(`getBonusPoolsConfigInfo: ${error}`);
            console.info(`getBonusPoolsConfigInfo: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 修改奖池配置信息
     */
    async setBonusPoolsConfigInfo(data: any): Promise<any> {
        try {
            const { id, nid, sceneId } = data;
            if (data['bonus_minAmount'] >= data['bonus_maxAmount']) {
                return Promise.reject("金额下限不应高于上限");
            }
            // Step 1: 更新进实例
            let changeFlag = await changePoolConfig({ nid, sceneId }, {
                initAmount: data['bonus_initAmount'],
                minAmount: data['bonus_minAmount'],
                minParameter: data['bonus_minParameter'],
                maxAmount: data['bonus_maxAmount'],
                maxParameter: data['bonus_maxParameter'],
                maxAmountInStore: data['bonus_maxAmountInStore'],
                maxAmountInStoreSwitch: data['bonus_maxAmountInStoreSwitch'],
                minBonusPoolCorrectedValue: data['bonus_minBonusPoolCorrectedValue'],
                maxBonusPoolCorrectedValue: data['bonus_maxBonusPoolCorrectedValue'],
                personalReferenceValue: data['bonus_personalReferenceValue']
            });
            ManagerErrorLogger.debug(`设置奖池配置信息|修改结果:${changeFlag}`);
            if (!changeFlag) {
                return Promise.reject("修改出错");
            }
            delete data['id'];
            delete data['nid'];
            delete data['sceneId'];
            delete data['gameName'];
            delete data['sceneName'];
            delete data['bonus_amount'];
            delete data['control_amount'];
            delete data['profit_amount'];
            ManagerErrorLogger.debug(`待修改参数 id:${id}|修改列 :${JSON.stringify(data)}`)
            await bonusPoolMysqlDao.updateOne({ id: id }, data);
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`setBonusPoolsConfigInfo: ${error}`);
            console.info(`setBonusPoolsConfigInfo: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 获取小黑屋的玩家
     */
    async getBlackHousePlayers(uid: string, page: number): Promise<any> {
        try {
            let start = 0;
            let count = 20;
            if (page) {
                start = count * (page - 1);
            }
            // start 是0，截止要加1
            // start 不是0, start 和 end 都要加1
            let end = start + count;
            let uidList = [];
            let allLength = 0;
            if (uid) {
                const personalTotalControl = await BackendControlService.getTotalControlPlayer(uid);
                if (personalTotalControl) {
                    uidList.push(personalTotalControl.uid)
                }
            } else {
                const blackPlayersUidList = await BackendControlService.getAllTotalControlPlayersUidList();
                allLength = blackPlayersUidList.length;
                blackPlayersUidList.sort();
                uidList = blackPlayersUidList.slice(start, end);
            }
            const selectFile = ["Player.uid", "Player.thirdUid", "Player.groupRemark", "Player.gold", "Player.addTixian", "Player.addDayRmb", "Player.addDayTixian", "Player.ip", "Player.createTime"];
            const list = await PlayerManagerDao.findListToLimitInUids(selectFile, uidList);
            const onlineList = await OnlinePlayerRedisDao.findList();
            let finaliyList = [];
            for (let player of list) {
                const key = onlineList.find(x => x.uid == player.uid);
                let online = false;
                if (key) {
                    online = true;
                }
                player.online = online;
                finaliyList.push(player);
            }
            return { finaliyList: finaliyList, allLength: allLength };
        } catch (error) {
            ManagerErrorLogger.info(`getBlackHousePlayers: ${error}`);
            console.info(`getBlackHousePlayers: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 根据传入的uid 来获取玩家的个控信息
     */
    async getBlackPlayerControl(uid: string): Promise<any> {
        try {

            const personalTotalControl = await BackendControlService.getTotalControlPlayer(uid);
            return personalTotalControl;
        } catch (error) {
            ManagerErrorLogger.info(`getBlackPlayerControl: ${error}`);
            console.info(`getBlackPlayerControl: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 获取游戏房间信息,包含该游戏下面有多少个房间以及有多少个机器人
     * @param
     * @total_pl  所有的玩家数量
     * @robot_pl  机器人的数量
     */
    async getNidRoom(): Promise<any> {
        try {
            let gamesList: { nid: string, zname: string, room_info: any[], total_room: number, total_pl: number, robot_pl: number }[] = [];
            const games = await GameController.getAllGames(false);
            for (const game of games) {
                const rooms = await RoomManager.findList({ nid: nid }, false);
                rooms.sort((a, b) => parseInt(a.roomId) - parseInt(b.roomId));
                let total_pl = 0;
                let robot_pl = 0;
                let room_info: { total1: number, total2: number, sceneId: number, roomId: string, open: boolean }[][] = [];
                for (const room of rooms) {
                    let total1 = 0;
                    let total2 = 0;
                    let sceneId = room.sceneId;
                    let roomId = room.roomId;
                    let open = room.open;
                    if (!room_info[sceneId]) room_info[sceneId] = [];
                    room_info[sceneId].push({ total1, total2, sceneId, roomId, open });
                    total_pl = total_pl + total2;
                    robot_pl += total2;
                }
                gamesList.push({
                    nid: game.nid,
                    zname: game.zname,
                    room_info,
                    total_room: rooms.length,
                    total_pl,
                    robot_pl: robot_pl
                });
            }
            return gamesList;
        } catch (error) {
            ManagerErrorLogger.info(`getBlackPlayerControl: ${error}`);
            console.info(`getBlackPlayerControl: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 获取单个场的调控权重
     * @param
     * @nid
     * @sceneId
     */
    async getOneSceneControlWeight(nid: any, sceneId: number): Promise<any> {
        try {
            const data = await BackendControlService.getOneSceneControlWeight(nid, sceneId);
            if (!data) {
                return Promise.reject('未查询到数据');
            }
            return data;
        } catch (error) {
            ManagerErrorLogger.info(`getOneSceneControlWeight: ${error}`);
            console.info(`getOneSceneControlWeight: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 获取单个游戏的调控权重
     * @param
     * @nid
     * @sceneId
     */
    async getOneGameControlInfo(nid: any): Promise<any> {
        try {
            const oneGameSceneControlInfo = await BackendControlService.getOneGameSceneControlList(nid);

            if (oneGameSceneControlInfo.length > 0) {
                const sceneIdList = oneGameSceneControlInfo.map(sceneControl => sceneControl.sceneId);

                // 获取返奖率
                const oddsOfWinningList = await BackendControlService.getPoolsOddsOfWinning({ [nid]: sceneIdList });

                oneGameSceneControlInfo.forEach((sceneControl, index) => {
                    sceneControl.oddsOfWinning = oddsOfWinningList[nid][index].oddsOfWinning;
                });
            }
            return oneGameSceneControlInfo;
        } catch (error) {
            ManagerErrorLogger.info(`getOneGameControlInfo: ${error}`);
            console.info(`getOneGameControlInfo: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 获取调控记录
     * @param
     * @nid
     * @sceneId
     */
    async getControlRecords(where: {uid?: string, nid?: string}, page: number, limit: number): Promise<any> {
        try {
            // 调控记录
            return await controlRecordDAO.getRecords(where, page - 1, limit);
        } catch (error) {
            ManagerErrorLogger.info(`getOneGameControlInfo: ${error}`);
            console.info(`getOneGameControlInfo: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 添加总控玩家
     * @param
     * @nid
     * @sceneId
     */
    async addTotalControlPlayer(uid: string, probability, managerId, remark, killCondition): Promise<any> {
        try {
            // 获取总调控玩家
            const controlPlayer = await BackendControlService.getTotalControlPlayer(uid);

            // 当前调控概率 当前必杀条件 没有则为0
            let beforeProbability = 0, beforeKillCondition = 0;

            if (!!controlPlayer) {
                beforeKillCondition = controlPlayer.killCondition;
                beforeProbability = controlPlayer.probability;
            }
            await BackendControlService.addTotalPersonalControlPlayer({
                uid,
                probability,
                managerId,
                remark,
                killCondition
            });
            // 添加记录
            await controlRecordDAO.addRecord({
                name: managerId || '',
                type: controlRecordDAO.ControlRecordType.TOTAL_PERSONAL,
                remark: remark,
                uid,
                data: {
                    beforeProbability,
                    beforeKillCondition,
                    probability,
                    killCondition
                }
            });
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`addTotalControlPlayer: ${error}`);
            console.info(`addTotalControlPlayer: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 删除总控玩家
     * @param
     * @nid
     * @sceneId
     */
    async deleteTotalControlPlayer(uid: string, managerId: string): Promise<any> {
        try {
            // 添加记录
            await controlRecordDAO.addRecord({
                name: managerId || '',
                type: controlRecordDAO.ControlRecordType.REMOVE_TOTAL_PERSONAL,
                remark: '',
                uid,
                data: {}
            });
            // 调控记录
            await BackendControlService.removeTotalPersonalControlPlayer(uid);
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`getOneGameControlRecords: ${error}`);
            console.info(`getOneGameControlRecords: ${error}`);
            return Promise.reject(error);
        }
    }

    /** 游戏记录导出功能
     * gameRecordFileExprotData
     * @param
     */
    async gameRecordFileExprotData(platformName: string, agentName: string, startTime: number, endTime: number, uid: string, thirdUid: string): Promise<any> {

        const agentList = await PlatformNameAgentListRedisDao.findOne({ platformName: platformName }, false);
        if (!agentList || agentList.length == 0) {
            return Promise.reject("该平台号下面没有代理");
        }
        let platformUid = await PlatformNameAgentListRedisDao.findPlatformUid({ platformName: platformName });
        if (agentName) {
            let item = agentList.find(x => x == agentName);
            if (!item) {
                return Promise.reject("该平台号下面不存在该代理");
            }
            return await FileExprotData.downGameRecordDataForAgent(platformUid, agentName, startTime, endTime, uid, thirdUid);
        }
        return await FileExprotData.downGameRecordDataForPlatformName(platformUid, startTime, endTime, uid, thirdUid);
    }

    /** 热门游戏统计
     * GameLoginStatistics
     * @param
     */
    async GameLoginStatistics(startTime: number, endTime: number,): Promise<any> {
        //获取所有场的数据
        const sceneList = await SceneManagerDao.getAllSceneData();
        //根据时间获取每日的热门游戏统计数据
        const start = moment(startTime).format("YYYY-MM-DD HH:mm:ss");
        const end = moment(endTime).format("YYYY-MM-DD HH:mm:ss");
        const result = await HotGameDataMysqlDao.findListToLimit(start, end);
        if (!result) {
            return [];
        }
        const oneDay = 24 * 60 * 60 * 1000;
        const num = Math.ceil((endTime - startTime) / oneDay);
        let resultArr: { nid: string, sceneId: number, game_name: string, scene_name: string, day: string, num: number }[] = [];
        for (const sceneInfo of sceneList) {
            //获取游戏的中文名和场名
            let sceneName = null;
            let gameName = null;
            const games = game_scenes.find(x => x.nid == sceneInfo.nid);
            if (games) {
                gameName = games.name;
                let scene = games.scenes.find(x => x.scene == sceneInfo.sceneId);
                if (scene) {
                    sceneName = scene.name;
                } else {
                    sceneName = sceneInfo.sceneId;
                }
            }
            //从result 获取对应场的游戏人数
            for (let day = 0; day < num; day++) {
                const start1 = moment(startTime + (day * oneDay)).format("YYYY-MM-DD");
                const end1 = moment(start1).add(1, 'day').format("YYYY-MM-DD");
                const oneResult = result.find(x => x.nid == sceneInfo.nid && x.sceneId == sceneInfo.sceneId && x.createTime > start1 && x.createTime < end1);
                if (oneResult) {
                    resultArr.push({ nid: sceneInfo.nid, sceneId: sceneInfo.sceneId, game_name: gameName, scene_name: sceneName, day: start1, num: oneResult.playerNum });
                } else {
                    resultArr.push({ nid: sceneInfo.nid, sceneId: sceneInfo.sceneId, game_name: gameName, scene_name: sceneName, day: start1, num: 0 });
                }
            }
        }
        return resultArr;
    }

    /**
     * 获取租户房间详情
     */
    async getTenantRoomSituation() {
        const result = await ShareTenantRoomSituationRedisDao.findAll();
        return result;
    }
}


