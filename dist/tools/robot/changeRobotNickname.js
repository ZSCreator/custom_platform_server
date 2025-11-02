'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const dbMongo = require('../../config/db/mongo.json');
const DatabaseService = require("../../app/services/databaseService");
const PlayerInfoManager = require("../../app/common/dao/PlayerInfoManager");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const playerInfo = MongoManager.player_info;
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function test() {
    try {
        const playerList = await playerInfo.find({ isRobot: 2 }, 'uid');
        console.log("一共多少玩家: ", playerList.length);
        for (let item of playerList) {
            console.log("替换昵称: " + item.uid + "开始");
            try {
                const { player } = await PlayerInfoManager.getPlayer({ uid: item.uid });
                player.nickname = 'P' + player.uid;
                await PlayerInfoManager.updateOnePlayer(player, ['nickname']);
                console.log("换昵称玩家玩家uid: " + item.uid + "完成");
            }
            catch (error) {
                console.log('替换昵称失败:', error);
            }
        }
        console.log('替换昵称结算:');
        process.exit();
    }
    catch (error) {
        console.log('替换昵称失败:', error);
    }
    process.exit();
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlUm9ib3ROaWNrbmFtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL3JvYm90L2NoYW5nZVJvYm90Tmlja25hbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUdiLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBQ3RELHNFQUF1RTtBQUN2RSw0RUFBNkU7QUFFN0UsOEVBQStFO0FBRS9FLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUM7QUFFNUMsZUFBZSxDQUFDLGNBQWMsQ0FBQztJQUMzQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixLQUFLLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0lBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7Q0FDbEMsQ0FBQyxDQUFDO0FBRUgsS0FBSyxVQUFVLElBQUk7SUFDZixJQUFJO1FBQ0EsTUFBTSxVQUFVLEdBQUcsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdELE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUMxQyxLQUFLLElBQUksSUFBSSxJQUFJLFVBQVUsRUFBRTtZQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ3hDLElBQUk7Z0JBQ0ksTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0saUJBQWlCLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUN4RSxNQUFNLENBQUMsUUFBUSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO2dCQUNuQyxNQUFNLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO2FBQ3JEO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDakM7U0FDSjtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2xCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNqQztJQUNELE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBQ0QsSUFBSSxFQUFFLENBQUMifQ==