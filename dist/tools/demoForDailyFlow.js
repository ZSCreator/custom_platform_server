"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../app/common/dao/mysql/lib/RDSClient");
const OnlinePlayer_redis_dao_1 = require("../app/common/dao/redis/OnlinePlayer.redis.dao");
RDSClient_1.RDSClient.demoInit();
async function clean() {
    console.warn(`开始执行`);
    const onlinePlayers = await OnlinePlayer_redis_dao_1.default.findList({});
    const onlineUids = onlinePlayers.map(m => m.uid);
    console.warn(`执行完成`);
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVtb0ZvckRhaWx5Rmxvdy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rvb2xzL2RlbW9Gb3JEYWlseUZsb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxxRUFBa0U7QUFDbEUsMkZBQWtGO0FBR2xGLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDckIsS0FBSyxVQUFVLEtBQUs7SUFDaEIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVyQixNQUFNLGFBQWEsR0FBRyxNQUFNLGdDQUFvQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5RCxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQSxFQUFFLENBQUEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBSS9DLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2YsT0FBTztBQUNYLENBQUM7QUFDRCxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDIn0=