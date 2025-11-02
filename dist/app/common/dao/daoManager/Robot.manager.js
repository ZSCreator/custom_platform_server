"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotManager = void 0;
const Robot_entity_1 = require("../mysql/entity/Robot.entity");
const Robot_entity_2 = require("../redis/entity/Robot.entity");
const Robot_mysql_dao_1 = require("../mysql/Robot.mysql.dao");
const Robot_redis_dao_1 = require("../redis/Robot.redis.dao");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class RobotManager {
    async findList(parameter) {
        try {
            const list = await Robot_mysql_dao_1.default.findList(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter, onlyMysql = false) {
        try {
            if (!onlyMysql) {
                const player = await Robot_redis_dao_1.default.findOne(parameter);
                if (player) {
                    return player;
                }
                const playerOnMysql = await Robot_mysql_dao_1.default.findOne(parameter);
                if (playerOnMysql) {
                    const sec = await Robot_redis_dao_1.default.insertOne(new Robot_entity_2.RobotInRedis(playerOnMysql));
                }
                return playerOnMysql;
            }
            const player = await Robot_mysql_dao_1.default.findOne(parameter);
            return player;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            await Robot_mysql_dao_1.default.insertOne(parameter);
            return await Robot_redis_dao_1.default.insertOne(new Robot_entity_2.RobotInRedis(parameter));
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(Robot_entity_1.Robot)
                .update(parameter, partialEntity);
            const isSuccess = !!affected;
            if (isSuccess) {
                await Robot_redis_dao_1.default.updateOne(parameter, new Robot_entity_2.RobotInRedis(partialEntity));
            }
            return true;
        }
        catch (e) {
            console.warn(`updateOne|updateOne|updateOne|更新金币失败`);
            return false;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(Robot_entity_1.Robot)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitForManager(page, limit, selectFile) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection()
                .getRepository(Robot_entity_1.Robot)
                .createQueryBuilder("Robot")
                .orderBy("Robot.id", "DESC")
                .select(selectFile)
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitInUids(selectFile, uidList) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(Robot_entity_1.Robot)
                .createQueryBuilder("Robot")
                .where("Robot.uid = :uid ", uidList)
                .select(selectFile)
                .getMany();
            return list;
        }
        catch (e) {
            return false;
        }
    }
}
exports.RobotManager = RobotManager;
exports.default = new RobotManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9ib3QubWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL2Rhb01hbmFnZXIvUm9ib3QubWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFBcUQ7QUFDckQsK0RBQTREO0FBQzVELDhEQUFxRDtBQUNyRCw4REFBcUQ7QUFDckQsc0VBQStEO0FBSS9ELE1BQWEsWUFBWTtJQUVyQixLQUFLLENBQUMsUUFBUSxDQUFDLFNBQTJCO1FBQ3RDLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLHlCQUFhLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUEyQixFQUFFLFlBQXFCLEtBQUs7UUFDakUsSUFBSTtZQUVBLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ1osTUFBTSxNQUFNLEdBQUcsTUFBTSx5QkFBYSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFdEQsSUFBSSxNQUFNLEVBQUU7b0JBQ1IsT0FBTyxNQUFNLENBQUM7aUJBQ2pCO2dCQUVELE1BQU0sYUFBYSxHQUFHLE1BQU0seUJBQWEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRTdELElBQUksYUFBYSxFQUFFO29CQUVmLE1BQU0sR0FBRyxHQUFHLE1BQU0seUJBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7aUJBQzlFO2dCQUVELE9BQU8sYUFBYSxDQUFDO2FBQ3hCO1lBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSx5QkFBYSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV0RCxPQUFPLE1BQU0sQ0FBQztTQUNq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