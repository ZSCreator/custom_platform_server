'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const dbMongo = require('../../config/db/mongo.json');
const DatabaseService = require("../../app/services/databaseService");
const InfiniteAgentManager = require("../../app/dao/domainManager/hall/infiniteAgentManager");
const mongoManager = require("../../app/dao/dbManager/mongoManager");
const PlayerOtherField = mongoManager.getDao("player_other_field");
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function test() {
    console.log("开始执行");
    try {
        const records = await PlayerOtherField.find({ version: 'hsyl' });
        if (records.length != 0) {
            for (let item of records) {
                await PlayerOtherField.updateOne({ uid: item.uid }, { $set: { version: 'hxqp' } });
                await InfiniteAgentManager.updateAgent({ uid: item.uid }, { $set: { gameDownUrl: '' } });
                console.log('uid:', item.uid);
            }
        }
        console.log("执行完成");
        return true;
    }
    catch (error) {
        console.log("执行错误");
    }
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnRWZXJzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvYWdlbnQvYWdlbnRWZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUV0RCxzRUFBdUU7QUFHdkUsOEZBQStGO0FBQy9GLHFFQUFzRTtBQUN0RSxNQUFNLGdCQUFnQixHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUVuRSxlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQ2hDLEtBQUssRUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDL0IsTUFBTSxFQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNuQyxDQUFDLENBQUM7QUFFSCxLQUFLLFVBQVUsSUFBSTtJQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEIsSUFBSTtRQUNBLE1BQU0sT0FBTyxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUMsT0FBTyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFDOUQsSUFBRyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQztZQUNuQixLQUFJLElBQUksSUFBSSxJQUFJLE9BQU8sRUFBQztnQkFDcEIsTUFBTSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsRUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBQyxFQUFDLEVBQUMsSUFBSSxFQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFDLENBQUMsQ0FBQztnQkFDN0UsTUFBTSxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsRUFBQyxHQUFHLEVBQUcsSUFBSSxDQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsSUFBSSxFQUFDLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQztnQkFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2pDO1NBQ0o7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ25CLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDdEI7QUFDTCxDQUFDO0FBRUQsSUFBSSxFQUFFLENBQUMifQ==