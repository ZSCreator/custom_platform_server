"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const PlayerManager = require("../../app/dao/domainManager/hall/playerManager");
const UserManager = require("../../app/dao/domainManager/hall/userManager");
const MongoManager = require("../../app/dao/dbManager/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
const RedisManager = require('../../app/dao/dbManager/redisManager');
const PlayerInfo = MongoManager.getDao('player_info');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function statistic() {
    console.log('开始执行');
    await DatabaseService.getRedisClient();
    let lockRef;
    try {
        const players = await PlayerInfo.find({ isRobot: 0 }, 'uid');
        let num = 0;
        for (let item of players) {
            console.log("uid", item.uid, num);
            const user = await UserManager.findOneUser({ uid: item.uid }, 'uid');
            const { player } = await PlayerManager.getPlayer({ uid: item.uid });
            if (player.sex == 1) {
                user.agentType = 2;
            }
            else {
                user.agentType = 0;
            }
            await UserManager.updateOneUser(user, ['agentType']);
            num++;
        }
        console.log('开始结束');
        Promise.resolve();
    }
    catch (error) {
        lockRef && await RedisManager.unlock(lockRef);
        console.log('updateUserAgentType==>', error);
    }
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlVXNlckFnZW50VHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL3RoaXJkVG9vbHMvdXBkYXRlVXNlckFnZW50VHlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHNFQUF1RTtBQUV2RSxnRkFBaUY7QUFDakYsNEVBQTZFO0FBQzdFLHFFQUFzRTtBQUN0RSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUN0RCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztBQUNyRSxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3RELGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ2xDLENBQUMsQ0FBQztBQUtILEtBQUssVUFBVSxTQUFTO0lBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEIsTUFBTSxlQUFlLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDdkMsSUFBSSxPQUFPLENBQUM7SUFDWixJQUFJO1FBQ0EsTUFBTSxPQUFPLEdBQUcsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdELElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNaLEtBQUssSUFBSSxJQUFJLElBQUksT0FBTyxFQUFFO1lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxXQUFXLENBQUMsV0FBVyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3BFLElBQUksTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO2FBQ3RCO2lCQUFNO2dCQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO2FBQ3RCO1lBQ0QsTUFBTSxXQUFXLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDckQsR0FBRyxFQUFFLENBQUM7U0FDVDtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEIsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3JCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFFWixPQUFPLElBQUksTUFBTSxZQUFZLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDaEQ7QUFFTCxDQUFDO0FBR0QsU0FBUyxFQUFFLENBQUMifQ==