"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const Utils = require("../../app/utils");
const ManagerTimer = require("../../app/services/schedule/managerTimer");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
const PayInfo = MongoManager.pay_info;
const PlayerLoginRecord = MongoManager.player_login_record;
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function statistic() {
    console.log('开始执行');
    try {
        const num = 20;
        const oneDay = 24 * 60 * 60 * 1000;
        const startTime = Utils.zerotime();
        for (let i = 1; i <= num; i++) {
            const time = startTime - i * oneDay;
            const endTime = time + oneDay;
            await ManagerTimer.addBigAgentDayManagerData(time, endTime);
            await ManagerTimer.addDayManagerDataForYingShou(time, endTime);
        }
        console.log('結束,addQudaoProfits');
        return true;
    }
    catch (error) {
        console.log('error,error', error);
    }
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkRGF5RGFxdVByb2ZpdHNSZWNvcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9hZ2VudEJhY2tUb29sL2FkZERheURhcXVQcm9maXRzUmVjb3JkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0Esc0VBQXVFO0FBQ3ZFLHlDQUEwQztBQUUxQyx5RUFBMEU7QUFDMUUsOEVBQStFO0FBQy9FLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBQ3RELE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUM7QUFDdEMsTUFBTSxpQkFBaUIsR0FBRyxZQUFZLENBQUMsbUJBQW1CLENBQUM7QUFDM0QsZUFBZSxDQUFDLGNBQWMsQ0FBQztJQUMzQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixLQUFLLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0lBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7Q0FDbEMsQ0FBQyxDQUFDO0FBS0gsS0FBSyxVQUFVLFNBQVM7SUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQixJQUFJO1FBQ0EsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2YsTUFBTSxNQUFNLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ25DLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzNCLE1BQU0sSUFBSSxHQUFHLFNBQVMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDO1lBQ3BDLE1BQU0sT0FBTyxHQUFHLElBQUksR0FBRyxNQUFNLENBQUM7WUFDOUIsTUFBTSxZQUFZLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzVELE1BQU0sWUFBWSxDQUFDLDRCQUE0QixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztTQUNsRTtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNsQyxPQUFPLElBQUksQ0FBQztLQUNmO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNyQztBQUNMLENBQUM7QUFHRCxTQUFTLEVBQUUsQ0FBQyJ9