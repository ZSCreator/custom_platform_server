'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
const Utils = require('../../app/utils/index');
const game_record = MongoManager.game_record;
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function test() {
    try {
        console.warn("开始添加数据");
        for (let i = 0; i <= 100000; i++) {
            const info = {
                "uid": Utils.randomId(8),
                "superior": "",
                "groupRemark": "4",
                "group_id": "78779513",
                "thirdUid": "",
                "nid": "1",
                "sceneId": 0,
                "input": 50000,
                "validBet": 50000,
                "profit": -26000,
                "win": 24000,
                "gold": 74000,
                "playStatus": 1,
                "isDealer": false,
                "nickname": "公保鸿畅",
                "gname": "幸运777",
                "createTime": Date.now(),
                "multiple": 0,
                "addRmb": 0,
                "addTixian": 0,
                "roomId": "001",
                "roundId": "a618a9bc10000127",
                "seat": -1,
                "playersNumber": 1,
                "result": "2000|25|4|6000/a/3|6000/a/3|6000/a/3|6000/a/3",
                "startTime": "2020-08-17 10:05:09",
                "endTime": "2020-08-17 10:05:09",
                "bet_commission": 0,
                "win_commission": 0,
                "settle_commission": 1000,
            };
            await game_record.create(info);
            console.warn(`添加${i}条数据`);
        }
    }
    catch (error) {
        console.log('3333333333333:', error);
    }
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsQ29tbWlzc2lvbkZyb21HYW1lUmVjb3JkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvZ2FtZVJlY29yZC9jYWxDb21taXNzaW9uRnJvbUdhbWVSZWNvcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUdiLHNFQUF1RTtBQUV2RSw4RUFBK0U7QUFDL0UsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDdEQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDL0MsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQztBQUU3QyxlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDN0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNsQyxDQUFDLENBQUM7QUFFSCxLQUFLLFVBQVUsSUFBSTtJQUNmLElBQUk7UUFDQSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3RCLEtBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFHLENBQUMsSUFBRyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUM7WUFDM0IsTUFBTSxJQUFJLEdBQUc7Z0JBQ1QsS0FBSyxFQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixVQUFVLEVBQUcsRUFBRTtnQkFDZixhQUFhLEVBQUcsR0FBRztnQkFDbkIsVUFBVSxFQUFHLFVBQVU7Z0JBQ3ZCLFVBQVUsRUFBRyxFQUFFO2dCQUNmLEtBQUssRUFBRyxHQUFHO2dCQUNYLFNBQVMsRUFBRyxDQUFDO2dCQUNiLE9BQU8sRUFBRyxLQUFLO2dCQUNmLFVBQVUsRUFBRyxLQUFLO2dCQUNsQixRQUFRLEVBQUcsQ0FBQyxLQUFLO2dCQUNqQixLQUFLLEVBQUcsS0FBSztnQkFDYixNQUFNLEVBQUcsS0FBSztnQkFDZCxZQUFZLEVBQUcsQ0FBQztnQkFDaEIsVUFBVSxFQUFHLEtBQUs7Z0JBQ2xCLFVBQVUsRUFBRyxNQUFNO2dCQUNuQixPQUFPLEVBQUcsT0FBTztnQkFDakIsWUFBWSxFQUFHLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ3pCLFVBQVUsRUFBRyxDQUFDO2dCQUNkLFFBQVEsRUFBRyxDQUFDO2dCQUNaLFdBQVcsRUFBRyxDQUFDO2dCQUNmLFFBQVEsRUFBRyxLQUFLO2dCQUNoQixTQUFTLEVBQUcsa0JBQWtCO2dCQUM5QixNQUFNLEVBQUcsQ0FBQyxDQUFDO2dCQUNYLGVBQWUsRUFBRyxDQUFDO2dCQUNuQixRQUFRLEVBQUcsK0NBQStDO2dCQUMxRCxXQUFXLEVBQUcscUJBQXFCO2dCQUNuQyxTQUFTLEVBQUcscUJBQXFCO2dCQUNqQyxnQkFBZ0IsRUFBRyxDQUFDO2dCQUNwQixnQkFBZ0IsRUFBRyxDQUFDO2dCQUNwQixtQkFBbUIsRUFBRyxJQUFJO2FBQzdCLENBQUE7WUFDRCxNQUFNLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDN0I7S0FDSjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQTtLQUN2QztBQUNMLENBQUM7QUFJRCxJQUFJLEVBQUUsQ0FBQyJ9