'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const dbMongo = require('../../config/db/mongo.json');
const DatabaseService = require("../../app/services/databaseService");
const infiniteAgentManager = require("../../app/dao/domainManager/hall/infiniteAgentManager");
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function test() {
    try {
        const groupAgents = await infiniteAgentManager.findAgentList({ agentLevel: 1 }, 'uid');
        let allSub;
        let allGroupLine;
        let originalLength;
        for (let group of groupAgents) {
            allSub = await infiniteAgentManager.findAgentList({ group_id: group.uid }, 'group_line');
            allGroupLine = allSub.map(data => data.group_line);
            originalLength = allGroupLine.length;
            allGroupLine = Array.from(new Set(allGroupLine));
            if (allGroupLine.length !== originalLength) {
                console.log(`大区 ${group.uid} 的groupLine有误，长度应为：${originalLength}，实际长度：${allGroupLine.length}`);
            }
        }
        console.log('000000000000000000 扫描完成 00000000000000');
    }
    catch (error) {
        console.log('111111111111111111:', error);
    }
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnRSZWxhdGlvblRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9hZ2VudC9hZ2VudFJlbGF0aW9uVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBR2IsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFFdEQsc0VBQXVFO0FBR3ZFLDhGQUErRjtBQUcvRixlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQ2hDLEtBQUssRUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDL0IsTUFBTSxFQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNuQyxDQUFDLENBQUM7QUFFSCxLQUFLLFVBQVUsSUFBSTtJQUNmLElBQUk7UUFDQSxNQUFNLFdBQVcsR0FBRyxNQUFNLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxFQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRixJQUFJLE1BQU0sQ0FBQztRQUNYLElBQUksWUFBWSxDQUFDO1FBQ2pCLElBQUksY0FBYyxDQUFDO1FBQ25CLEtBQUssSUFBSSxLQUFLLElBQUksV0FBVyxFQUFFO1lBQzNCLE1BQU0sR0FBRyxNQUFNLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxFQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDdkYsWUFBWSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbkQsY0FBYyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7WUFDckMsWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNqRCxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssY0FBYyxFQUFFO2dCQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEdBQUcsc0JBQXNCLGNBQWMsU0FBUyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTthQUNqRztTQUNKO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFBO0tBQ3hEO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLEtBQUssQ0FBQyxDQUFBO0tBQzVDO0FBQ0wsQ0FBQztBQUVELElBQUksRUFBRSxDQUFDIn0=