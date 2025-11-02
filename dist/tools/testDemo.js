"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../app/common/dao/mysql/lib/RDSClient");
const databaseService_1 = require("../app/services/databaseService");
const PlayersInRoom_redis_dao_1 = require("../app/common/dao/redis/PlayersInRoom.redis.dao");
async function clean() {
    await RDSClient_1.RDSClient.demoInit();
    await databaseService_1.initRedisConnection(null);
    const ss = await PlayersInRoom_redis_dao_1.default;
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdERlbW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90b29scy90ZXN0RGVtby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFFQUFnRTtBQUNoRSxxRUFBb0U7QUFDcEUsNkZBQStFO0FBRS9FLEtBQUssVUFBVSxLQUFLO0lBSWhCLE1BQU0scUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUkzQixNQUFNLHFDQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWhDLE1BQU0sRUFBRSxHQUFHLE1BQU0saUNBQWdCLENBQUM7SUFDbEMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2YsT0FBTztBQUNYLENBQUM7QUFDRCxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDIn0=