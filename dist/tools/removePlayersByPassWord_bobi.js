'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Utils = require("../app/utils/index");
const DatabaseService = require("../app/services/databaseService");
const UserManager = require("../app/dao/domainManager/hall/userManager");
const RedisManager = require("../app/dao/dbManager/redisManager");
const dbMongo = require('../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function test() {
    let lockRef;
    try {
        const users = await UserManager.findUserList({}, 'uid passWord');
        let cnn = 0;
        console.log("更新玩家总人數", users.length);
        for (let m of users) {
            if (m.passWord.length < 16) {
                m.passWord = Utils.signature(m.passWord, false, false);
                await UserManager.updateOneUser(m, ['passWord'], true);
            }
            console.log("更新人数", cnn++);
        }
        console.log('执行完成');
    }
    catch (error) {
        lockRef && await RedisManager.unlock(lockRef);
        console.log('执行完成', error);
    }
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlUGxheWVyc0J5UGFzc1dvcmRfYm9iaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rvb2xzL3JlbW92ZVBsYXllcnNCeVBhc3NXb3JkX2JvYmkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUliLDRDQUE2QztBQUM3QyxtRUFBb0U7QUFFcEUseUVBQTBFO0FBRTFFLGtFQUFtRTtBQUluRSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUVuRCxlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQ2hDLEtBQUssRUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDL0IsTUFBTSxFQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNuQyxDQUFDLENBQUM7QUFHSCxLQUFLLFVBQVUsSUFBSTtJQUNmLElBQUksT0FBTyxDQUFDO0lBQ1osSUFBSTtRQUNELE1BQU0sS0FBSyxHQUFHLE1BQU0sV0FBVyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUMsY0FBYyxDQUFDLENBQUM7UUFDaEUsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BDLEtBQUksSUFBSSxDQUFDLElBQUksS0FBSyxFQUFDO1lBQ2QsSUFBRyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUM7Z0JBQ3RCLENBQUMsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFDLEtBQUssRUFBQyxLQUFLLENBQUMsQ0FBQztnQkFDckQsTUFBTSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBQyxDQUFDLFVBQVUsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3hEO1lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUM3QjtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDdEI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE9BQU8sSUFBSSxNQUFNLFlBQVksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDOUI7QUFDTCxDQUFDO0FBRUQsSUFBSSxFQUFFLENBQUMifQ==