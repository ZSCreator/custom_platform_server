"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const InfiniteAgentService = require("../../app/services/agent/infiniteAgentService");
const MongoManager = require("../../app/dao/dbManager/mongoManager");
const Utils = require("../../app/utils");
const dbMongo = require('../../config/db/mongo.json');
const RedisManager = require('../../app/dao/dbManager/redisManager');
const DayQudaoProfitsInfo = MongoManager.getDao('day_qudao_profits_info');
const GameRecord = MongoManager.getDao('game_record');
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
        const records = await DayQudaoProfitsInfo.find({}, 'id uid createTime');
        let num = 0;
        for (let item of records) {
            console.log("id", item._id, num);
            const uid = item.uid;
            const players = await InfiniteAgentService.getSubordinates(uid, 'uid ', true, false);
            let list = [];
            players.forEach(m => {
                list.push(m.uid);
            });
            const startTime = Utils.zerotime(item.createTime);
            const endTime = startTime + 24 * 60 * 60 * 1000;
            let nidList = Utils.getAllGameTypeNidList();
            const gameRecords = await GameRecord.aggregate().match({ uid: { $in: list }, nid: { $in: nidList }, createTime: { '$gt': startTime, '$lt': endTime } })
                .group({ _id: {}, 'win': { '$sum': '$win' }, 'input': { '$sum': '$input' } });
            let inputMoney = 0;
            let zhongjiangMoney = 0;
            if (gameRecords.length != 0) {
                inputMoney = gameRecords[0].input;
                zhongjiangMoney = gameRecords[0].win;
            }
            await DayQudaoProfitsInfo.updateOne({ _id: item._id }, { $set: { inputMoney: inputMoney, zhongjiangMoney, } });
            num++;
        }
        console.log('开始结束');
    }
    catch (error) {
        console.log('updateInviteCodeLHC==>', error);
    }
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBEYXlQcm9maXRzUmVjb3JkRm9yR2FtZVJlY29yZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL3RoaXJkVG9vbHMvdXBEYXlQcm9maXRzUmVjb3JkRm9yR2FtZVJlY29yZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHNFQUF1RTtBQUN2RSxzRkFBdUY7QUFDdkYscUVBQXNFO0FBQ3RFLHlDQUF5QztBQUN6QyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUN0RCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztBQUNyRSxNQUFNLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUMxRSxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3RELGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ2xDLENBQUMsQ0FBQztBQUVILEtBQUssVUFBVSxTQUFTO0lBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEIsTUFBTSxlQUFlLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDdkMsSUFBSTtRQUNBLE1BQU0sT0FBTyxHQUFJLE1BQU0sbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3hFLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNaLEtBQUksSUFBSSxJQUFJLElBQUksT0FBTyxFQUFDO1lBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLENBQUM7WUFDL0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNyQixNQUFNLE9BQU8sR0FBRyxNQUFNLG9CQUFvQixDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUMsTUFBTSxFQUFDLElBQUksRUFBQyxLQUFLLENBQUMsQ0FBQztZQUNsRixJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7WUFDZCxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQSxFQUFFO2dCQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ3BCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEQsTUFBTSxPQUFPLEdBQUcsU0FBUyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztZQUNoRCxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUM1QyxNQUFNLFdBQVcsR0FBRyxNQUFNLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUM7aUJBQ2xKLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFHLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBQyxDQUFDLENBQUM7WUFDbEYsSUFBSSxVQUFVLEdBQUksQ0FBQyxDQUFDO1lBQ3BCLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQztZQUN4QixJQUFHLFdBQVcsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFDO2dCQUN2QixVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDbEMsZUFBZSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7YUFDeEM7WUFDRCxNQUFNLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxFQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsR0FBRyxFQUFDLEVBQUMsRUFBQyxJQUFJLEVBQUMsRUFBQyxVQUFVLEVBQUMsVUFBVSxFQUFDLGVBQWUsR0FBRSxFQUFDLENBQUMsQ0FBQztZQUNwRyxHQUFHLEVBQUcsQ0FBQztTQUNWO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN2QjtJQUFBLE9BQU8sS0FBSyxFQUFFO1FBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBQyxLQUFLLENBQUMsQ0FBQztLQUMvQztBQUVMLENBQUM7QUFHRCxTQUFTLEVBQUUsQ0FBQyJ9