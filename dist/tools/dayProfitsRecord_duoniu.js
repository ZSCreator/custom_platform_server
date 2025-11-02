'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../app/services/databaseService");
const MongoManager = require("../app/dao/dbManager/mongoManager");
const GetDataService = require("../app/services/hall/getDataService");
const Utils = require("../app/utils");
const dbMongo = require('../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function statistic() {
    try {
        const playerInfo = MongoManager.getDao('player_info');
        const payInfo = MongoManager.getDao('pay_info');
        const tixianMoneyRecord = MongoManager.getDao('tixian_money_record');
        const luckyAroundRecord = MongoManager.getDao('luckyAround_record');
        const dayProfitsInfo = MongoManager.getDao('day_profits_info');
        let arr = [];
        let allGolds = 0;
        let yersterDayAllGolds = 0;
        let payMoney = 0;
        let payNum = 0;
        let payPeopleNum = [];
        let tixianMoney = 0;
        let lucksGold = 0;
        let allStarjackPool = 0;
        let time = Utils.zerotime() - 24 * 60 * 60 * 1000;
        const endTime = Utils.zerotime();
        let jackpot = 0;
        let runningPool = 0;
        let profitPool = 0;
        let yesterJackpot = 0;
        let yesterRunningPool = 0;
        let yesterProfitPool = 0;
        let roomList = [];
        const warn = await GetDataService.getSystemConfig();
        const dayPlayerGolds = await playerInfo.aggregate().match({ isRobot: 0 })
            .group({ _id: {}, 'gold': { '$sum': '$gold.2' } }).then();
        console.log('截至目前玩家身上所有的金币：', dayPlayerGolds);
        const yersterdayProfitsRecord = await dayProfitsInfo.find().sort('-createTime').limit(1).exec();
        const dayPayInfos = await payInfo.find({ attach: 'gold', time: { '$gt': time, '$lt': endTime } }, 'uid total_fee');
        const dayLuckys = await luckyAroundRecord.aggregate().match({ awardType: 'gold', createTime: { '$gt': time, '$lt': endTime } })
            .group({ _id: {}, 'award': { '$sum': '$award' } }).then();
        console.log('今日总赠送金币：', dayLuckys);
        const dayTixianMoneys = await tixianMoneyRecord.aggregate().match({ type: 1, createTime: { '$gt': time, '$lt': endTime } })
            .group({ _id: {}, 'tixian': { '$sum': '$money' } }).then();
        console.log('今日总提现金钱：', dayTixianMoneys);
        if (yersterdayProfitsRecord.length == 0) {
            yersterDayAllGolds = 0;
        }
        else {
            yersterDayAllGolds = yersterdayProfitsRecord[0].nowPlayerGold;
        }
        console.log('昨天所有玩家身上所有的金币: ', yersterDayAllGolds);
        if (dayPlayerGolds.length != 0) {
            allGolds = dayPlayerGolds[0].gold;
        }
        dayPayInfos.forEach(m => {
            payMoney += m.total_fee;
            payNum += 1;
            const temp = payPeopleNum.find(x => x == m.uid);
            if (!temp) {
                payPeopleNum.push(m.uid);
            }
        });
        if (dayTixianMoneys.length != 0) {
            tixianMoney = dayTixianMoneys[0].tixian;
        }
        if (dayLuckys.length != 0) {
            lucksGold = dayLuckys[0].award;
        }
        const dayProfits = (((payMoney / 100) - tixianMoney) * warn.goldToMoney - (allGolds - yersterDayAllGolds) - lucksGold) / warn.goldToMoney;
        const info = {
            id: Utils.id(),
            profits: dayProfits,
            createTime: Utils.zerotime() - 50 * 60 * 1000,
            payMoney: payMoney,
            payNum: payNum,
            payPeopleNum: payPeopleNum,
            tixianMoney,
            lucksGold: lucksGold,
            nowPlayerGold: allGolds,
            goldValue: (allGolds - yersterDayAllGolds),
        };
        await dayProfitsInfo.create(info);
    }
    catch (error) {
        console.error("HallController.dayProfits ==> 每日23点55统计当天的利润:", error);
    }
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF5UHJvZml0c1JlY29yZF9kdW9uaXUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90b29scy9kYXlQcm9maXRzUmVjb3JkX2R1b25pdS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsbUVBQW9FO0FBR3BFLGtFQUFtRTtBQUNuRSxzRUFBdUU7QUFDdkUsc0NBQXVDO0FBQ3ZDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBR25ELGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDaEMsS0FBSyxFQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUMvQixNQUFNLEVBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ25DLENBQUMsQ0FBQztBQUVILEtBQUssVUFBVSxTQUFTO0lBQ1osSUFBSTtRQUNKLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdEQsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoRCxNQUFNLGlCQUFpQixHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNyRSxNQUFNLGlCQUFpQixHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNwRSxNQUFNLGNBQWMsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFHL0QsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksa0JBQWtC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