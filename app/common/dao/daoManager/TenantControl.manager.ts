import {TenantControlAwardKill} from "../mysql/entity/TenantControlAwardKill.entity";
import {TenantControlTotalBetKill} from "../mysql/entity/TenantControlTotalBetKill.entity";
import {TenantControlBetKill} from "../mysql/entity/TenantControlBetKill.entity";
import TenantControlAwardKillMysqlDao from "../mysql/TenantControlAwardKill.mysql.dao";
import TenantControlBetKillMysqlDao from "../mysql/TenantControlBetKill.mysql.dao";
import TenantControlTotalBetKillMysqlDao from "../mysql/TenantControlTotalBetKill.mysql.dao";
import TenantControlGameMysqlDao from "../mysql/TenantControlGame.mysql.dao";
import * as TenantControlAwardKillRedisDao  from "../redis/TenantControlAwardKill.redis.dao";
import * as TenantControlBetKillRedisDao from "../redis/TenantControlBetKill.redis.dao";
import * as TenantControlTotalBetKillRedisDao from "../redis/TenantControlTotalBetKill.redis.dao";
import * as TenantControlGameRedisDao from "../redis/TenantControlGame.redis.dao";
import {TenantControlGame} from "../mysql/entity/TenantControlGame.entity";
import * as controlRecordDAO from "../../../services/newControl/DAO/controlRecordDAO";
import {get_games, getScenes} from "../../../pojo/JsonConfig";

/**
 * 租户调控管理
 */
export class TenantControlManager {
    /**
     * 查找租户所有的游戏调控
     * @param tenantId
     */
    async findGameByTenantId(tenantId: string): Promise<TenantControlGame[]> {
        return await TenantControlGameMysqlDao.findList({tenant: tenantId});
    }

    /**
     * 获取该租户调控下游戏的所有场
     * @param tenantId
     * @param nid
     */
    async findGameByNid(tenantId: string, nid: string) {
        return TenantControlGameMysqlDao.findList({tenant: tenantId, nid});
    }

    /**
     * 获取租户下一个游戏场的调控概率
     * @param nid 游戏id
     * @param sceneId 场id
     * @param tenantId 租户id
     */
    async findGameBySceneInfo(tenantId: string, nid: string, sceneId: number): Promise<number | null> {
        // 先查redis
        const probability = await TenantControlGameRedisDao.findOneBySceneInfo(tenantId, nid, sceneId);

        if (probability !== null) {
            return probability;
        }

        // 查mysql
        const result = await TenantControlGameMysqlDao.findOne({nid, sceneId, tenant: tenantId});

        if (!!result) {
            await TenantControlGameRedisDao.saveOneBySceneInfo(tenantId, nid, sceneId, result.probability);
            return result.probability;
        }
        return null;
    }

    /**
     * 设置租户场id
     * @param tenantId 租户id
     * @param nid 游戏nid
     * @param sceneId  场id
     * @param probability 调控概率
     * @param managerId 添加人id
     */
    async setGameBySceneInfo(tenantId: string, nid: string, sceneId: number, probability: number, managerId: string): Promise<boolean> {
        // 查找一个租户
        const result = await this.findGameBySceneInfo(tenantId, nid, sceneId);

        const game = get_games(nid);
        const scenes = getScenes(game.name).datas;
        const scene = scenes.find(s => s.id === sceneId);

        // 如果存在则更新 不存在则插入
        if (result) {
            await TenantControlGameMysqlDao.updateOne({tenant: tenantId, nid, sceneId}, {probability});
            // 删除redis数据
            await TenantControlGameRedisDao.removeOne(tenantId, nid, sceneId);
        } else {
            // 插入一条
            await TenantControlGameMysqlDao.insertOne({
                tenant: tenantId,
                nid,
                sceneId,
                probability,
                sceneName: scene.name
            });
        }

        // 添加记录
        await controlRecordDAO.addRecord({
            name: managerId || '',
            type: controlRecordDAO.ControlRecordType.TENANT_GAME_SCENE,
            remark: '',
            uid: '',
            nid,
            data: {
                tenantId,
                sceneId,
                gameName: game.zname,
                sceneName: scene.name,
                beforeProbability: result || 0,
                probability,
            }
        });



        return true;
    }

    /**
     * 删除一条租户游戏场调控信息
     * @param tenantId
     * @param nid
     * @param sceneId
     * @param managerId
     */
    async removeGameBySceneInfo(tenantId: string, nid: string, sceneId: number, managerId: string): Promise<boolean> {
        // 先删mysql
        await TenantControlGameMysqlDao.delete({tenant: tenantId, nid, sceneId});
        // 再删redis
        await TenantControlGameRedisDao.removeOne(tenantId, nid, sceneId);

        const game = get_games(nid);
        const scenes = getScenes(game.name).datas;
        const scene = scenes.find(s => s.id === sceneId);

        // 添加记录
        await controlRecordDAO.addRecord({
            name: managerId || '',
            type: controlRecordDAO.ControlRecordType.REMOVE_TENANT_GAME_SCENE,
            remark: '',
            uid: '',
            nid,
            data: {
                tenantId,
                sceneId,
                gameName: game.zname,
                sceneName: scene.name,
            }
        });

        return true;
    }

    /**
     * 查找租户返奖率调控
     * @param tenantId
     */
    async findAwardKillByTenantId(tenantId: string): Promise<TenantControlAwardKill> {
        // 先查找redis
        let awardKill = await TenantControlAwardKillRedisDao.findOneByTenantId(tenantId);

        if (awardKill) {
            return awardKill;
        }

        // 再查找数据库
        awardKill = await TenantControlAwardKillMysqlDao.findOne({tenant: tenantId});

        if (!awardKill) {
            return null;
        }

        // 设置到redis里面
        await TenantControlAwardKillRedisDao.saveOneByTenantId(tenantId, awardKill);

        return awardKill;
    }

    /**
     * 查找租户打码量调控
     * @param tenantId
     */
    async findTotalBetKillByTenantId(tenantId: string): Promise<TenantControlTotalBetKill> {
        // 先查找redis
        let totalBetKill = await TenantControlTotalBetKillRedisDao.findOneByTenantId(tenantId);

        if (totalBetKill) {
            return totalBetKill;
        }

        // 再查找数据库
        totalBetKill = await TenantControlTotalBetKillMysqlDao.findOne({tenant: tenantId});

        if (!totalBetKill) {
            return null;
        }

        // 设置到redis里面
        await TenantControlTotalBetKillRedisDao.saveOneByTenantId(tenantId, totalBetKill);

        return totalBetKill;
    }

    /**
     * 查找租户押注超限调控
     * @param tenantId
     */
    async findBetKillByTenantId(tenantId: string): Promise<TenantControlBetKill> {
        // 先查找redis
        let betKill = await TenantControlBetKillRedisDao.findOneByTenantId(tenantId);

        if (betKill) {
            return betKill;
        }

        // 再查找数据库
        betKill = await TenantControlBetKillMysqlDao.findOne({tenant: tenantId});

        if (!betKill) {
            return null;
        }

        // 设置到redis里面
        await TenantControlBetKillRedisDao.saveOneByTenantId(tenantId, betKill);

        return betKill;
    }

    /**
     * 设置租户返奖率调控
     * @param tenantId
     * @param returnAwardRate 返奖率
     */
    async setAwardKill(tenantId: string, returnAwardRate: number): Promise<boolean> {
        // 直接设置到数据库
        const awardKill = await TenantControlAwardKillMysqlDao.findOne({tenant: tenantId});

        // 有则是更新 没有则是创建
        if (awardKill) {
            await TenantControlAwardKillMysqlDao.updateOne({id: awardKill.id}, {returnAwardRate})
            await TenantControlAwardKillRedisDao.removeOne(tenantId)
        } else {
            await TenantControlAwardKillMysqlDao.insertOne({tenant: tenantId, returnAwardRate});
        }

        return true;
    }

    /**
     * 设置租户押注调控
     * @param tenantId
     * @param bet
     */
    async setBetKill(tenantId: string, bet: number): Promise<boolean> {
        // 直接设置到数据库
        const betKill = await TenantControlBetKillMysqlDao.findOne({tenant: tenantId});

        // 有则是更新 没有则是创建
        if (betKill) {
            await TenantControlBetKillMysqlDao.updateOne({id: betKill.id}, {bet});
            await TenantControlBetKillRedisDao.removeOne(tenantId);
        } else {
            await TenantControlBetKillMysqlDao.insertOne({tenant: tenantId, bet});
        }
        return true;
    }

    /**
     * 设置租户打码调控
     * @param tenantId
     * @param totalBet
     */
    async setTotalBetKill(tenantId: string, totalBet: number): Promise<boolean> {
        // 直接设置到数据库
        const betKill = await TenantControlTotalBetKillMysqlDao.findOne({tenant: tenantId});

        // 有则是更新 没有则是创建
        if (betKill) {
            await TenantControlTotalBetKillMysqlDao.updateOne({id: betKill.id}, {totalBet});
            await TenantControlTotalBetKillRedisDao.removeOne(tenantId);
        } else {
            await TenantControlTotalBetKillMysqlDao.insertOne({tenant: tenantId, totalBet});
        }
        return true;
    }

    /**
     * 删除租户押注调控
     * @param tenantId
     */
    async removeBetKill(tenantId: string): Promise<boolean> {
        // 直接删除数据库
        await TenantControlBetKillMysqlDao.delete({tenant: tenantId});

        // 再删redis
        await TenantControlBetKillRedisDao.removeOne(tenantId);
        return true;
    }

    /**
     * 删除租户押注调控
     * @param tenantId
     */
    async removeTotalBetKill(tenantId: string): Promise<boolean> {
        // 直接删除数据库
        await TenantControlTotalBetKillMysqlDao.delete({tenant: tenantId});

        // 再删redis
        await TenantControlTotalBetKillRedisDao.removeOne(tenantId);
        return true;
    }

    /**
     * 删除租户押注调控
     * @param tenantId
     */
    async removeAwardKill(tenantId: string): Promise<boolean> {
        // 直接删除数据库
        await TenantControlAwardKillMysqlDao.delete({tenant: tenantId});

        // 再删redis
        await TenantControlAwardKillRedisDao.removeOne(tenantId);
        return true;
    }

    /**
     * 获取一页押注调控
     * @param page
     * @param limit
     */
    async getBetKillList(page: number, limit: number): Promise<{count: number, list: TenantControlBetKill[]}> {
        return await TenantControlBetKillMysqlDao.findListToLimit(page, limit);
    }

    /**
     * 获取一页返奖率调控
     * @param page
     * @param limit
     */
    async getAwardKillList(page: number, limit: number): Promise<{list: TenantControlAwardKill[], count: number}> {
        return await TenantControlAwardKillMysqlDao.findListToLimit(page, limit);
    }

    /**
     * 获取一页打码调控
     * @param page
     * @param limit
     */
    async getTotalBetKillList(page: number, limit: number): Promise<{list: TenantControlTotalBetKill[], count: number}> {
        return await TenantControlTotalBetKillMysqlDao.findListToLimit(page, limit);
    }
}

export default new TenantControlManager();
