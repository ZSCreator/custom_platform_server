'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../app/services/databaseService");
const MongoManager = require("../app/dao/dbManager/mongoManager");
const Utils = require("../app/utils");
const dbMongo = require('../config/db/mongo.json');
const regionalProfitsConfig = require('../config/data/regionalProfitsConfig.json');
const PlayerProfits = MongoManager.getDao('player_profits');
const RegionalProfitsRecord = MongoManager.getDao('regional_profits_record');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function statistic() {
    try {
        console.log('开始执行');
        const players = await PlayerProfits.find({ kaoheProfits: { '$gt': 0 } }, 'uid kaoheProfits profits');
        for (let m of players) {
            let kaoheProfits = m.kaoheProfits / 0.2 * 0.8;
            let config = regionalProfitsConfig.find(x => x.minGold < kaoheProfits && x.maxGold >= kaoheProfits);
            let profits = 0;
            if (config) {
                profits = kaoheProfits * config.bili;
                await PlayerProfits.updateOne({ uid: m.uid }, { "$inc": { "profits": profits }, $set: { kaoheProfits: 0 } });
            }
            const info = {
                id: Utils.id(),
                profits: m.profits,
                createTime: Date.now(),
                uid: m.uid,
                kaohebili: config.bili,
                kaoheProfits: kaoheProfits,
                getProfits: profits,
            };
            console.log('uid', m.uid);
            await RegionalProfitsRecord.create(info);
        }
        console.log('开始完成');
    }
    catch (error) {
        console.log('calculateRegionalProfits ==> 每周定時計算大區的考核绩效是好多:', error);
    }
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsY3VsYXRlUmVnaW9uYWxQcm9maXRzX2FvamkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90b29scy9jYWxjdWxhdGVSZWdpb25hbFByb2ZpdHNfYW9qaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsbUVBQW9FO0FBQ3BFLGtFQUFtRTtBQUNuRSxzQ0FBdUM7QUFJdkMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDbkQsTUFBTSxxQkFBcUIsR0FBRyxPQUFPLENBQUMsMkNBQTJDLENBQUMsQ0FBQztBQUVuRixNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDNUQsTUFBTSxxQkFBcUIsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFFN0UsZUFBZSxDQUFDLGNBQWMsQ0FBQztJQUMzQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUNoQyxLQUFLLEVBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0lBQy9CLE1BQU0sRUFBRyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7Q0FDbkMsQ0FBQyxDQUFDO0FBRUgsS0FBSyxVQUFVLFNBQVM7SUFDaEIsSUFBSTtRQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUMsWUFBWSxFQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxFQUFDLEVBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUM5RixLQUFLLElBQUksQ0FBQyxJQUFJLE9BQU8sRUFBRTtZQUNuQixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsWUFBWSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUMsSUFBSSxNQUFNLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQSxFQUFFLENBQUEsQ0FBQyxDQUFDLE9BQU8sR0FBRyxZQUFZLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSyxZQUFZLENBQUUsQ0FBQztZQUNwRyxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFFaEIsSUFBRyxNQUFNLEVBQUM7Z0JBQ04sT0FBTyxHQUFHLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFFO2dCQUN0QyxNQUFNLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBQyxHQUFHLEVBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBQyxFQUFDLEVBQUMsTUFBTSxFQUFDLEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxFQUFDLElBQUksRUFBQyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsRUFBQyxDQUFDLENBQUM7YUFDbEc7WUFDRCxNQUFNLElBQUksR0FBRztnQkFDTCxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtnQkFDZCxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU87Z0JBQ2xCLFVBQVUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUN0QixHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUc7Z0JBQ1YsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJO2dCQUN0QixZQUFZLEVBQUUsWUFBWTtnQkFDMUIsVUFBVSxFQUFDLE9BQU87YUFDekIsQ0FBQTtZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QixNQUFNLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM1QztRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDdkI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0RBQWdELEVBQUMsS0FBSyxDQUFDLENBQUM7S0FFdkU7QUFDVCxDQUFDO0FBR0QsU0FBUyxFQUFFLENBQUMifQ==