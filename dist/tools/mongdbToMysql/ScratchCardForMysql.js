"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
const PlayerAgent_mysql_dao_1 = require("../../app/common/dao/mysql/PlayerAgent.mysql.dao");
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
RDSClient_1.RDSClient.demoInit();
const InfiniteAgentInfo = MongoManager.infinite_agent_info;
async function clean() {
    console.warn(`开始执行`);
    const records = await InfiniteAgentInfo.find({});
    let num = 0;
    for (let item of records) {
        if (item.agentLevel !== 0) {
            let roleType = 1;
            if (item.agentLevel == 1) {
                roleType = 2;
            }
            else if (item.agentLevel == 2) {
                roleType = 3;
            }
            console.warn(`uid:${item.uid},gold:${Math.abs(item.gold)}`);
            const info = {
                uid: item.uid,
                inviteCode: '',
                platformName: item.remark,
                platformGold: Math.abs(item.gold),
                rootUid: item.group_id,
                parentUid: item.superior ? item.superior : '',
                deepLevel: item.agentLevel,
                roleType: roleType,
                status: 1,
            };
            await PlayerAgent_mysql_dao_1.default.insertOne(info);
            num++;
            console.warn(`完成:${item.uid},第${num}条`);
        }
    }
    console.warn(`执行完成`);
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NyYXRjaENhcmRGb3JNeXNxbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL21vbmdkYlRvTXlzcWwvU2NyYXRjaENhcmRGb3JNeXNxbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHNFQUF1RTtBQUN2RSw4RUFBK0U7QUFDL0UsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDdEQsNEZBQW1GO0FBQ25GLHdFQUFxRTtBQUNyRSxlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDN0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNsQyxDQUFDLENBQUM7QUFFSCxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3JCLE1BQU0saUJBQWlCLEdBQUcsWUFBWSxDQUFDLG1CQUFtQixDQUFDO0FBQzNELEtBQUssVUFBVSxLQUFLO0lBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckIsTUFBTSxPQUFPLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDakQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ1osS0FBSSxJQUFJLElBQUksSUFBSSxPQUFPLEVBQUU7UUFDckIsSUFBRyxJQUFJLENBQUMsVUFBVSxLQUFLLENBQUMsRUFBQztZQUNyQixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDakIsSUFBRyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBQztnQkFDcEIsUUFBUSxHQUFHLENBQUMsQ0FBQzthQUNoQjtpQkFBSyxJQUFHLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxFQUFDO2dCQUMxQixRQUFRLEdBQUcsQ0FBQyxDQUFDO2FBQ2hCO1lBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxHQUFHLFNBQVMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQzNELE1BQU0sSUFBSSxHQUFHO2dCQUNULEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztnQkFDYixVQUFVLEVBQUUsRUFBRTtnQkFDZCxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU07Z0JBQ3pCLFlBQVksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ2pDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFDdEIsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzdDLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVTtnQkFDMUIsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLE1BQU0sRUFBRyxDQUFDO2FBQ2IsQ0FBQTtZQUNELE1BQU0sK0JBQW1CLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFDLEdBQUcsRUFBRyxDQUFFO1lBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQTtTQUMxQztLQUNKO0lBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyQixPQUFPO0FBRVgsQ0FBQztBQUNELFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMifQ==