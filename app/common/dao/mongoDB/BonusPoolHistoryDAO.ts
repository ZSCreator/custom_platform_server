import mongoManager = require('./lib/mongoManager');
import { getLogger } from 'pinus-logger';

const logger = getLogger('server_out', __filename);
const bonusPoolsHistoryDao = mongoManager.bonus_pools_history;


export class BonusPoolsHistoryDao {

    static async create(tableInfo) {
        try {
            tableInfo.createDateTime = Date.now();
            tableInfo.updateDateTime = Date.now();
            await bonusPoolsHistoryDao.create(tableInfo);
        } catch (e) {
            logger.error(`查询最近奖池记录出错:`, e.stack);
            return [];
        }
    }

    /**
     *
     * @param params
     */
    static async findList(params = {}) {
        try {
            return;
        } catch (e) {
            logger.error(`查询所有奖池记录信息出错:`, e.stack);
            return [];
        }
    }
}
