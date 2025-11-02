'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const managerDataTimer = require("../../app/services/schedule/managerBack/managerDataTimer");
const dbMongo = require('../../config/db/mongo.json');
const Utils = require('../../app/utils/index');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function test() {
    try {
        console.time("生成汇总数据");
        const oneDay = 24 * 60 * 60 * 1000;
        let time = Utils.zerotime();
        for (let i = 0; i < 90; i++) {
            let startTime = time - (90 - i) * oneDay;
            let endTime = startTime + oneDay;
            await managerDataTimer.addTodayPlatformAgentData(startTime, endTime);
        }
        console.timeEnd("生成汇总数据");
    }
    catch (error) {
        console.log('3333333333333:', error);
    }
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkVG9kYXlQbGF0Zm9ybUFnZW50RGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL2dhbWVSZWNvcmQvYWRkVG9kYXlQbGF0Zm9ybUFnZW50RGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBR2Isc0VBQXVFO0FBRXZFLDZGQUE4RjtBQUM5RixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUN0RCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUUvQyxlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDN0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNsQyxDQUFDLENBQUM7QUFFSCxLQUFLLFVBQVUsSUFBSTtJQUNmLElBQUk7UUFDQSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sTUFBTSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUVuQyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFNUIsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFFLEVBQUUsRUFBRyxDQUFDLEVBQUUsRUFBQztZQUN2QixJQUFJLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFFO1lBQzFDLElBQUksT0FBTyxHQUFHLFNBQVMsR0FBSyxNQUFNLENBQUU7WUFDcEMsTUFBTSxnQkFBZ0IsQ0FBQyx5QkFBeUIsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDeEU7UUFDRCxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzdCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFBO0tBQ3ZDO0FBQ0wsQ0FBQztBQUdELElBQUksRUFBRSxDQUFDIn0=