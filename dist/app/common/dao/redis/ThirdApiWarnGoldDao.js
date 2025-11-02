"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWarnGoldCfg = exports.findWarnGoldCfg = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const redisManager = require("./lib/redisManager");
async function findWarnGoldCfg() {
    try {
        const cfg = await redisManager.getFromHashTable(RedisDict_1.DB1.warnGoldConfig, "config");
        return cfg ? cfg : [];
    }
    catch (e) {
        logger.error(`第三方接口 | 查询预警金币配置项出错: ${e.stack}`);
        return [];
    }
}
exports.findWarnGoldCfg = findWarnGoldCfg;
async function updateWarnGoldCfg(data) {
    try {
        await redisManager.storeFieldIntoHashTable(RedisDict_1.DB1.warnGoldConfig, "config", data);
        return true;
    }
    catch (e) {
        logger.error(`第三方接口 | 修改预警金币配置项出错: ${e.stack}`);
        return false;
    }
}
exports.updateWarnGoldCfg = updateWarnGoldCfg;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhpcmRBcGlXYXJuR29sZERhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL1RoaXJkQXBpV2FybkdvbGREYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQStDO0FBQy9DLCtDQUF5QztBQUN6QyxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ25ELG1EQUFtRDtBQUU1QyxLQUFLLFVBQVUsZUFBZTtJQUNqQyxJQUFJO1FBQ0EsTUFBTSxHQUFHLEdBQUcsTUFBTSxZQUFZLENBQUMsZ0JBQWdCLENBQUMsZUFBRyxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUU3RSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7S0FDekI7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO1FBQy9DLE9BQU8sRUFBRSxDQUFDO0tBQ2I7QUFDTCxDQUFDO0FBVEQsMENBU0M7QUFFTSxLQUFLLFVBQVUsaUJBQWlCLENBQUMsSUFBSTtJQUN4QyxJQUFJO1FBQ0EsTUFBTSxZQUFZLENBQUMsdUJBQXVCLENBQUMsZUFBRyxDQUFDLGNBQWMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFL0UsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFaEQsT0FBTyxLQUFLLENBQUM7S0FDaEI7QUFDTCxDQUFDO0FBVkQsOENBVUMifQ==