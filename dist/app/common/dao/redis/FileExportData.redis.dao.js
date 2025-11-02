"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileExportDataRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class FileExportDataRedisDao {
    async findOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            const str = await conn.get(`${RedisDict_1.DB2.FileExportData}`);
            return !!str ? JSON.parse(str) : null;
        }
        catch (e) {
            console.error(`Redis | DB2 | 后台导文件: ${e.stack}`);
            return null;
        }
    }
    async insertOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            const time = Date.now();
            await conn.set(RedisDict_1.DB2.FileExportData, JSON.stringify(time));
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB2 | 后台导文件: ${e.stack}`);
            return null;
        }
    }
    async delete(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
        try {
            await conn.del(RedisDict_1.DB2.FileExportData);
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB2 | 后台导文件: ${e.stack}`);
            return null;
        }
    }
}
exports.FileExportDataRedisDao = FileExportDataRedisDao;
exports.default = new FileExportDataRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsZUV4cG9ydERhdGEucmVkaXMuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvRmlsZUV4cG9ydERhdGEucmVkaXMuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUErQztBQUMvQyxvREFBOEM7QUFDOUMsNkRBQWtEO0FBRWxELE1BQWEsc0JBQXNCO0lBRy9CLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBYTtRQUN2QixNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdEUsSUFBSTtZQUNBLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1lBRXBELE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1NBQ3pDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUNqRCxPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUlELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBYTtRQUN6QixNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdEUsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN4QixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBRyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekQsT0FBTyxDQUFDLENBQUM7U0FDWjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDakQsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQWE7UUFDdEIsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RFLElBQUk7WUFDQSxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ2pELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0NBRUo7QUF4Q0Qsd0RBd0NDO0FBRUQsa0JBQWUsSUFBSSxzQkFBc0IsRUFBRSxDQUFDIn0=