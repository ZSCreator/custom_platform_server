'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseConst = require("../app/consts/databaseConst");
const HallConst = require("../app/consts/hallConst");
const DatabaseService = require("../app/services/databaseService");
const PlayerManager = require("../app/dao/domainManager/hall/playerManager");
const RecordManager = require("../app/dao/domainManager/record/recordManager");
const RedisManager = require("../app/dao/dbManager/redisManager");
const MongoManager = require("../app/dao/dbManager/mongoManager");
const CommonUtil = require("../app/utils/lottery/commonUtil");
const JsonManager = require("../config/data/JsonMgr");
DatabaseService.initConnection({
    "host": "127.0.0.1",
    "port": 27017,
    "name": "lobby"
});
async function test() {
    try {
        await JsonManager.init();
        const playerTableName = "player_info";
        const PLAYER_INFO_DAO = MongoManager.getDao(playerTableName);
        const playerList = await PlayerManager.findPlayerList({});
        const bufferPlayerKeys = await RedisManager.getKeysSatisfyPattern(playerTableName + ':*');
        let bufferKey;
        let playerRecords;
        console.log('000000000000000000 玩家总数:', playerList.length);
        let i = 1;
        for (let player of playerList) {
            playerRecords = await RecordManager.getRecordListByType(DatabaseConst.RECORD_DAO_TYPE.GAME_RECORD, { uid: player.uid, nid: { $nin: Object.values(HallConst.GAME_RECORD_TYPE) } }, 'input nid createTime');
            player.flowCount = { sum: 0 };
            for (let record of playerRecords) {
                if (record.input <= 0) {
                    continue;
                }
                player.flowCount.sum += record.input;
                if (CommonUtil.isNullOrUndefined(player.flowCount[record.nid])) {
                    player.flowCount[record.nid] = 0;
                }
                player.flowCount[record.nid] += record.input;
            }
            bufferKey = playerTableName + ':' + player.uid;
            if (bufferPlayerKeys.includes(bufferKey)) {
                await RedisManager.setObjectIntoRedisHasExpiration(bufferKey, {
                    updateFields: [],
                    data: player
                }, DatabaseConst.BUFFER_EXPIRATION.ONE_HOUR);
            }
            await PLAYER_INFO_DAO.updateOne({ uid: player.uid }, { flowCount: player.flowCount });
            console.log(`1111111111111111 第${i} of ${playerList.length} 个已更新完:`, JSON.stringify(player.flowCount));
            i++;
        }
        console.log('222222222222222: 数据已全部写入到缓存');
        await PlayerManager.updateAllBufferPlayerInstant();
        console.log('3333333333333333 所有玩家的流水信息已更新完毕');
    }
    catch (error) {
        console.log('444444444444444 更新玩家的流水出错了:', error);
    }
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlQ29tbWlzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rvb2xzL3VwZGF0ZUNvbW1pc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLDZEQUE4RDtBQUM5RCxxREFBc0Q7QUFDdEQsbUVBQW9FO0FBQ3BFLDZFQUE4RTtBQUM5RSwrRUFBZ0Y7QUFDaEYsa0VBQW1FO0FBQ25FLGtFQUFtRTtBQUNuRSw4REFBK0Q7QUFDL0Qsc0RBQXVEO0FBRXZELGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLFdBQVc7SUFDbkIsTUFBTSxFQUFFLEtBQUs7SUFDYixNQUFNLEVBQUUsT0FBTztDQUNsQixDQUFDLENBQUM7QUFHSCxLQUFLLFVBQVUsSUFBSTtJQUNmLElBQUk7UUFDQSxNQUFNLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN6QixNQUFNLGVBQWUsR0FBRyxhQUFhLENBQUM7UUFDdEMsTUFBTSxlQUFlLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM3RCxNQUFNLFVBQVUsR0FBRyxNQUFNLGFBQWEsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUQsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDMUYsSUFBSSxTQUFTLENBQUM7UUFDZCxJQUFJLGFBQWEsQ0FBQztRQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVixLQUFLLElBQUksTUFBTSxJQUFJLFVBQVUsRUFBRTtZQUMzQixhQUFhLEdBQUcsTUFBTSxhQUFhLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQzdGLEVBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLEVBQUMsRUFBQyxFQUFFLHNCQUFzQixDQUFDLENBQUM7WUFFdkcsTUFBTSxDQUFDLFNBQVMsR0FBRyxFQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUMsQ0FBQztZQUM1QixLQUFLLElBQUksTUFBTSxJQUFJLGFBQWEsRUFBRTtnQkFDOUIsSUFBSSxNQUFNLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRTtvQkFDbkIsU0FBUztpQkFDWjtnQkFFRCxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUNyQyxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO29CQUM1RCxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3BDO2dCQUVELE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUM7YUFDaEQ7WUFDRCxTQUFTLEdBQUcsZUFBZSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO1lBRS9DLElBQUksZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUV0QyxNQUFNLFlBQVksQ0FBQywrQkFBK0IsQ0FBQyxTQUFTLEVBQUU7b0JBQzFELFlBQVksRUFBRSxFQUFFO29CQUNoQixJQUFJLEVBQUUsTUFBTTtpQkFDZixFQUFFLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNoRDtZQUVELE1BQU0sZUFBZSxDQUFDLFNBQVMsQ0FBQyxFQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBQyxDQUFDLENBQUM7WUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLFVBQVUsQ0FBQyxNQUFNLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3ZHLENBQUMsRUFBRSxDQUFDO1NBQ1A7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDM0MsTUFBTSxhQUFhLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztRQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7S0FDbEQ7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDckQ7QUFDTCxDQUFDO0FBRUQsSUFBSSxFQUFFLENBQUMifQ==