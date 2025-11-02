"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const MongoManager = require("../../app/dao/dbManager/mongoManager");
const PlayerManager = require("../../app/dao/domainManager/hall/playerManager");
const dbMongo = require('../../config/db/mongo.json');
const RedisManager = require('../../app/dao/dbManager/redisManager');
const DailiInvitecodeInfo = MongoManager.getDao('daili_invitecode_info');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
const playerDAO = MongoManager.getDao('player_info');
let robotCount = 0, playerCount = 0, dbPlayerCount = 0;
async function addCachePlayerInventoryProperty(uid) {
    const { player, lock } = await PlayerManager.getPlayer({ uid }, true);
    console.log(`玩家${player.uid}更新之前的 inventory 属性, ${player.inventory}`);
    player.inventory = 0;
    await PlayerManager.updateOnePlayer(player, ['inventory'], lock);
    const playerInfo = await PlayerManager.getPlayer({ uid });
    console.log(`玩家${playerInfo.player.uid}更新之后的 inventory 属性, ${playerInfo.player.inventory}`);
    await updatePlayerToDB(player);
    if (player.isRobot === 2) {
        robotCount += 1;
    }
    else {
        playerCount += 1;
    }
}
async function updatePlayerToDB(player) {
    await playerDAO.findOneAndUpdate({ uid: player.uid }, { inventory: player.inventory }, {
        new: true,
        upsert: false,
        fields: '-_id -__v'
    });
}
async function addLocalDBPlayerInventoryPerpety() {
    const playerDAO = MongoManager.getDao('player_info');
    await playerDAO.updateMany({}, { inventory: 0 });
}
async function run() {
    console.log('开始执行');
    console.log('开始更新缓存中的真人');
    const realPlayerKeys = await RedisManager.getKeysSatisfyPattern('real_player_info:*');
    await Promise.all(realPlayerKeys.map(pKey => addCachePlayerInventoryProperty(pKey.slice(17))));
    console.log('更新缓存中的真人结束');
    console.log('开始更新缓存中的机器人');
    const robotKeys = await RedisManager.getKeysSatisfyPattern('robot_player_info:*');
    await Promise.all(robotKeys.map(pKey => addCachePlayerInventoryProperty(pKey.slice(18))));
    console.log('更新缓存中的机器人结束');
    console.log('开始更新数据中的玩家');
    await addLocalDBPlayerInventoryPerpety();
    console.log('更新数据库玩家结束');
    const dbCount = await playerDAO.countDocuments({});
    const upCount = await playerDAO.countDocuments({ inventory: 0 });
    console.log(`缓存真人有: ${realPlayerKeys.length}, 更新完成有${playerCount}`);
    console.log(`缓存机器人有: ${robotKeys.length}, 更新完成有${robotCount}`);
    console.log(`数据库玩家有: ${dbCount}, 更新完成有${upCount}`);
    console.log('结束');
    process.exit();
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlUGxheWVyUHJvcGVydHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy90aGlyZFRvb2xzL3VwZGF0ZVBsYXllclByb3BlcnR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esc0VBQXVFO0FBQ3ZFLHFFQUFzRTtBQUN0RSxnRkFBaUY7QUFHakYsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDdEQsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7QUFDckUsTUFBTSxtQkFBbUIsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDekUsZUFBZSxDQUFDLGNBQWMsQ0FBQztJQUMzQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixLQUFLLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0lBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7Q0FDbEMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUVyRCxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsV0FBVyxHQUFHLENBQUMsRUFBRSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZELEtBQUssVUFBVSwrQkFBK0IsQ0FBQyxHQUFXO0lBQ3RELE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxHQUFHLHVC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