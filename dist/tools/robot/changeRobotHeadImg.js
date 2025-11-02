"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const robotServerController = require("../../app/services/robotService/overallController/robotServerController");
const playerManager = require("../../app/common/dao/PlayerInfoManager");
const JsonMgr = require("../../config/data/JsonMgr");
const dbMongo = require('../../config/db/mongo.json');
const robotNicknameService = require("../../app/services/robotService/overallController/robotNicknameService");
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
        const allRobotPlayer = await playerManager.findPlayerList({}, null, 'uid isRobot nickname headurl');
        let i = 1;
        for (let pl of allRobotPlayer) {
            try {
                let { player, lock } = await playerManager.getPlayer({ uid: pl.uid }, true);
                if (player) {
                    player.nickname = robotNicknameService.getRandomNickname();
                    console.log(`修改第 ${i} of ${allRobotPlayer.length} 个 ${player.nickname}`);
                    await playerManager.updateOnePlayer(player, ['nickname'], lock);
                }
            }
            catch (error) {
                console.log(`error:${error}`);
            }
            i++;
        }
        console.log('修改完成', allRobotPlayer.length);
    }
    catch (e) {
        console.log(e);
    }
}
changeRobotHead();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlUm9ib3RIZWFkSW1nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvcm9ib3QvY2hhbmdlUm9ib3RIZWFkSW1nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYixzRUFBdUU7QUFDdkUsaUhBQWtIO0FBRWxILHdFQUF5RTtBQUN6RSxxREFBc0Q7QUFDdEQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFFdEQsK0dBQStHO0FBRS9HLGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ2xDLENBQUMsQ0FBQztBQUVILEtBQUssVUFBVSxlQUFlO0lBQzFCLElBQUk7UUFDQSxNQUFNLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyQixNQUFNLHFCQUFxQixDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzlDLE1BQU0sY0FBYyxHQUFHLE1BQU0sYUFBYSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQ3hELElBQUksRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLEtBQUssSUFBSSxFQUFFLElBQUksY0FBYyxFQUFFO1lBQzNCLElBQUk7Z0JBQ0EsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFBO2dCQUMzRSxJQUFJLE1BQU0sRUFBRTtvQkFDUixNQUFNLENBQUMsUUFBUSxHQUFHLG9CQUFvQixDQUFDLGlCQUFpQixFQUFFLENBQUM7b0JBQzNELE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sY0FBYyxDQUFDLE1BQU0sTUFBTSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztvQkFDekUsTUFBTSxhQUFhLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUVuRTthQUNKO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEtBQUssRUFBRSxDQUFDLENBQUM7YUFDakM7WUFDRCxDQUFDLEVBQUUsQ0FBQztTQUNQO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzlDO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2pCO0FBQ0wsQ0FBQztBQUVELGVBQWUsRUFBRSxDQUFDIn0=