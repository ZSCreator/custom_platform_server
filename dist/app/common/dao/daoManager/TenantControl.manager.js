"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantControlManager = void 0;
const TenantControlAwardKill_mysql_dao_1 = require("../mysql/TenantControlAwardKill.mysql.dao");
const TenantControlBetKill_mysql_dao_1 = require("../mysql/TenantControlBetKill.mysql.dao");
const TenantControlTotalBetKill_mysql_dao_1 = require("../mysql/TenantControlTotalBetKill.mysql.dao");
const TenantControlGame_mysql_dao_1 = require("../mysql/TenantControlGame.mysql.dao");
const TenantControlAwardKillRedisDao = require("../redis/TenantControlAwardKill.redis.dao");
const TenantControlBetKillRedisDao = require("../redis/TenantControlBetKill.redis.dao");
const TenantControlTotalBetKillRedisDao = require("../redis/TenantControlTotalBetKill.redis.dao");
const TenantControlGameRedisDao = require("../redis/TenantControlGame.redis.dao");
const controlRecordDAO = require("../../../services/newControl/DAO/controlRecordDAO");
const JsonConfig_1 = require("../../../pojo/JsonConfig");
class TenantControlManager {
    async findGameByTenantId(tenantId) {
        return await TenantControlGame_mysql_dao_1.default.findList({ tenant: tenantId });
    }
    async findGameByNid(tenantId, nid) {
        return TenantControlGame_mysql_dao_1.default.findList({ tenant: tenantId, nid });
    }
    async findGameBySceneInfo(tenantId, nid, sceneId) {
        const probability = await TenantControlGameRedisDao.findOneBySceneInfo(tenantId, nid, sceneId);
        if (probability !== null) {
            return probability;
        }
        const result = await TenantControlGame_mysql_dao_1.default.findOne({ nid, sceneId, tenant: tenantId });
        if (!!result) {
            await TenantControlGameRedisDao.saveOneBySceneInfo(tenantId, nid, sceneId, result.probability);
            return result.probability;
        }
        return null;
    }
    async setGameBySceneInfo(tenantId, nid, sceneId, probability, managerId) {
        const result = await this.findGameBySceneInfo(tenantId, nid, sceneId);
        const game = (0, JsonConfig_1.get_games)(nid);
        const scenes = (0, JsonConfig_1.getScenes)(game.name).datas;
        const scene = scenes.find(s => s.id === sceneId);
        if (result) {
            await TenantControlGame_mysql_dao_1.default.updateOne({ tenant: tenantId, nid, sceneId }, { probability });
            await TenantControlGameRedisDao.removeOne(tenantId, nid, sceneId);
        }
        else {
            await TenantControlGame_mysql_dao_1.default.insertOne({
                tenant: tenantId,
                nid,
                sceneId,
                probability,
                sceneName: scene.name
            });
        }
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
    async removeGameBySceneInfo(tenantId, nid, sceneId, managerId) {
        await TenantControlGame_mysql_dao_1.default.delete({ tenant: tenantId, nid, sceneId });
        await TenantControlGameRedisDao.removeOne(tenantId, nid, sceneId);
        const game = (0, JsonConfig_1.get_games)(nid);
        const scenes = (0, JsonConfig_1.getScenes)(game.name).datas;
        const scene = scenes.find(s => s.id === sceneId);
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
    async findAwardKillByTenantId(tenantId) {
        let awardKill = await TenantControlAwardKillRedisDao.findOneByTenantId(tenantId);
        if (awardKill) {
            return awardKill;
        }
        awardKill = await TenantControlAwardKill_mysql_dao_1.default.findOne({ tenant: tenantId });
        if (!awardKill) {
            return null;
        }
        await TenantControlAwardKillRedisDao.saveOneByTenantId(tenantId, awardKill);
        return awardKill;
    }
    async findTotalBetKillByTenantId(tenantId) {
        let totalBetKill = await TenantControlTotalBetKillRedisDao.findOneByTenantId(tenantId);
        if (totalBetKill) {
            return totalBetKill;
        }
        totalBetKill = await TenantControlTotalBetKill_mysql_dao_1.default.findOne({ tenant: tenantId });
        if (!totalBetKill) {
            return null;
        }
        await TenantControlTotalBetKillRedisDao.saveOneByTenantId(tenantId, totalBetKill);
        return totalBetKill;
    }
    async findBetKillByTenantId(tenantId) {
        let betKill = await TenantControlBetKillRedisDao.findOneByTenantId(tenantId);
        if (betKill) {
            return betKill;
        }
        betKill = await TenantControlBetKill_mysql_dao_1.default.findOne({ tenant: tenantId });
        if (!betKill) {
            return null;
        }
        await TenantControlBetKillRedisDao.saveOneByTenantId(tenantId, betKill);
        return betKill;
    }
    async setAwardKill(tenantId, returnAwardRate) {
        const awardKill = await TenantControlAwardKill_mysql_dao_1.default.findOne({ tenant: tenantId });
        if (awardKill) {
            await TenantControlAwardKill_mysql_dao_1.default.updateOne({ id: awardKill.id }, { returnAwardRate });
            await TenantControlAwardKillRedisDao.removeOne(tenantId);
        }
        else {
            await TenantControlAwardKill_mysql_dao_1.default.insertOne({ tenant: tenantId, returnAwardRate });
        }
        return true;
    }
    async setBetKill(tenantId, bet) {
        const betKill = await TenantControlBetKill_mysql_dao_1.default.findOne({ tenant: tenantId });
        if (betKill) {
            await TenantControlBetKill_mysql_dao_1.default.updateOne({ id: betKill.id }, { bet });
            await TenantControlBetKillRedisDao.removeOne(tenantId);
        }
        else {
            await TenantControlBetKill_mysql_dao_1.default.insertOne({ tenant: tenantId, bet });
        }
        return true;
    }
    async setTotalBetKill(tenantId, totalBet) {
        const betKill = await TenantControlTotalBetKill_mysql_dao_1.default.findOne({ tenant: tenantId });
        if (betKill) {
            await TenantControlTotalBetKill_mysql_dao_1.default.updateOne({ id: betKill.id }, { totalBet });
            await TenantControlTotalBetKillRedisDao.removeOne(tenantId);
        }
        else {
            await TenantControlTotalBetKill_mysql_dao_1.default.insertOne({ tenant: tenantId, totalBet });
        }
        return true;
    }
    async removeBetKill(tenantId) {
        await TenantControlBetKill_mysql_dao_1.default.delete({ tenant: tenantId });
        await TenantControlBetKillRedisDao.removeOne(tenantId);
        return true;
    }
    async removeTotalBetKill(tenantId) {
        await TenantControlTotalBetKill_mysql_dao_1.default.delete({ tenant: tenantId });
        await TenantControlTotalBetKillRedisDao.removeOne(tenantId);
        return true;
    }
    async removeAwardKill(tenantId) {
        await TenantControlAwardKill_mysql_dao_1.default.delete({ tenant: tenantId });
        await TenantControlAwardKillRedisDao.removeOne(tenantId);
        return true;
    }
    async getBetKillList(page, limit) {
        return await TenantControlBetKill_mysql_dao_1.default.findListToLimit(page, limit);
    }
    async getAwardKillList(page, limit) {
        return await TenantControlAwardKill_mysql_dao_1.default.findListToLimit(page, limit);
    }
    async getTotalBetKillList(page, limit) {
        return await TenantControlTotalBetKill_mysql_dao_1.default.findListToLimit(page, limit);
    }
}
exports.TenantControlManager = TenantControlManager;
exports.default = new TenantControlManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50Q29udHJvbC5tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vZGFvTWFuYWdlci9UZW5hbnRDb250cm9sLm1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsZ0dBQXVGO0FBQ3ZGLDRGQUFtRjtBQUNuRixzR0FBNkY7QUFDN0Ysc0ZBQTZFO0FBQzdFLDRGQUE2RjtBQUM3Rix3RkFBd0Y7QUFDeEYsa0dBQWtHO0FBQ2xHLGtGQUFrRjtBQUVsRixzRkFBc0Y7QUFDdEYseURBQThEO0FBSzlELE1BQWEsb0JBQW9CO0lBSzdCLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFnQjtRQUNyQyxPQUFPLE1BQU0scUNBQXlCLENBQUMsUUFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQU9ELEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBZ0IsRUFBRSxHQUFXO1FBQzdDLE9BQU8scUNBQXlCLENBQUMsUUFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFRRCxLQUFLLENBQUMsbUJBQW1CLENBQUMsUUFBZ0IsRUFBRSxHQUFXLEVBQUUsT0FBZTtRQUVwRSxNQUFNLFdBQVcsR0FBRyxNQUFNLHlCQUF5QixDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFL0YsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO1lBQ3RCLE9BQU8sV0FBVyxDQUFDO1NBQ3RCO1FBR0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxxQ0FBeUIsQ0FBQyxPQUFPLENBQUMsRUFBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBRXpGLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRTtZQUNWLE1BQU0seUJBQXlCLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQy9GLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBQztTQUM3QjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFVRCxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxHQUFXLEVBQUUsT0FBZSxFQUFFLFdBQW1CLEVBQUUsU0FBaUI7UUFFM0csTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV0RSxNQUFNLElBQUksR0FBRyxJQUFBLHNCQUFTLEVBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsTUFBTSxNQUFNLEdBQUcsSUFBQSxzQkFBUyxFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDMUMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssT0FBTyxDQUFDLENBQUM7UUFHakQsSUFBSSxNQUFNLEVBQUU7WUFDUixNQUFNLHFDQUF5QixDQUFDLFNBQVMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBQyxFQUFFLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQztZQUUzRixNQUFNLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3JFO2FBQU07WUFFSCxNQUFNLHFDQUF5QixDQUFDLFNBQVMsQ0FBQztnQkFDdEMsTUFBTSxFQUFFLFFBQVE7Z0JBQ2hCLEdBQUc7Z0JBQ0gsT0FBTztnQkFDUCxXQUFXO2dCQUNYLFNBQVMsRUFBRSxLQUFLLENBQUMsSUFBSTthQUN4QixDQUFDLENBQUM7U0FDTjtRQUdELE1BQU0sZ0JBQWdCLENBQUMsU0FBUyxDQUFDO1lBQzdCLElBQUksRUFBRSxTQUFTLElBQUksRUFBRTtZQUNyQixJQUFJLEVBQUUsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCO1lBQzFELE1BQU0sRUFBRSxFQUFFO1lBQ1YsR0FBRyxFQUFFLEVBQUU7WUFDUCxHQUFHO1lBQ0gsSUFBSSxFQUFFO2dCQUNGLFFBQVE7Z0JBQ1IsT0FBTztnQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUs7Z0JBQ3BCLFNBQVMsRUFBRSxLQUFLLENBQUMsSUFBSTtnQkFDckIsaUJBQWlCLEVBQUUsTUFBTSxJQUFJLENBQUM7Z0JBQzlCLFdBQVc7YUFDZDtTQUNKLENBQUMsQ0FBQztRQUlILE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFTRCxLQUFLLENBQUMscUJBQXFCLENBQUMsUUFBZ0IsRUFBRSxHQUFXLEVBQUUsT0FBZSxFQUFFLFNBQWlCO1FBRXpGLE1BQU0scUNBQXlCLENBQUMsTUFBTSxDQUFDLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztRQUV6RSxNQUFNLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRWxFLE1BQU0sSUFBSSxHQUFHLElBQUEsc0JBQVMsRUFBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixNQUFNLE1BQU0sR0FBRyxJQUFBLHNCQUFTLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMxQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUdqRCxNQUFNLGdCQUFnQixDQUFDLFNBQVMsQ0FBQztZQUM3QixJQUFJLEVBQUUsU0FBUyxJQUFJLEVBQUU7WUFDckIsSUFBSSxFQUFFLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLHdCQUF3QjtZQUNqRSxNQUFNLEVBQUUsRUFBRTtZQUNWLEdBQUcsRUFBRSxFQUFFO1lBQ1AsR0FBRztZQUNILElBQUksRUFBRTtnQkFDRixRQUFRO2dCQUNSLE9BQU87Z0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUNwQixTQUFTLEVBQUUsS0FBSyxDQUFDLElBQUk7YUFDeEI7U0FDSixDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBTUQsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFFBQWdCO1FBRTFDLElBQUksU0FBUyxHQUFHLE1BQU0sOEJBQThCLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFakYsSUFBSSxTQUFTLEVBQUU7WUFDWCxPQUFPLFNBQVMsQ0FBQztTQUNwQjtRQUdELFNBQVMsR0FBRyxNQUFNLDBDQUE4QixDQUFDLE9BQU8sQ0FBQyxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBRTdFLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDWixPQUFPLElBQUksQ0FBQztTQUNmO1FBR0QsTUFBTSw4QkFBOEIsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFNUUsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQU1ELEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxRQUFnQjtRQUU3QyxJQUFJLFlBQVksR0FBRyxNQUFNLGlDQUFpQyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXZGLElBQUksWUFBWSxFQUFFO1lBQ2QsT0FBTyxZQUFZLENBQUM7U0FDdkI7UUFHRCxZQUFZLEdBQUcsTUFBTSw2Q0FBaUMsQ0FBQyxPQUFPLENBQUMsRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUVuRixJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2YsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUdELE1BQU0saUNBQWlDLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRWxGLE9BQU8sWUFBWSxDQUFDO0lBQ3hCLENBQUM7SUFNRCxLQUFLLENBQUMscUJBQXFCLENBQUMsUUFBZ0I7UUFFeEMsSUFBSSxPQUFPLEdBQUcsTUFBTSw0QkFBNEIsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU3RSxJQUFJLE9BQU8sRUFBRTtZQUNULE9BQU8sT0FBTyxDQUFDO1NBQ2xCO1FBR0QsT0FBTyxHQUFHLE1BQU0sd0NBQTRCLENBQUMsT0FBTyxDQUFDLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7UUFFekUsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNWLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFHRCxNQUFNLDRCQUE0QixDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV4RSxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBT0QsS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFnQixFQUFFLGVBQXVCO1FBRXhELE1BQU0sU0FBUyxHQUFHLE1BQU0sMENBQThCLENBQUMsT0FBTyxDQUFDLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7UUFHbkYsSUFBSSxTQUFTLEVBQUU7WUFDWCxNQUFNLDBDQUE4QixDQUFDLFNBQVMsQ0FBQyxFQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxlQUFlLEVBQUMsQ0FBQyxDQUFBO1lBQ3JGLE1BQU0sOEJBQThCLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1NBQzNEO2FBQU07WUFDSCxNQUFNLDBDQUE4QixDQUFDLFNBQVMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFDLENBQUMsQ0FBQztTQUN2RjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFPRCxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQWdCLEVBQUUsR0FBVztRQUUxQyxNQUFNLE9BQU8sR0FBRyxNQUFNLHdDQUE0QixDQUFDLE9BQU8sQ0FBQyxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBRy9FLElBQUksT0FBTyxFQUFFO1lBQ1QsTUFBTSx3Q0FBNEIsQ0FBQyxTQUFTLENBQUMsRUFBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLENBQUMsQ0FBQztZQUN0RSxNQUFNLDRCQUE0QixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMxRDthQUFNO1lBQ0gsTUFBTSx3Q0FBNEIsQ0FBQyxTQUFTLENBQUMsRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUM7U0FDekU7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBT0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxRQUFnQixFQUFFLFFBQWdCO1FBRXBELE1BQU0sT0FBTyxHQUFHLE1BQU0sNkNBQWlDLENBQUMsT0FBTyxDQUFDLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7UUFHcEYsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLDZDQUFpQyxDQUFDLFNBQVMsQ0FBQyxFQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDO1lBQ2hGLE1BQU0saUNBQWlDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQy9EO2FBQU07WUFDSCxNQUFNLDZDQUFpQyxDQUFDLFNBQVMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztTQUNuRjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFNRCxLQUFLLENBQUMsYUFBYSxDQUFDLFFBQWdCO1FBRWhDLE1BQU0sd0NBQTRCLENBQUMsTUFBTSxDQUFDLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7UUFHOUQsTUFBTSw0QkFBNEIsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQU1ELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFnQjtRQUVyQyxNQUFNLDZDQUFpQyxDQUFDLE1BQU0sQ0FBQyxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBR25FLE1BQU0saUNBQWlDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFNRCxLQUFLLENBQUMsZUFBZSxDQUFDLFFBQWdCO1FBRWxDLE1BQU0sMENBQThCLENBQUMsTUFBTSxDQUFDLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7UUFHaEUsTUFBTSw4QkFBOEIsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQU9ELEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBWSxFQUFFLEtBQWE7UUFDNUMsT0FBTyxNQUFNLHdDQUE0QixDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQU9ELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFZLEVBQUUsS0FBYTtRQUM5QyxPQUFPLE1BQU0sMENBQThCLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBT0QsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQVksRUFBRSxLQUFhO1FBQ2pELE9BQU8sTUFBTSw2Q0FBaUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hGLENBQUM7Q0FDSjtBQXpVRCxvREF5VUM7QUFFRCxrQkFBZSxJQUFJLG9CQUFvQixFQUFFLENBQUMifQ==