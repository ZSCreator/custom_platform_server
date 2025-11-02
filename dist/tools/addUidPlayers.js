"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../app/services/databaseService");
const commonUtil_1 = require("../app/utils/lottery/commonUtil");
const UserInfo_1 = require("../app/common/pojo/entity/UserInfo");
const mongoManager = require("../app/common/dao/mongoDB/lib/mongoManager");
const GetDataService = require("../app/services/hall/getDataService");
const LoginHelperService = require("../app/services/hall/loginHelperService");
const InfiniteAgentService = require("../app/services/agent/infiniteAgentService");
const buildAgentRelationController = require("../app/services/agent/buildAgentRelationController");
const dbMongo = require('../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
createUidPlayer('00000001', '凌哥', 'hxqp').then(res => process.exit());
async function createUidPlayer(uid, mark, serverVersion) {
    const user = await createUser(uid);
    const player = await createPlayer(user, serverVersion);
    console.log(`玩家 ${player.uid} 创建成功`);
}
async function openAgency(uid, mark) {
    await InfiniteAgentService.findAgentInfo({ uid });
    await buildAgentRelationController.openGroupAgent(uid, { remark: mark });
}
async function createPlayer(user, serverVersion, inviteCode = '') {
    const systemConfig = await GetDataService.getSystemConfig();
    const { player } = await LoginHelperService.findOrCreatePlayer(user.uid, '', 0, inviteCode, '', serverVersion, systemConfig, false);
    await InfiniteAgentService.getPromoteInfo(user.uid, systemConfig);
    return player;
}
async function createUser(uid, inviteCode = '') {
    const userModel = mongoManager.user_info;
    let createArgs = { uid, inviteCode };
    createArgs.guestid = commonUtil_1.generateID();
    const user = new UserInfo_1.UserInfo(createArgs);
    await userModel.create(user);
    return user;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkVWlkUGxheWVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rvb2xzL2FkZFVpZFBsYXllcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxtRUFBb0U7QUFDcEUsZ0VBQTZEO0FBQzdELGlFQUE0RDtBQUM1RCwyRUFBMkU7QUFDM0Usc0VBQXNFO0FBQ3RFLDhFQUE4RTtBQUM5RSxtRkFBbUY7QUFDbkYsbUdBQW1HO0FBQ25HLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBRW5ELGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ2xDLENBQUMsQ0FBQztBQUdILGVBQWUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBUXRFLEtBQUssVUFBVSxlQUFlLENBQUMsR0FBVyxFQUFFLElBQVksRUFBRSxhQUFxQjtJQUUzRSxNQUFNLElBQUksR0FBRyxNQUFNLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUduQyxNQUFNLE1BQU0sR0FBRyxNQUFNLFlBQVksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFLdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFBO0FBQ3hDLENBQUM7QUFFRCxLQUFLLFVBQVUsVUFBVSxDQUFDLEdBQUcsRUFBRSxJQUFJO0lBQy9CLE1BQU0sb0JBQW9CLENBQUMsYUFBYSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNsRCxNQUFNLDRCQUE0QixDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM3RSxDQUFDO0FBR0QsS0FBSyxVQUFVLFlBQVksQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFVBQVUsR0FBRyxFQUFFO0lBQzVELE1BQU0sWUFBWSxHQUFHLE1BQU0sY0FBYyxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzVELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDMUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBR3hELE1BQU0sb0JBQW9CLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFFbEUsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQUdELEtBQUssVUFBVSxVQUFVLENBQUMsR0FBRyxFQUFFLFVBQVUsR0FBRyxFQUFFO0lBRTFDLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUM7SUFFekMsSUFBSSxVQUFVLEdBQVEsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLENBQUM7SUFHMUMsVUFBVSxDQUFDLE9BQU8sR0FBRyx1QkFBVSxFQUFFLENBQUM7SUFFbEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxtQkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3RDLE1BQU0sU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUU3QixPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDIn0=