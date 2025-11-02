"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUUID = exports.BonusPoolsDao = void 0;
const mongoManager = require("./lib/mongoManager");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const bonusPoolsDao = mongoManager.bonus_pools;
class BonusPoolsDao {
    static async findLastOneByParams(params) {
        try {
            const recordList = await bonusPoolsDao.find(params, 'lastUpdateUUID')
                .sort({ updateDateTime: -1 })
                .limit(1)
                .exec();
            return recordList;
        }
        catch (e) {
            logger.error(`查询最近奖池记录出错:`, e.stack);
            return [];
        }
    }
    static async updateLastOneByParams(params, where) {
        try {
            if (Object.keys(params).length === 0) {
                logger.error(`修改最近奖池记录出错，传入参数不应为空。修改内容:${params},修改条件:${where}`);
                return;
            }
            await bonusPoolsDao.updateOne(where, params);
        }
        catch (e) {
            logger.error(`修改最近奖池记录出错:`, e.stack);
        }
    }
    static async findList(params = {}) {
        try {
            return await bonusPoolsDao
                .find(params, ['_id', 'nid', 'sceneId', 'gameName', 'sceneName', 'bonus_initAmount', 'bonus_minAmount',
                'bonus_minParameter', 'bonus_maxAmount', 'bonus_maxParameter', 'bonus_maxAmountInStore',
                'bonus_maxAmountInStoreSwitch', 'bonus_personalReferenceValue', 'bonus_minBonusPoolCorrectedValue', 'bonus_maxBonusPoolCorrectedValue'])
                .sort({ nid: 1, sceneId: 1 });
        }
        catch (e) {
            logger.error(`查询所有奖池信息出错:`, e.stack);
            return [];
        }
    }
    static async updateById(params, _id) {
        try {
            if (Object.keys(params).length === 0) {
                logger.error(`修改配置信息出错，传入参数不应为空。修改内容:${params},修改条件:${_id}`);
                return;
            }
            await bonusPoolsDao.updateOne({ _id }, params);
        }
        catch (e) {
            logger.error(`修改奖池配置信息出错:`, e.stack);
        }
    }
}
exports.BonusPoolsDao = BonusPoolsDao;
const getUUID = () => signMD5(`${randomString()}${Date.now()}`);
exports.getUUID = getUUID;
const signMD5 = (str) => require('crypto').createHash('md5').update(str).digest('hex');
const randomString = () => Math.random().toString(36).substr(2, 8);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm9udXNQb29sc0Rhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvQm9udXNQb29sc0Rhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtREFBb0Q7QUFDcEQsK0NBQXlDO0FBRXpDLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbkQsTUFBTSxhQUFhLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQztBQUUvQyxNQUFhLGFBQWE7SUFFeEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNO1FBQ3JDLElBQUk7WUFDRixNQUFNLFVBQVUsR0FBRyxNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDO2lCQUNsRSxJQUFJLENBQUMsRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztpQkFDNUIsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDUixJQUFJLEVBQUUsQ0FBQztZQUNWLE9BQU8sVUFBVSxDQUFDO1NBQ25CO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckMsT0FBTyxFQUFFLENBQUM7U0FDWDtJQUNILENBQUM7SUFPRCxNQUFNLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLE1BQWMsRUFBRSxLQUFhO1FBQzlELElBQUk7WUFDRixJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDcEMsTUFBTSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsTUFBTSxTQUFTLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQ2pFLE9BQU87YUFDUjtZQUNELE1BQU0sYUFBYSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDOUM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN0QztJQUNILENBQUM7SUFNRCxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsRUFBRTtRQUMvQixJQUFJO1lBQ0YsT0FBTyxNQUFNLGFBQWE7aUJBQ3ZCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFFLGlCQUFpQjtnQkFDcEcsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUsb0JBQW9CLEVBQUUsd0JBQXdCO2dCQUN2Riw4QkFBOEIsRUFBRSw4QkFBOEIsRUFBRSxrQ0FBa0MsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO2lCQUN6SSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ2pDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckMsT0FBTyxFQUFFLENBQUM7U0FDWDtJQUNILENBQUM7SUFPRCxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFjLEVBQUUsR0FBVztRQUNqRCxJQUFJO1lBQ0YsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3BDLE1BQU0sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUM3RCxPQUFPO2FBQ1I7WUFDRCxNQUFNLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNoRDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3RDO0lBQ0gsQ0FBQztDQUNGO0FBakVELHNDQWlFQztBQU1NLE1BQU0sT0FBTyxHQUFHLEdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFBbEUsUUFBQSxPQUFPLFdBQTJEO0FBTy9FLE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxFQUFVLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFLL0YsTUFBTSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDIn0=