"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const MongoManager = require("../../app/dao/dbManager/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
const RedisManager = require('../../app/dao/dbManager/redisManager');
const GameRecord = MongoManager.getDao('game_record');
const gameManager_1 = require("../../app/dao/domainManager/hall/gameManager");
const DayPlayerProfitsPayRecord = MongoManager.getDao('day_player_profits_pay_record');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function run() {
    console.log('开始执行');
    const key = 'hall:system_games';
    const games = await RedisManager.getFromHashTable(key);
    for (let game of games) {
        console.log(`${game.data.sname}:lowLimit改变之前的值 ${game.data.lowLimit}`);
        game.data.lowLimit = 0;
        await RedisManager.storeFieldIntoHashTable(key, game.data.nid, game);
        const afterUpGame = await await RedisManager.getFromHashTable(key, game.data.nid);
        console.log(`${game.data.sname}:lowLimit改变之后的值 ${afterUpGame.data.lowLimit}`);
    }
    console.log('同步redis中的游戏配置到数据库');
    await gameManager_1.updateAllBufferGameInstant();
    console.log('同步数据库完成');
    console.log('结束');
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlR2FtZUxvd0xpbWl0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvdGhpcmRUb29scy91cGRhdGVHYW1lTG93TGltaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxzRUFBdUU7QUFDdkUscUVBQXNFO0FBR3RFLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBQ3RELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0FBQ3JFLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDdEQsOEVBQXdGO0FBQ3hGLE1BQU0seUJBQXlCLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQ3ZGLGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDaEMsS0FBSyxFQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUMvQixNQUFNLEVBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ25DLENBQUMsQ0FBQztBQUtILEtBQUssVUFBVSxHQUFHO0lBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVwQixNQUFNLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQztJQUNoQyxNQUFNLEtBQUssR0FBRyxNQUFNLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUV2RCxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRTtRQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLG1CQUFtQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sWUFBWSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRSxNQUFNLFdBQVcsR0FBRyxNQUFNLE1BQU0sWUFBWSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssbUJBQW1CLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztLQUNqRjtJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUNqQyxNQUFNLHdDQUEwQixFQUFFLENBQUM7SUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUV2QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RCLENBQUM7QUFFRCxHQUFHLEVBQUUsQ0FBQyJ9