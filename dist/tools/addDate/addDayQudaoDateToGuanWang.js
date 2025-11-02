'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const managerTimer = require("../../app/services/schedule/managerTimer");
const Utils = require("../../app/utils");
const dbMongo = require('../../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function statistic() {
    console.log('开始');
    try {
        const time = 1578153600000;
        const dayTime = Utils.zerotime();
        const oneDay = 24 * 60 * 60 * 1000;
        const num = Math.ceil((dayTime - time) / oneDay);
        for (let i = 0; i <= num; i++) {
            const startTime = time + oneDay * i;
            const endTime = startTime + oneDay;
            await managerTimer.addDayManagerDataIosAndriodYingShou(startTime, endTime);
            console.log(`startTime:${Utils.cDate(startTime)}-----endTime:${Utils.cDate(endTime)}`);
        }
        console.log('结束');
        return Promise.resolve();
    }
    catch (error) {
        console.log('calculateRegionalProfits ==> 每周定時計算大區的考核绩效是好多:', error);
    }
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkRGF5UXVkYW9EYXRlVG9HdWFuV2FuZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL2FkZERhdGUvYWRkRGF5UXVkYW9EYXRlVG9HdWFuV2FuZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsc0VBQXVFO0FBQ3ZFLHlFQUEwRTtBQUMxRSx5Q0FBMEM7QUFDMUMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDdEQsZUFBZSxDQUFDLGNBQWMsQ0FBQztJQUMzQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUNoQyxLQUFLLEVBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0lBQy9CLE1BQU0sRUFBRyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7Q0FDbkMsQ0FBQyxDQUFDO0FBS0gsS0FBSyxVQUFVLFNBQVM7SUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QixJQUFJO1FBQ0EsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDO1FBQzNCLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQyxNQUFNLE1BQU0sR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDbkMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRSxNQUFNLENBQUMsQ0FBQztRQUNoRCxLQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUcsR0FBRyxFQUFHLENBQUMsRUFBRSxFQUFDO1lBQ3pCLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sT0FBTyxHQUFHLFNBQVMsR0FBRyxNQUFNLENBQUM7WUFDbkMsTUFBTSxZQUFZLENBQUMsbUNBQW1DLENBQUMsU0FBUyxFQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDMUY7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzVCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLGdEQUFnRCxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ3hFO0FBQ0wsQ0FBQztBQU1ELFNBQVMsRUFBRSxDQUFDIn0=