"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const robotServerController = require("../../app/services/robotService/overallController/robotServerController");
const hallConst = require("../../app/consts/hallConst");
const playerManager = require("../../app/dao/domainManager/hall/playerManager");
const MongoManager = require("../../app/dao/dbManager/mongoManager");
const JsonMgr = require("../../config/data/JsonMgr");
const Utils = require("../../app/utils/index");
const dbMongo = require('../../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function changeRobotHead() {
    try {
        await JsonMgr.init();
        await robotServerController.inventoryRobots();
        const allRobotPlayer = await playerManager.findPlayerList({ isRobot: hallConst.PLAYER_ROLE.ROBOT }, player => player.isRobot === hallConst.PLAYER_ROLE.ROBOT, 'uid');
        let i = 1;
        for (let p of allRobotPlayer) {
            let head = Utils.getHead();
            console.log(`获取随机头像 => ${p.uid} ${head}`);
            let { player, lock } = await playerManager.getPlayer({ uid: p.uid }, true);
            player.headurl = head;
            await playerManager.updateOnePlayer(player, ['headurl'], lock);
            await MongoManager.getDao('player_info').findOneAndUpdate({ uid: p.uid }, { headurl: head }, {
                new: true,
                upsert: false,
                fields: '-_id -__v'
            });
            console.log(`保存数据成功 => ${i} of ${allRobotPlayer.length} => ${p.uid}`);
            i++;
        }
        console.error('修改完成', allRobotPlayer.length);
    }
    catch (e) {
        console.error(e);
    }
}
changeRobotHead();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlUm9ib3RIZWFkSW1nTG9jYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9yb2JvdC9jaGFuZ2VSb2JvdEhlYWRJbWdMb2NhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBS2Isc0VBQTZFO0FBQzdFLGlIQUFrSDtBQUNsSCx3REFBcUU7QUFDckUsZ0ZBQXlGO0FBQ3pGLHFFQUErRTtBQUMvRSxxREFBb0U7QUFDcEUsK0NBQWdFO0FBQ2hFLE1BQU8sT0FBTyxHQUFpQixPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUVyRSxlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLEtBQUssRUFBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDOUIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNsQyxDQUFDLENBQUM7QUFFSCxLQUFLLFVBQVUsZUFBZTtJQUMxQixJQUFJO1FBQ0EsTUFBTSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDckIsTUFBTSxxQkFBcUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUU5QyxNQUFNLGNBQWMsR0FBRyxNQUFNLGFBQWEsQ0FBQyxjQUFjLENBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFDOUYsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLEtBQUssSUFBSSxDQUFDLElBQUksY0FBYyxFQUFFO1lBQzFCLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUV2RSxNQUFNLENBQUMsT0FBTyxHQUFLLElBQUksQ0FBQztZQUU1QixNQUFNLGFBQWEsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFHL0QsTUFBTSxZQUFZLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDekYsR0FBRyxFQUFLLElBQUk7Z0JBQ1osTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFdBQVc7YUFDdEIsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTyxjQUFjLENBQUMsTUFBTSxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3RFLENBQUMsRUFBRSxDQUFDO1NBQ1A7UUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDaEQ7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDbkI7QUFDTCxDQUFDO0FBRUQsZUFBZSxFQUFFLENBQUMifQ==