import { Controller, Post, Body, UseGuards, Session, Res } from "@nestjs/common";
import { Response } from "express";
import { GameService } from "./game.service";
import { getLogger } from 'pinus-logger';
import { TokenGuard } from "../main/token.guard";
import { BASE_TYPE } from "../../../../../consts/hallConst";
import TenantControlManager from "../../../../../common/dao/daoManager/TenantControl.manager";
import SceneManagerDao from "../../../../../common/dao/daoManager/Scene.manager";
import GameManagerDao from "../../../../../common/dao/daoManager/Game.manager";
import PlayerAgentMysqlDao from '../../../../../common/dao/mysql/PlayerAgent.mysql.dao';
import FileExportDataInRedisDao from '../../../../../common/dao/redis/FileExportData.redis.dao';
import * as fs from 'fs';
import { BackendControlService } from "../../../../../services/newControl/backendControlService";
import { pinus } from "pinus";

/**
 * 管理后台 ===== 游戏有关
 */
@Controller('game')
@UseGuards(TokenGuard)
export class GameController {
    logger: any;
    constructor(private readonly GameService: GameService) {
        this.logger = getLogger('thirdHttp', __filename);
    }

    /**
     * 获取所有的游戏
     * @param str
     */
    @Post('getAllGames')
    async getAllGames(@Body() str: any): Promise<any> {
        console.log("getAllGames", str)
        try {
            return await this.GameService.getAllGames();
        } catch (error) {
            this.logger.error(`获取所有开放的游戏 :${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 获取所有开放的游戏
     * @param str
     */
    @Post('getCloseGamesAndOpen')
    async getOpenGameAndClose(@Body() str: any): Promise<any> {
        console.log("getOpenGameAndClose", str)
        try {
            return await this.GameService.getCloseGamesAndOpen();
        } catch (error) {
            this.logger.error(`获取所有开放的游戏 :${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 设置某个游戏关闭
     * @param str
     */
    @Post('setOneGameClose')
    async setOneGameClose(@Body() str: any): Promise<any> {
        console.log("setOneGameClose", str);
        try {
            const { nid, opened } = str;
            if (!nid) {
                return { code: 500, error: "缺少游戏nid" }
            }
            await this.GameService.setOneGameClose(nid, opened);
            return { code: 200 };
        } catch (error) {
            this.logger.error(`设置某个游戏关闭 :${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     *  设置游戏类型
     * @param str
     */
    @Post('setSystemTypeForNid')
    async setSystemTypeForNid(@Body() str: any): Promise<any> {
        console.log("setSystemTypeForNid", str)
        try {
            const param = str;
            const typeId = Number(param.typeId);
            const sort = Number(param.sort);
            const open = param.open;
            const nidList = param.nidList;
            const gameType1 = await this.GameService.getSystemTypeForGameTypeId(typeId);
            if (!gameType1) {
                return { code: 500, error: "游戏类型参数不对" }
            }
            let gameType: any = {};
            if (sort.toString()) {
                gameType.sort = sort;
            }
            if (open.toString()) {
                gameType.open = open;
            }
            let nids = [];
            let ss = nidList.sort((a, b) => a.sort - b.sort);  //游戏排序
            let sshot = nidList.filter(x => x.ishot == true);  //游戏排序
            sshot = sshot.sort((a, b) => a.hsort - b.hsort);  //热门游戏排序
            let hotNids = [];
            for (let key of sshot) {
                hotNids.push(key.nid);
            }
            for (let key of ss) {
                nids.push(key.nid);
            }
            gameType.nidList = nids.toString();
            gameType.typeId = typeId;
            gameType.name = gameType1.name;
            gameType.hotNidList = hotNids.toString();
            await this.GameService.setSystemTypeForNid(gameType);
            return { code: 200, msg: "修改成功" };
        } catch (error) {
            this.logger.error(`获取所有开放的游戏 :${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 获取游戏类型数据
     * @param str
     */
    @Post('getSystemType')
    async getSystemType(@Body() str: any): Promise<any> {
        console.log("getSystemType", str)
        try {
            const record = await this.GameService.getSystemType();
            return { code: 200, record };
        } catch (error) {
            this.logger.error(`获取所有开放的游戏 :${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     *  获取所有游戏记录
     * @param str
     */
    @Post('getGameRecords')
    async getGameRecords(@Body() str: any): Promise<any> {
        console.log("getGameRecords", str)
        try {
            // const param = str.param;
            let { platformUid, page, thirdUid, pageSize, nid, uid, startTime, endTime, gameOrder, roundId } = str;

            if (!page) {
                page = 1;
            }

            const startTimetemp = Date.now();
            const { list, count } = await this.GameService.getGameRecordsForOtherTable(platformUid, page, pageSize, thirdUid, nid, uid, gameOrder, roundId, startTime, endTime);
            const endTimetemp = Date.now();
            return { code: 200, allLength: count, result: list, startTimetemp, endTimetemp };
        } catch (error) {
            this.logger.error(`查询游戏的游戏记录 :${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 通过id查询游戏纪录信息
     * @param str
     */
    @Post('findGameResultById')
    async findGameResultById(@Body() str: any): Promise<any> {
        console.log("findGameResultById", str)
        try {
            // const param = str.param;
            const { platformUid, rootAgent, gameOrder, createTimeDate, groupRemark } = str;
            if (!gameOrder && !createTimeDate) {
                return { code: 500, error: '请输入订单号和时间' }
            }
            const record = await this.GameService.findGameResultById(platformUid, rootAgent, gameOrder, createTimeDate, groupRemark);
            return { code: 200, record };
        } catch (error) {
            this.logger.error(`通过id查询游戏纪录信息 :${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 获取游戏房间信息
     * @param str
     */
    @Post('get_nid_scene')
    async get_nid_scene(@Body() str: any): Promise<any> {
        console.log("get_nid_scene", str)
        try {
            const gamesList = await this.GameService.get_nid_scene();
            return { code: 200, gamesList };
        } catch (error) {
            this.logger.error(`获取游戏房间信息 :${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 修改游戏房间信息
     * @param str
     */
    @Post('update_nid_scene')
    async update_nid_scene(@Body() str: any): Promise<any> {
        console.log("update_nid_scene", str)
        try {
            const data = str.data;
            const gamesList = await this.GameService.update_nid_scene(data);
            return { code: 200, gamesList };
        } catch (error) {
            this.logger.error(`修改游戏房间信息 :${error}`);
            return { code: 500, error: error }
        }
    }




    /**
     * 获取调控信息 -- 奖池调控
     * @param str
     */
    @Post('getControlPlanTwoInfo')
    async getControlPlanTwoInfo(@Body() str: any): Promise<any> {
        console.log("getControlPlanTwoInfo", str)
        try {

            const controlInfo = await this.GameService.getControlPlanTwoInfo();
            return { code: 200, controlInfo: controlInfo };
        } catch (error) {
            this.logger.error(`获取调控信息 :${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 更新调控信息 -- 奖池调控
     * @param str
     */
    @Post('updateControlPlanState')
    async updateControlPlanState(@Body() str: any): Promise<any> {
        console.log("updateControlPlanState", str)
        try {
            const param = str;
            const nid = param.nid;
            const sceneId = param.sceneId;
            const state = param.state;
            await this.GameService.updateControlPlanState(nid, sceneId, state);
            return { code: 200, msg: "设置成功" };
        } catch (error) {
            this.logger.error(`更新调控信息 :${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 获取个控信息
     * @param str
     */
    @Post('getPersonalInfo')
    async getPersonalInfo(@Body() str: any): Promise<any> {
        console.log("getPersonalInfo", str)
        try {
            const personalInfo = await this.GameService.getPersonalInfo();
            return { code: 200, personalInfo };
        } catch (error) {
            this.logger.error(`获取个控信息 :${JSON.stringify(error)}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 设置调控权重
     * @param str
     */
    @Post('setControlWeightValue')
    async setControlWeightValue(@Body() str: any): Promise<any> {
        console.log("setControlWeightValue", str)
        try {
            const param = str;
            const nid = param.nid;
            const sceneId = param.sceneId;
            const weights = param.weights;
            const managerId = param.managerId;
            const remark = param.remark;
            if (!nid || typeof sceneId !== 'number' || typeof weights !== 'number') {
                return { code: 500, error: '参数错误' };
            }
            await this.GameService.setControlWeightValue(nid, sceneId, weights, managerId, remark);
            return { code: 200, msg: "设置成功" };
        } catch (error) {
            this.logger.error(`设置调控权重 :${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 添加调控玩家
     * @param str
     *
     */
    @Post('addControlPlayer')
    async addControlPlayer(@Body() str: any): Promise<any> {
        console.log("addControlPlayer", str)
        try {
            const param = str;
            const nid = param.nid;
            const sceneId = param.sceneId;
            const uid = param.uid;
            const probability = param.probability;
            const killCondition = param.killCondition;
            const managerId = param.managerId;
            const remark = param.remark;
            if (!nid || typeof sceneId !== 'number') {
                return { code: 500, error: '参数不正确' };
            }

            if (!uid) {
                return { code: 500, error: 'uid不能为空' };
            }

            if (typeof probability !== 'number') {
                return { code: 500, error: '调控概率参数错误' };
            }

            if (typeof killCondition !== 'number') {
                return { code: 500, error: '必杀参数错误' };
            }
            await this.GameService.addControlPlayer(nid, sceneId, uid, probability, killCondition, managerId, remark);
            return { code: 200, msg: "添加调控玩家成功" };
        } catch (error) {
            this.logger.error(`添加调控玩家 :${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 移除调控玩家
     * @param str
     *
     */
    @Post('removeControlPlayer')
    async removeControlPlayer(@Body() str: any): Promise<any> {
        console.log("removeControlPlayer", str)
        try {
            const param = str;
            const nid = param.nid;
            const sceneId = param.sceneId;
            const uid = param.uid;

            if (!nid || typeof sceneId !== 'number') {
                return { code: 500, error: '参数不正确' };
            }

            if (!uid) {
                return { code: 500, error: 'uid不能为空' };
            }

            await this.GameService.removeControlPlayer(nid, sceneId, uid, str.manager);
            return { code: 200, msg: "移除调控玩家成功" };
        } catch (error) {
            this.logger.error(`移除调控玩家 :${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 设置庄杀
     * @param str
     *
     */
    @Post('setBankerKill')
    async setBankerKill(@Body() str: any): Promise<any> {
        console.log("setBankerKill", str)
        try {
            const param = str;
            const nid = param.nid;
            const sceneId = param.sceneId;
            const managerId = param.managerId;
            const remark = param.remark;
            const bankerKillProbability = param.bankerKillProbability;

            if (!nid || typeof sceneId !== 'number') {
                this.logger.error('setBankerKill ==>', nid, sceneId);
                return { code: 500, error: '参数不正确' };
            }

            if (typeof bankerKillProbability !== 'number') {
                this.logger.error('setBankerKill ==>', bankerKillProbability);
                return { code: 500, error: '参数不正确' };
            }

            await this.GameService.setBankerKill(nid, sceneId, bankerKillProbability, managerId, remark);
            return { code: 200, msg: "设置庄杀成功" };
        } catch (error) {
            this.logger.error(`设置庄杀 :${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 获取调控玩家
     * @param str
     */
    @Post('getControlPlayers')
    async getControlPlayers(@Body() str: any): Promise<any> {
        console.log("getControlPlayers", str)
        try {
            const param = str;
            const nid = param.nid;
            const sceneId = param.sceneId;

            const controlPlayers = await this.GameService.getControlPlayers(nid, sceneId);
            return { code: 200, controlPlayers };
        } catch (error) {
            this.logger.error(`获取调控玩家 :${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 一键删除小黑屋
     * @param str
     */
    @Post('deleteAllControlPlayers')
    async deleteAllControlPlayers(@Body() str: any): Promise<any> {
        console.log("deleteAllControlPlayers", str)
        try {
            await this.GameService.deleteAllControlPlayers(str.manager);
            return { code: 200, msg: '删除小黑屋' };
        } catch (error) {
            this.logger.error(`获取调控玩家 :${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 获取兜底的游戏列表
     * @param str
     */
    @Post('getSlotWinLimitGamesList')
    async getSlotWinLimitGamesList(@Body() str: any): Promise<any> {
        console.log("getSlotWinLimitConfig", str)
        try {
            // const param = str.param;
            const result = await this.GameService.getSlotWinLimitGamesList();
            return { code: 200, result };
        } catch (error) {
            this.logger.error(`获取slot游戏兜底配置 :${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 获取slot游戏兜底配置
     * @param str
     */
    @Post('getSlotWinLimitConfig')
    async getSlotWinLimitConfig(@Body() str: any): Promise<any> {
        console.log("getSlotWinLimitConfig", str)
        try {
            // const param = str.param;
            const nid = str.nid;
            const result = await this.GameService.getSlotWinLimitConfig(nid);
            return { code: 200, result };
        } catch (error) {
            this.logger.error(`获取slot游戏兜底配置 :${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 更新兜底配成功
     * @param str
     */
    @Post('updateSlotWinLimitConfig')
    async updateSlotWinLimitConfig(@Body() str: any): Promise<any> {
        console.log("updateSlotWinLimitConfig", str)
        try {
            const param = str;
            const nid = param.nid;
            const updateFields = param.updateFields;

            if (!nid || Object.prototype.toString.call(updateFields) !== BASE_TYPE.ARR) {
                return { code: 500, error: '参数错误' };
            }
            await this.GameService.updateSlotWinLimitConfig(nid, updateFields);
            return { code: 200, msg: '更新成功' };
        } catch (error) {
            this.logger.error(`更新兜底配成功 :${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 获取清空奖池定时任务信息
     */

    @Post('clear_bonus_pools_job_info')
    async clear_bonus_pools_job_info(@Body() str: any): Promise<any> {
        console.log("clear_bonus_pools_job_info", str)
        try {
            const result = await this.GameService.clearBonusPoolsJobInfo();
            return { code: 200, result };
        } catch (error) {
            this.logger.error(`获取清空奖池定时任务信息 :${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 设置清空奖池定时任务
     */
    @Post('set_clear_bonus_pools_job_info')
    async set_clear_bonus_pools_job_info(@Body() str: any): Promise<any> {
        console.log("set_clear_bonus_pools_job_info", str)
        try {
            const param = str;
            const period = param.period;
            const start = param.start;
            const result = await this.GameService.setClearBonusPoolsJobInfo(period, start);
            return { code: 200, result };
        } catch (error) {
            this.logger.error(`设置清空奖池定时任务 :${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 清空奖池
     */
    @Post('clear_bonus_pools')
    async clear_bonus_pools(@Body() str: any): Promise<any> {
        console.log("clear_bonus_pools", str)
        try {
            await this.GameService.clearBonusPools();
            return { code: 200, msg: "清空奖池成功" };
        } catch (error) {
            this.logger.error(`清空奖池 :${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 锁定奖池
     */

    @Post('setLockJackpot')
    async setLockJackpot(@Body() str: any): Promise<any> {
        console.log("setLockJackpot", str)
        try {
            const param = str;
            const nid = param.nid;
            const sceneId = param.sceneId;
            const lockJackpot = param.lockJackpot;
            const remark = param.remark;
            await this.GameService.setLockJackpot(nid, sceneId, lockJackpot, param.manager, remark);
            return { code: 200, msg: "锁定奖池成功" };
        } catch (error) {
            this.logger.error(`锁定奖池 :${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 获取奖池配置信息
     */
    @Post('get_bonusPools_config_info')
    async get_bonusPools_config_info(@Body() str: any): Promise<any> {
        console.log("get_bonusPools_config_info", str)
        try {
            const recordList = await this.GameService.getBonusPoolsConfigInfo();
            return { code: 200, recordList };
        } catch (error) {
            this.logger.error(`获取奖池配置信息 :${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 修改奖池配置信息
     */
    @Post('set_bonusPools_config_info')
    async set_bonusPools_config_info(@Body() str: any): Promise<any> {
        console.log("set_bonusPools_config_info", str)
        try {
            const data = str;
            if (!data.hasOwnProperty('id')) return { code: 500, msg: '缺少id' };
            await this.GameService.setBonusPoolsConfigInfo(data);
            return { code: 200, msg: "修改成功" };
        } catch (error) {
            this.logger.error(`获取奖池配置信息 :${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 获取小黑屋的玩家
     */
    @Post('getBlackHousePlayers')
    async getBlackHousePlayers(@Body() str: any): Promise<any> {
        console.log("getBlackHousePlayers", str)
        try {
            // const param = str.param;
            let page = str.page;
            const uid = str.uid;
            if (!page) {
                page = 1;
            }
            const { finaliyList, allLength } = await this.GameService.getBlackHousePlayers(uid, page);
            return { code: 200, finaliyList, allLength };
        } catch (error) {
            this.logger.error(`获取奖池配置信息 :${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 根据传入的uid 来获取玩家的个控信息
     */
    @Post('getBlackPlayerControl')
    async getBlackPlayerControl(@Body() str: any): Promise<any> {
        console.log("getBlackPlayerControl", str)
        try {
            // const param = str.param;
            const uid = str.uid;
            const personalTotalControl = await this.GameService.getBlackPlayerControl(uid);
            return { code: 200, personalTotalControl };
        } catch (error) {
            this.logger.error(`根据传入的uid 来获取玩家的个控信息 :${error}`);
            return { code: 500, error: error }
        }
    }



    /**
     * 获取游戏房间信息,包含该游戏下面有多少个房间以及有多少个机器人
     */
    @Post('getNidRoom')
    async getNidRoom(@Body() str: any): Promise<any> {
        console.log("getNidRoom", str)
        try {
            // const param = str.param;
            // const nid =  param.nid;
            const gamesList = await this.GameService.getNidRoom();
            return { code: 200, gamesList };
        } catch (error) {
            this.logger.error(`获取游戏房间信息:${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 获取单个场的调控权重
     */
    @Post('getOneSceneControlWeight')
    async getOneSceneControlWeight(@Body() str: any): Promise<any> {
        console.log("getOneSceneControlWeight", str)
        try {
            // const param = str.param;
            const { nid, sceneId } = str;
            if (!nid || typeof sceneId !== 'number') {
                return { code: 500, error: '参数不正确' };
            }
            const data = await this.GameService.getOneSceneControlWeight(nid, sceneId);
            return { code: 200, data };
        } catch (error) {
            this.logger.error(`获取游戏房间信息:${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 获取单个游戏场控信息
     */
    @Post('getOneGameControlInfo')
    async getOneGameControlInfo(@Body() str: any): Promise<any> {
        console.log("getOneGameControlInfo", str)
        try {
            // const param = str.param;
            const { nid } = str;
            if (!nid) {
                return { code: 500, error: '参数不正确' };
            }
            const oneGameSceneControlInfo = await this.GameService.getOneGameControlInfo(nid);
            return { code: 200, oneGameSceneControlInfo };
        } catch (error) {
            this.logger.error(`获取游戏房间信息:${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 获取调控记录
     */
    @Post('getControlRecords')
    async getControlRecords(@Body() str: any): Promise<any> {
        console.log("getOneGameControlInfo", str)
        try {
            // const param = str.param;
            let { page, uid, nid, limit } = str;
            page = Number(page);
            limit = Number(limit);
            if (typeof page !== 'number' ||  typeof limit !== 'number') {
                return { code: 500, error: '参数错误' };
            }

            const where: any = {};

            if (uid) {
                where.uid = uid;
            }

            if (nid) {
                where.nid = nid;
            }

            const [records, count] = await this.GameService.getControlRecords(where, page, limit);
            return { code: 200, records, count};
        } catch (error) {
            this.logger.error(`获取调控记录:${error}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 添加总控玩家
     */
    @Post('addTotalControlPlayer')
    async addTotalControlPlayer(@Body() str: any): Promise<any> {
        console.log("addTotalControlPlayer", str)
        try {
            // const param = str.param;
            let { uid, probability, managerId, remark, killCondition } = str;
            if (!uid) {
                return { code: 500, error: 'uid不能为空' };
            }
            if (!probability) {
                return { code: 500, error: '调控概率不能为零' };
            }
            if (!managerId && !remark) {
                return { code: 500, error: '备注不能为空' };
            }
            // 调控记录
            await this.GameService.addTotalControlPlayer(uid, probability, managerId, remark, killCondition);
            return { code: 200, msg: "添加成功" };
        } catch (error) {
            this.logger.error(`添加总控玩家:${error}`);
            return { code: 500, error: error }
        }
    }
    /**
     * 删除总控玩家
     */
    @Post('deleteTotalControlPlayer')
    async deleteTotalControlPlayer(@Body() str: any): Promise<any> {
        console.log("deleteTotalControlPlayer", str)
        try {
            // const param = str.param;
            let { uid } = str;
            if (!uid) {
                return { code: 500, error: 'uid不能为空' };
            }

            // 调控记录
            await this.GameService.deleteTotalControlPlayer(uid, str.manager);
            return { code: 200, msg: "删除成功" };
        } catch (error) {
            this.logger.error(`删除总控玩家:${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 添加租户押注必杀
     */
    @Post('addTenantControlBetKill')
    async tenantControlBetKill(@Body() str: any): Promise<any> {
        try {
            let { tenant, bet } = str;
            if (!tenant || !bet) {
                return { code: 500, error: '数值不能为空' };
            }

            if (typeof bet !== 'number' || bet <= 0) {
                return { code: 500, error: 'bet必须为整数且大于零' };
            }

            // 只能用租户号调控
            if (!(await PlayerAgentMysqlDao.findOne({ platformName: tenant }))) {
                return { code: 500, error: '平台不存在, 请输入正确的平台号' };
            }

            await TenantControlManager.setBetKill(tenant, bet);

            const { list, count } = await TenantControlManager.getBetKillList(1, 40);

            return { code: 200, list, count };
        } catch (error) {
            this.logger.error(`添加租户押注必杀失败: ${error.stack}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 添加租户打码必杀
     */
    @Post('addTenantControlTotalBetKill')
    async tenantControlTotalBetKill(@Body() str: any): Promise<any> {
        try {
            let { tenant, odds } = str;
            if (!tenant || !odds) {
                return { code: 500, error: '数值不能为空' };
            }

            if (typeof odds !== 'number' || odds <= 0) {
                return { code: 500, error: 'oddsBet必须为整数且大于零' };
            }

            // 只能用租户号调控
            if (!(await PlayerAgentMysqlDao.findOne({ platformName: tenant }))) {
                return { code: 500, error: '平台不存在, 请输入正确的平台号' };
            }

            await TenantControlManager.setTotalBetKill(tenant, odds);

            const { list, count } = await TenantControlManager.getTotalBetKillList(1, 40);

            return { code: 200, list, count };
        } catch (error) {
            this.logger.error(`添加租户打码必杀失败: ${error.stack}`);
            return { code: 500, error: error }
        }
    }


    /**
     * 添加租户返奖率必杀
     */
    @Post('addTenantControlAwardKill')
    async tenantControlAwardKill(@Body() str: any): Promise<any> {
        try {
            let { tenant, rate } = str;
            if (!tenant || !rate) {
                return { code: 500, error: '数值不能为空' };
            }

            if (typeof rate !== 'number' || rate <= 0) {
                return { code: 500, error: 'oddsBet必须为整数且大于零' };
            }

            // 只能用租户号调控
            if (!(await PlayerAgentMysqlDao.findOne({ platformName: tenant }))) {
                return { code: 500, error: '平台不存在, 请输入正确的平台号' };
            }

            await TenantControlManager.setAwardKill(tenant, rate);

            const { list, count } = await TenantControlManager.getAwardKillList(1, 40);

            return { code: 200, list, count };
        } catch (error) {
            this.logger.error(`添加租户返奖率必杀失败: ${error.stack}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 删除租户返奖率必杀
     */
    @Post('removeTenantControlAwardKill')
    async removeTenantControlAwardKill(@Body() str: any): Promise<any> {
        try {
            let { tenant } = str;
            if (!tenant) {
                return { code: 500, error: '数值不能为空' };
            }

            await TenantControlManager.removeAwardKill(tenant);

            const { count, list } = await TenantControlManager.getAwardKillList(1, 40);

            return { code: 200, count, list };
        } catch (error) {
            this.logger.error(`删除租户返奖率必杀失败: ${error.stack}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 删除租户打码必杀
     */
    @Post('removeTenantControlTotalBetKill')
    async removeTenantControlTotalBetKill(@Body() str: any): Promise<any> {
        try {
            let { tenant } = str;
            if (!tenant) {
                return { code: 500, error: '数值不能为空' };
            }

            await TenantControlManager.removeTotalBetKill(tenant);

            const { count, list } = await TenantControlManager.getTotalBetKillList(1, 40);

            return { code: 200, count, list };
        } catch (error) {
            this.logger.error(`删除租户打码必杀失败: ${error.stack}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 删除租户押注必杀
     */
    @Post('removeTenantControlBetKill')
    async removeTenantControlBetKill(@Body() str: any): Promise<any> {
        try {
            let { tenant } = str;
            if (!tenant) {
                return { code: 500, error: '数值不能为空' };
            }

            await TenantControlManager.removeBetKill(tenant);

            const { count, list } = await TenantControlManager.getBetKillList(1, 40);

            return { code: 200, count, list };
        } catch (error) {
            this.logger.error(`删除租户押注必杀失败: ${error.stack}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 获取一页租户押注必杀
     */
    @Post('TenantControlBetKill')
    async getTenantControlBetKillList(@Body() str: any): Promise<any> {
        try {
            let { page, pageSize } = str;
            if (!page) {
                return { code: 500, error: '数值不能为空' };
            }

            if (typeof page !== 'number' || Math.floor(page) < 1) {
                return { code: 500, error: 'page数值不正确' };
            }

            const { count, list } = await TenantControlManager.getBetKillList(Math.floor(page), pageSize);

            return { code: 200, count, list };
        } catch (error) {
            this.logger.error(`获取一页租户押注必杀失败: ${error.stack}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 获取一页租户打码必杀
     */
    @Post('TenantControlTotalBetKill')
    async getTenantControlTotalBetKillList(@Body() str: any): Promise<any> {
        try {
            let { page, pageSize } = str;
            if (!page) {
                return { code: 500, error: '数值不能为空' };
            }

            if (typeof page !== 'number' || Math.floor(page) < 1) {
                return { code: 500, error: 'page数值不正确' };
            }

            const { count, list } = await TenantControlManager.getTotalBetKillList(Math.floor(page), pageSize);

            return { code: 200, count, list };
        } catch (error) {
            this.logger.error(`获取一页租户打码必杀失败: ${error.stack}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 获取一页租户返奖率必杀
     */
    @Post('TenantControlAwardKill')
    async getTenantControlAwardKillList(@Body() str: any): Promise<any> {
        try {
            let { page, pageSize } = str;
            if (!page) {
                return { code: 500, error: '数值不能为空' };
            }

            if (typeof page !== 'number' || Math.floor(page) < 1) {
                return { code: 500, error: 'page数值不正确' };
            }

            const { count, list } = await TenantControlManager.getAwardKillList(Math.floor(page), pageSize);

            return { code: 200, count, list };
        } catch (error) {
            this.logger.error(`获取一页租户返奖率杀失败: ${error.stack}`);
            return { code: 500, error: error }
        }
    }

    /**
     *  总后台游戏数据导出功能
     */
    @Post('gameRecordFileExprotData')
    async playerLoginHourData(@Body() str: any, @Session() session: any, @Res() response: Response): Promise<any> {
        try {
            let { platformName, agentName, startTime, endTime, uid, thirdUid, managerAgent } = str;


            if (!startTime || !endTime) {
                return response.send({ code: 500, error: '时间按不存在' });
            }

            if (!platformName && !managerAgent) {
                return response.send({ code: 500, error: '请选择平台号' });
            }

            if (!platformName && managerAgent) {
                platformName = managerAgent;
            }

            const oneDay = 24 * 60 * 60 * 1000;
            const num = Math.ceil((endTime - startTime) / oneDay);
            if (num > 32) {
                return response.send({ code: 500, error: '导出时间请限制在一个月' });
            }
            const fileTime = await FileExportDataInRedisDao.findOne({});
            if (fileTime) {
                return response.send({ code: 500, error: '系统正在导出文件，请稍后在进行导出操作' });
            }
            await FileExportDataInRedisDao.insertOne({});
            const { address } = await this.GameService.gameRecordFileExprotData(platformName, agentName, startTime, endTime, uid, thirdUid);

            return response.download(address, (err) => {
                fs.unlinkSync(address);
                setTimeout(() => {
                    console.warn('删除导出时间键值', Date.now());
                    FileExportDataInRedisDao.delete({});
                }, 1000 * 60);
            });
        } catch (error) {
            //一分钟过后在进行删除
            setTimeout(() => {
                FileExportDataInRedisDao.delete({});
                console.warn('删除导出时间键值', Date.now());
            }, 1000 * 60);
            this.logger.error(`游戏数据导出功能 :${error}`);
            return response.send({ code: 500, error: error ? error : '获取失败' });
        }
    }




    /**
     * 获取一个租户所有的游戏调控记录
     */
    @Post('TenantControlGame')
    async getTenantControlGame(@Body() str: any): Promise<any> {
        try {
            let { tenant } = str;
            if (!tenant) {
                return { code: 500, error: '数值不能为空' };
            }

            return { code: 200, result: await TenantControlManager.findGameByTenantId(tenant) };
        } catch (error) {
            this.logger.error(`获取一个租户游戏场调控记录失败: ${error.stack}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 删除一个租户游戏场调控记录
     */
    @Post('removeTenantControlGameBySceneInfo')
    async removeTenantControlGameBySceneInfo(@Body() str: any): Promise<any> {
        try {
            let { tenant, nid, sceneId, manager } = str;
            if (!tenant || !nid || typeof sceneId !== "number") {
                return { code: 500, error: '数值不能为空' };
            }

            return { code: 200, result: await TenantControlManager.removeGameBySceneInfo(tenant, nid, sceneId, manager) };
        } catch (error) {
            this.logger.error(`删除一个租户游戏场调控失败: ${error.stack}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 设置一个租户游戏场调控记录
     */
    @Post('setTenantControlGameBySceneInfo')
    async SetTenantControlGameBySceneInfo(@Body() str: any): Promise<any> {
        try {
            let { tenant, nid, sceneId, probability, manager } = str;
            if (!tenant || !nid || typeof sceneId !== "number" || typeof probability !== "number") {
                return { code: 500, error: '数值不能为空' };
            }

            if (probability > 100 || probability < -100) {
                return { code: 500, error: 'probability的取值范围为 -100 - 100' };
            }

            return { code: 200, result: await TenantControlManager.setGameBySceneInfo(tenant, nid, sceneId, probability, manager) };
        } catch (error) {
            this.logger.error(`设置一个租户游戏场调控失败: ${error.stack}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 获取租户游戏调控单个游戏的所有场调控
     */
    @Post('getTenantControlGameByNid')
    async getTenantControlGameByNid(@Body() str: any): Promise<any> {
        try {
            let { tenant, nid } = str;
            if (!tenant || !nid) {
                return { code: 500, error: '数值不能为空' };
            }

            return { code: 200, result: await TenantControlManager.findGameByNid(tenant, nid) };
        } catch (error) {
            this.logger.error(`获取租户游戏调控单个游戏的所有场调控失败: ${error.stack}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 获取该游戏下所有的场
     */
    @Post('scenesByNid')
    async getSceneByNid(@Body() str: any): Promise<any> {
        try {
            let { nid } = str;
            if (!nid) {
                return { code: 500, error: '数值不能为空' };
            }

            return { code: 200, result: await SceneManagerDao.findList({ nid }) };
        } catch (error) {
            this.logger.error(`获取该游戏下所有的场失败: ${error.stack}`);
            return { code: 500, error: error }
        }
    }
    /**获取进入游戏统计 */
    @Post('GameLoginStatistics')
    async GameLoginStatistics(@Body() str: any): Promise<any> {
        try {
            let { startTime, endTime } = str;
            if (!startTime || !endTime) {
                return { code: 500, error: '时间不能为空' };
            }

            if (endTime < startTime) {
                return { code: 500, error: '结束时间不能小于开始时间' };
            }

            const oneDay = 24 * 60 * 60 * 1000;
            const num = Math.ceil((endTime - startTime) / oneDay);

            if (num > 31) {
                return { code: 500, error: '查询时间范围请不要超过一个月' };
            }

            const result = await this.GameService.GameLoginStatistics(startTime, endTime)
            return { code: 200, result: result };
        } catch (error) {
            this.logger.error(`获取进入游戏统计: ${error.stack}`);
            return { code: 500, error: error }
        }
    }

    /**
     * 获取所有平台数据
     */
    @Post('getAllPlatformData')
    async getAllPlatformData(@Body() str: any) {
        const { month } = str;

        if (!!month) {
            if (month.toString().includes('.')) {
                return { code: 500, error: '月份不能为小数点' };
            }

            if (month < 1 || month > 12) {
                return { code: 500, error: '月份传入错误' };
            }
        }

        try {
            const result = await BackendControlService.getAllPlatformData(month - 1);

            return { code: 200, result };
        } catch (e) {
            this.logger.error(`获取所有平台数据出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }

    /**
     * 获取单个平台数据
     */
    @Post('getPlatformData')
    async getPlatformData(@Body() str: any) {
        const { platformId, startTime, endTime, tenantId } = str;

        if (!platformId || typeof platformId !== 'string') {
            return { code: 500, error: '请输入正确的平台id' };
        }

        if ((!!startTime && !!endTime) && (typeof startTime !== 'number' || typeof endTime !== "number")) {
            return { code: 500, error: '请输入正确的时间区间' };
        }

        try {
            const result = !tenantId ? await BackendControlService.getPlatformData(platformId, startTime, endTime) :
                await BackendControlService.getPlatformTenantData(platformId, tenantId, startTime, endTime);

            return { code: 200, result };
        } catch (e) {
            this.logger.error(`获取单个平台数据出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }

    /**
     * 获取单个租户数据
     */
    @Post('getTenantData')
    async getTenantData(@Body() str: any) {
        const { platformId, startTime, endTime, tenantId } = str;

        if (!platformId || typeof platformId !== 'string' || !tenantId || typeof tenantId !== 'string') {
            return { code: 500, error: '请输入正确的id' };
        }

        if ((!!startTime && !!endTime) && (typeof startTime !== 'number' || typeof endTime !== "number")) {
            return { code: 500, error: '请输入正确的时间区间' };
        }

        try {
            const result = await BackendControlService.getPlatformTenantData(platformId, tenantId, startTime, endTime);

            return { code: 200, result };
        } catch (e) {
            this.logger.error(`获取单个租户数据出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }

    /**
     * 获取单个平台单个游戏数据
     */
    @Post('getPlatformGameData')
    async getPlatformGameData(@Body() str: any) {
        const { platformId, nid, startTime, endTime, tenantId } = str;

        if (!platformId || typeof platformId !== 'string') {
            return { code: 500, error: '请输入正确的平台id' };
        }

        if (!nid || typeof nid !== 'string') {
            return { code: 500, error: '请输入正确的游戏nid' };
        }

        if ((!!startTime && !!endTime) && (typeof startTime !== 'number' || typeof endTime !== "number")) {
            return { code: 500, error: '请输入正确的时间区间' };
        }

        try {
            const result = !tenantId ? await BackendControlService.getPlatformGameData(platformId, nid, startTime, endTime) :
                await BackendControlService.getTenantGameData(platformId, tenantId, nid, startTime, endTime);

            return { code: 200, result };
        } catch (e) {
            this.logger.error(`获取单个平台数据出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }

    /**
     * 获取单个租户单个游戏数据
     */
    @Post('getTenantGameData')
    async getTenantGameData(@Body() str: any) {
        const { platformId, tenantId, nid, startTime, endTime } = str;

        if (!platformId || typeof platformId !== 'string' || !tenantId || typeof tenantId !== 'string') {
            return { code: 500, error: '请输入正确的id' };
        }

        if (!nid || typeof nid !== 'string') {
            return { code: 500, error: '请输入正确的游戏nid' };
        }

        if ((!!startTime && !!endTime) && (typeof startTime !== 'number' || typeof endTime !== "number")) {
            return { code: 500, error: '请输入正确的时间区间' };
        }

        try {
            const result = await BackendControlService.getTenantGameData(platformId, tenantId, nid, startTime, endTime);

            return { code: 200, result };
        } catch (e) {
            this.logger.error(`获取单个租户游戏数据出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }

    /**
     * 设置单个平台调控  这个接口也可以进行取消
     */
    @Post('setPlatformControl')
    async setPlatformControl(@Body() str: any) {
        const { platformId, nid, killRate, manager, tenantId } = str;

        if (typeof killRate !== 'number' || typeof platformId !== 'string') {
            return { code: 500, error: '数值不正确' };
        }

        if (!!nid && !(await GameManagerDao.findOne({ nid }))) {
            return { code: 500, error: '没有改nid的游戏' };
        }

        if (killRate < 0) {
            return { code: 500, error: '杀率不能小于0' };
        }

        if (killRate > 50) {
            return { code: 500, error: '杀率不能大于50' };
        }

        try {
            const result = !tenantId ? await BackendControlService.setPlatformControl(platformId, Number(killRate.toFixed(2)), manager, nid) :
                await BackendControlService.setTenantControl(platformId, tenantId, Number(killRate.toFixed(2)), manager, nid);

            return { code: 200, result };
        } catch (e) {
            this.logger.error(`设置平台调控出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }

    /**
     * 设置单个租户调控  这个接口也可以进行取消
     */
    @Post('setTenantControl')
    async setTenantControl(@Body() str: any) {
        const { platformId, tenantId, nid, killRate, manager } = str;

        if (typeof killRate !== 'number' || typeof platformId !== 'string' || typeof tenantId !== 'string') {
            return { code: 500, error: '数值不正确' };
        }

        if (!!nid && !(await GameManagerDao.findOne({ nid }))) {
            return { code: 500, error: '没有改nid的游戏' };
        }

        if (killRate < 0) {
            return { code: 500, error: '杀率不能小于0' };
        }

        if (killRate > 50) {
            return { code: 500, error: '杀率不能大于50' };
        }

        try {
            const result = await BackendControlService.setTenantControl(platformId, tenantId, Number(killRate.toFixed(2)), manager, nid);

            return { code: 200, result };
        } catch (e) {
            this.logger.error(`设置平台调控出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }

    /**
     * 获取租户隔离运行数据
     */
    @Post('getTenantRoomSituation')
    async getTenantRoomSituation(@Body() str: any) {
        try {
            const result = await this.GameService.getTenantRoomSituation();
            const data = await pinus.app.rpc.robot.mainRemote.NpcStatus.toServer('*');
            return { code: 200, result, data };
        } catch (e) {
            this.logger.error(`获取平台调控出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }
    /**
    * 设置单个平台调控  这个接口也可以进行取消
    */
    @Post('setPlatformNPC')
    async setPlatformNPC(@Body() str: any) {
        try {
            const { nidList, twoStrategy } = str;
            // const result = await this.GameService.getTenantRoomSituation();
            const data = await pinus.app.rpc.robot.mainRemote.NpcStart.toServer('*', nidList, twoStrategy);
            return { code: 200, data };
        } catch (e) {
            this.logger.error(`setPlatformNPC: ${e.stack}`);
            return { code: 500, error: e };
        }
    }

    /**
     * 获取服务器session连接数量
     */
    @Post('getSessionCount')
    async getSessionCount(@Body() str: any) {
        try {
            const gateServers = pinus.app.getServersByType('gate');
            const connectorServers = pinus.app.getServersByType('connector');
            const gate = {};
            const connector = {};

            await Promise.all(gateServers.map(async s => {
                gate[s.id] = await pinus.app.rpc.gate.chatRemote.getSessionsCount.toServer(s.id, {});
            }));

            await Promise.all(connectorServers.map(async s => {
                connector[s.id] = await pinus.app.rpc.connector.enterRemote.getSessionsCount.toServer(s.id, {});
            }));
            return { code: 200, data: {gate, connector}} ;
        } catch (e) {
            this.logger.error(`getSessionCount: ${e.stack}`);
            return { code: 500, error: e };
        }
    }
}
