"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLoginInfo = exports.increase_to_db = void 0;
const BaseRedisManager_1 = require("../../common/dao/redis/lib/BaseRedisManager");
const moment = require("moment");
const Game_manager_1 = require("../../common/dao/daoManager/Game.manager");
const Scene_manager_1 = require("../..//common/dao/daoManager/Scene.manager");
const DBCfg_enum_1 = require("../../common/dao/redis/config/DBCfg.enum");
async function increase_to_db(nid, sceneId, uid) {
    const createDate = moment().format("YYYY-MM-DD");
    const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
    let ret = await conn.sadd(`GameLoginStatistics:${createDate}:${nid}:${sceneId}`, `${uid}`);
    conn.expire(`GameLoginStatistics:${createDate}:${nid}:${sceneId}`, 2 * 24 * 60 * 60);
}
exports.increase_to_db = increase_to_db;
;
async function getAllLoginInfo() {
    const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
    const nidList = await Game_manager_1.default.findList({});
    const sceneList = await Scene_manager_1.default.findList({});
    let data1 = [];
    for (let day = 0; day < 30; day++) {
        let today = new Date();
        let targetday_milliseconds = today.getTime() - 1000 * 60 * 60 * 24 * day;
        const createDate = moment(targetday_milliseconds).format("YYYY-MM-DD");
        data1.push(createDate);
    }
    let resultArr = [];
    for (const day of data1) {
        for (const sceneInfo of sceneList) {
            let num = await conn.scard(`GameLoginStatistics:${day}:${sceneInfo.nid}:${sceneInfo.sceneId}`);
            let game_name = nidList.find(c => c.nid == sceneInfo.nid).zname;
            let scene_name = sceneInfo.name;
            resultArr.push({ nid: sceneInfo.nid, sceneId: sceneInfo.sceneId, game_name, scene_name, day, num });
        }
    }
    return resultArr;
}
exports.getAllLoginInfo = getAllLoginInfo;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZUxvZ2luU3RhdGlzdGljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9oYWxsL0dhbWVMb2dpblN0YXRpc3RpY3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0Esa0ZBQXVFO0FBQ3ZFLGlDQUFrQztBQUNsQywyRUFBc0U7QUFDdEUsOEVBQXlFO0FBQ3pFLHlFQUFtRTtBQUU1RCxLQUFLLFVBQVUsY0FBYyxDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsR0FBVztJQUMxRSxNQUFNLFVBQVUsR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDakQsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3RFLElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsVUFBVSxJQUFJLEdBQUcsSUFBSSxPQUFPLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDM0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsVUFBVSxJQUFJLEdBQUcsSUFBSSxPQUFPLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtBQUN4RixDQUFDO0FBTEQsd0NBS0M7QUFBQSxDQUFDO0FBS0ssS0FBSyxVQUFVLGVBQWU7SUFDakMsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3RFLE1BQU0sT0FBTyxHQUFHLE1BQU0sc0JBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEQsTUFBTSxTQUFTLEdBQUcsTUFBTSx1QkFBZSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNyRCxJQUFJLEtBQUssR0FBYSxFQUFFLENBQUM7SUFDekIsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUMvQixJQUFJLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3ZCLElBQUksc0JBQXNCLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFDekUsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3ZFLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDMUI7SUFDRCxJQUFJLFNBQVMsR0FBd0csRUFBRSxDQUFDO0lBQ3hILEtBQUssTUFBTSxHQUFHLElBQUksS0FBSyxFQUFFO1FBQ3JCLEtBQUssTUFBTSxTQUFTLElBQUksU0FBUyxFQUFFO1lBQy9CLElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLFNBQVMsQ0FBQyxHQUFHLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDL0YsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUNoRSxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQ2hDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZHO0tBQ0o7SUFDRCxPQUFPLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBckJELDBDQXFCQztBQUFBLENBQUMifQ==