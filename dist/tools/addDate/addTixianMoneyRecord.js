'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const Utils = require("../../app/utils");
const dbMongo = require('../../config/db/mongo.json');
const TixianMoenyRecord = MongoManager.tixian_money_record;
DatabaseService.initConnection({
    "host": "127.0.0.1",
    "port": 27017,
    "name": "lobby"
});
async function statistic() {
    try {
        console.log('开始执行');
        for (let num = 0; num < 100000; num++) {
            const createTime = Date.now() - num * 10 * 1000;
            const info = {
                id: Utils.id(),
                uid: "83605275",
                nickname: "吃大皮",
                createTime: createTime,
                money: 500,
                moneyNum: 500,
                gold: 13155,
                bankName: "中国银行",
                bankCardNo: "6216603200002578758",
                bankCardName: "冉潘",
                openBankAddress: "",
                bankCode: "BOC",
                alipayName: "",
                payTreasure: "",
                selfTixian: 0,
                selfAddRmb: 10000,
                playerType: 1,
                remittance: 0,
                type: 0,
                closeStatus: false,
                remark: ""
            };
            await TixianMoenyRecord.create(info);
        }
        console.log('开始完成');
        return Promise.resolve();
    }
    catch (error) {
        console.log('calculateRegionalProfits ==> 每周定時計算大區的考核绩效是好多:', error);
    }
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkVGl4aWFuTW9uZXlSZWNvcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9hZGREYXRlL2FkZFRpeGlhbk1vbmV5UmVjb3JkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixzRUFBdUU7QUFDdkUsOEVBQStFO0FBTS9FLHlDQUEwQztBQUcxQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUN0RCxNQUFNLGlCQUFpQixHQUFHLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQztBQUMzRCxlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxXQUFXO0lBQ25CLE1BQU0sRUFBRSxLQUFLO0lBQ2IsTUFBTSxFQUFFLE9BQU87Q0FDbEIsQ0FBQyxDQUFDO0FBS0gsS0FBSyxVQUFVLFNBQVM7SUFDcEIsSUFBSTtRQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEIsS0FBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUcsR0FBRyxHQUFHLE1BQU0sRUFBRSxHQUFHLEVBQUcsRUFBQztZQUNuQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDaEQsTUFBTSxJQUFJLEdBQUc7Z0JBQ1QsRUFBRSxFQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUU7Z0JBQ2YsR0FBRyxFQUFHLFVBQVU7Z0JBQ2hCLFFBQVEsRUFBRyxLQUFLO2dCQUNoQixVQUFVLEVBQUcsVUFBVTtnQkFDdkIsS0FBSyxFQUFHLEdBQUc7Z0JBQ1gsUUFBUSxFQUFFLEdBQUc7Z0JBQ2IsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsUUFBUSxFQUFFLE1BQU07Z0JBQ2hCLFVBQVUsRUFBRyxxQkFBcUI7Z0JBQ2xDLFlBQVksRUFBRSxJQUFJO2dCQUNsQixlQUFlLEVBQUcsRUFBRTtnQkFDcEIsUUFBUSxFQUFHLEtBQUs7Z0JBQ2hCLFVBQVUsRUFBRyxFQUFFO2dCQUNmLFdBQVcsRUFBRyxFQUFFO2dCQUNoQixVQUFVLEVBQUcsQ0FBQztnQkFDZCxVQUFVLEVBQUcsS0FBSztnQkFDbEIsVUFBVSxFQUFHLENBQUM7Z0JBQ2QsVUFBVSxFQUFFLENBQUM7Z0JBQ2IsSUFBSSxFQUFHLENBQUM7Z0JBQ1IsV0FBVyxFQUFHLEtBQUs7Z0JBQ25CLE1BQU0sRUFBRyxFQUFFO2FBQ2QsQ0FBQTtZQUNELE1BQU0saUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQixPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM1QjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxnREFBZ0QsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUN4RTtBQUNMLENBQUM7QUFNRCxTQUFTLEVBQUUsQ0FBQyJ9