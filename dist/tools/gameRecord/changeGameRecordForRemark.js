'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
const Utils = require('../../app/utils/index');
const game_record = MongoManager.game_record;
const player_info = MongoManager.player_info;
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function test() {
    try {
        const record = await game_record.find({ nid: { $in: ['t1', 't2'] } }).distinct('uid');
        console.warn("开始更新", record);
        for (let item of record) {
            console.warn("更新uid", item);
            const player = await player_info.findOne({ uid: item }, 'superior groupRemark group_id thirdUid');
            const update = { superior: player.superior, groupRemark: player.groupRemark, group_id: player.group_id, thirdUid: player.thirdUid };
            await game_record.updateMany({ uid: item, nid: { $in: ['t1', 't2'] } }, { $set: update });
        }
        console.warn("更新完成");
    }
    catch (error) {
        console.log('更新出错:', error);
    }
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlR2FtZVJlY29yZEZvclJlbWFyay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL2dhbWVSZWNvcmQvY2hhbmdlR2FtZVJlY29yZEZvclJlbWFyay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBR2Isc0VBQXVFO0FBQ3ZFLDhFQUErRTtBQUMvRSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUN0RCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUMvQyxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsV0FBVyxDQUFDO0FBQzdDLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUM7QUFHN0MsZUFBZSxDQUFDLGNBQWMsQ0FBQztJQUMzQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixLQUFLLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0lBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7Q0FDbEMsQ0FBQyxDQUFDO0FBRUgsS0FBSyxVQUFVLElBQUk7SUFDZixJQUFJO1FBQ0EsTUFBTSxNQUFNLEdBQUcsTUFBTSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFDLEVBQUMsR0FBRyxFQUFDLENBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxFQUFDLEVBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvRSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUM1QixLQUFJLElBQUksSUFBSSxJQUFJLE1BQU0sRUFBQztZQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQTtZQUMzQixNQUFNLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBQyxHQUFHLEVBQUMsSUFBSSxFQUFDLEVBQUMsd0NBQXdDLENBQUMsQ0FBQztZQUM5RixNQUFNLE1BQU0sR0FBRyxFQUFFLFFBQVEsRUFBQyxNQUFNLENBQUMsUUFBUSxFQUFHLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFJLFFBQVEsRUFBRyxNQUFNLENBQUMsUUFBUSxFQUFHLFFBQVEsRUFBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUE7WUFDeEksTUFBTSxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUMsR0FBRyxFQUFDLElBQUksRUFBQyxHQUFHLEVBQUMsRUFBQyxHQUFHLEVBQUMsQ0FBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUMsRUFBQyxFQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7U0FDakY7UUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3hCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQTtLQUM5QjtBQUNMLENBQUM7QUFHRCxJQUFJLEVBQUUsQ0FBQyJ9