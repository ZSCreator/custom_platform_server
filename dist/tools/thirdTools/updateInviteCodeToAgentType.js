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
        const invites = await DailiInvitecodeInfo.find({}, 'id uid guaranteedToGame isOpenAgency');
        let guaranteedRatio = {
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
            let agentType = 0;
            if (item.isOpenAgency == 1) {
                agentType = 0;
            }
            await DailiInvitecodeInfo.updateOne({ id: item.id }, { $set: { guaranteedRatio: guaranteedRatio, agentType } });
            num++;
        }
        console.log('开始结束');
    }
    catch (error) {
        console.log('updateInviteCodeToAgentType==>', error);
    }
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlSW52aXRlQ29kZVRvQWdlbnRUeXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvdGhpcmRUb29scy91cGRhdGVJbnZpdGVDb2RlVG9BZ2VudFR5cGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxzRUFBdUU7QUFDdkUscUVBQXNFO0FBQ3RFLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBQ3RELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0FBQ3JFLE1BQU0sbUJBQW1CLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3pFLGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDaEMsS0FBSyxFQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUMvQixNQUFNLEVBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ25DLENBQUMsQ0FBQztBQUVILEtBQUssVUFBVSxTQUFTO0lBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEIsTUFBTSxlQUFlLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDdkMsSUFBSTtRQUNBLE1BQU0sT0FBTyxHQUFJLE1BQU0sbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBQzNGLElBQUksZUFBZSxHQUFHO1lBQ2xCLE9BQU8sRUFBQyxDQUFDO1lBQ1QsS0FBSyxFQUFDLENBQUM7WUFDUCxPQUFPLEVBQUMsQ0FBQztZQUNULE9BQU8sRUFBQyxDQUFDO1lBQ1QsSUFBSSxFQUFDLENBQUM7WUFDTixRQUFRLEVBQUMsQ0FBQztTQUNiLENBQUE7UUFDRCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDWixLQUFJLElBQUksSUFBSSxJQUFJLE9BQU8sRUFBQztZQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBQyxJQUFJLENBQUMsRUFBRSxFQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztZQUNsQixJQUFHLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxFQUFDO2dCQUN0QixTQUFTLEdBQUcsQ0FBQyxDQUFDO2FBQ2pCO1lBQ0QsTUFBTSxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsRUFBQyxFQUFFLEVBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQyxFQUFDLEVBQUMsSUFBSSxFQUFDLEVBQUMsZUFBZSxFQUFDLGVBQWUsRUFBQyxTQUFTLEVBQUMsRUFBQyxDQUFDLENBQUM7WUFDckcsR0FBRyxFQUFHLENBQUM7U0FDVjtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDdkI7SUFBQSxPQUFPLEtBQUssRUFBRTtRQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEVBQUMsS0FBSyxDQUFDLENBQUM7S0FDdkQ7QUFFTCxDQUFDO0FBR0QsU0FBUyxFQUFFLENBQUMifQ==