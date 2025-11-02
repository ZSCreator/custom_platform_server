"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const MongoManager = require("../../app/dao/dbManager/mongoManager");
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
async function statistic() {
    console.log('开始执行');
    await DatabaseService.getRedisClient();
    try {
        const invites = await DailiInvitecodeInfo.find({}, 'id uid guaranteedToGame');
        let guaranteedToGame1 = {
            caipiao: 0,
            puker: 0,
            dianwan: 0,
            zhenren: 0,
            buyu: 0,
            liuhecai: 0,
        };
        let num = 0;
        for (let item of invites) {
            console.log("id", item.id, num);
            if (item.guaranteedToGame) {
                guaranteedToGame1.caipiao = item.guaranteedToGame.caipiao;
                guaranteedToGame1.puker = item.guaranteedToGame.puker;
                guaranteedToGame1.dianwan = item.guaranteedToGame.dianwan;
                guaranteedToGame1.zhenren = item.guaranteedToGame.zhenren;
                guaranteedToGame1.buyu = item.guaranteedToGame.buyu;
                guaranteedToGame1.liuhecai = 0;
            }
            await DailiInvitecodeInfo.updateOne({ id: item.id }, { $set: { guaranteedToGame: guaranteedToGame1 } });
            num++;
        }
        console.log('开始结束');
    }
    catch (error) {
        console.log('updateInviteCodeLHC==>', error);
    }
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlSW52aXRlQ29kZUxIQy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL3RoaXJkVG9vbHMvdXBkYXRlSW52aXRlQ29kZUxIQy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHNFQUF1RTtBQUN2RSxxRUFBc0U7QUFDdEUsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDdEQsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7QUFDckUsTUFBTSxtQkFBbUIsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDekUsZUFBZSxDQUFDLGNBQWMsQ0FBQztJQUMzQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUNoQyxLQUFLLEVBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0lBQy9CLE1BQU0sRUFBRyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7Q0FDbkMsQ0FBQyxDQUFDO0FBRUgsS0FBSyxVQUFVLFNBQVM7SUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQixNQUFNLGVBQWUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN2QyxJQUFJO1FBQ0EsTUFBTSxPQUFPLEdBQUksTUFBTSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDOUUsSUFBSSxpQkFBaUIsR0FBRztZQUNwQixPQUFPLEVBQUMsQ0FBQztZQUNULEtBQUssRUFBQyxDQUFDO1lBQ1AsT0FBTyxFQUFDLENBQUM7WUFDVCxPQUFPLEVBQUMsQ0FBQztZQUNULElBQUksRUFBQyxDQUFDO1lBQ04sUUFBUSxFQUFDLENBQUM7U0FDYixDQUFBO1FBQ0QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ1osS0FBSSxJQUFJLElBQUksSUFBSSxPQUFPLEVBQUM7WUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixJQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBQztnQkFDckIsaUJBQWlCLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7Z0JBQzFELGlCQUFpQixDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO2dCQUN0RCxpQkFBaUIsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQztnQkFDMUQsaUJBQWlCLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7Z0JBQzFELGlCQUFpQixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDO2dCQUNwRCxpQkFBaUIsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO2FBRWxDO1lBQ0QsTUFBTSxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsRUFBQyxFQUFFLEVBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQyxFQUFDLEVBQUMsSUFBSSxFQUFDLEVBQUMsZ0JBQWdCLEVBQUMsaUJBQWlCLEVBQUMsRUFBQyxDQUFDLENBQUM7WUFDOUYsR0FBRyxFQUFHLENBQUM7U0FDVjtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDdkI7SUFBQSxPQUFPLEtBQUssRUFBRTtRQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUMsS0FBSyxDQUFDLENBQUM7S0FDL0M7QUFFTCxDQUFDO0FBR0QsU0FBUyxFQUFFLENBQUMifQ==