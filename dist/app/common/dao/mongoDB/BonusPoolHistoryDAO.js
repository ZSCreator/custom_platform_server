"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonusPoolsHistoryDao = void 0;
const mongoManager = require("./lib/mongoManager");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const bonusPoolsHistoryDao = mongoManager.bonus_pools_history;
class BonusPoolsHistoryDao {
    static async create(tableInfo) {
        try {
            tableInfo.createDateTime = Date.now();
            tableInfo.updateDateTime = Date.now();
            await bonusPoolsHistoryDao.create(tableInfo);
        }
        catch (e) {
            logger.error(`查询最近奖池记录出错:`, e.stack);
            return [];
        }
    }
    static async findList(params = {}) {
        try {
            return;
        }
        catch (e) {
            logger.error(`查询所有奖池记录信息出错:`, e.stack);
            return [];
        }
    }
}
exports.BonusPoolsHistoryDao = BonusPoolsHistoryDao;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm9udXNQb29sSGlzdG9yeURBTy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvQm9udXNQb29sSGlzdG9yeURBTy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtREFBb0Q7QUFDcEQsK0NBQXlDO0FBRXpDLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbkQsTUFBTSxvQkFBb0IsR0FBRyxZQUFZLENBQUMsbUJBQW1CLENBQUM7QUFHOUQsTUFBYSxvQkFBb0I7SUFFN0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUztRQUN6QixJQUFJO1lBQ0EsU0FBUyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdEMsU0FBUyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdEMsTUFBTSxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDaEQ7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQU1ELE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxFQUFFO1FBQzdCLElBQUk7WUFDQSxPQUFPO1NBQ1Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QyxPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztDQUNKO0FBekJELG9EQXlCQyJ9