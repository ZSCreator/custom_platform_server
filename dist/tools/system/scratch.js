"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
const data = require("./scratch_card_result.json");
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
const scratchCardResult = MongoManager.scratch_card_result;
let i = 0;
async function clean() {
    for (const list of data.RECORDS) {
        console.warn(i);
        const info = {
            id: list.id,
            cardNum: list.cardNum,
            result: list.result,
            rebate: list.rebate,
            jackpotId: list.jackpotId,
            status: 0,
        };
        await scratchCardResult.create(info, function (err, result) {
            if (err) {
                console.warn(`${err}`);
            }
        });
        i++;
    }
    console.warn(`1111  ${i}`);
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL3N5c3RlbS9zY3JhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esc0VBQXVFO0FBQ3ZFLDhFQUErRTtBQUMvRSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUN0RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUNuRCxlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDN0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNsQyxDQUFDLENBQUM7QUFDSCxNQUFNLGlCQUFpQixHQUFHLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQztBQUMzRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDVixLQUFLLFVBQVUsS0FBSztJQUNoQixLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDN0IsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQixNQUFNLElBQUksR0FBRztZQUNULEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNYLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN6QixNQUFNLEVBQUUsQ0FBQztTQUNaLENBQUM7UUFDRixNQUFNLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsVUFBVSxHQUFHLEVBQUUsTUFBTTtZQUN0RCxJQUFJLEdBQUcsRUFBRTtnQkFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQzthQUMxQjtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxFQUFFLENBQUM7S0FDUDtJQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFDRCxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDIn0=