'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const SscSwitchService = require("../app/services/ssc/sscSwitchService");
const DatabaseService = require("../app/services/databaseService");
const dbMongo = require('../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function clean() {
    await SscSwitchService.initBetLimitAndPayLimitIntoBuffer();
    await SscSwitchService.initSscGameOpenInfoIntoRedis();
    console.log(".....添加时时彩游戏信息");
}
setTimeout(clean, 3000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlU3NjT3BlbkdhbWVJbmZvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdG9vbHMvY3JlYXRlU3NjT3BlbkdhbWVJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLFlBQVksQ0FBQzs7QUFJYix5RUFBMEU7QUFDMUUsbUVBQW9FO0FBU3BFLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBRW5ELGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDaEMsS0FBSyxFQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUMvQixNQUFNLEVBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ25DLENBQUMsQ0FBQztBQUVILEtBQUssVUFBVSxLQUFLO0lBQ2hCLE1BQU0sZ0JBQWdCLENBQUMsaUNBQWlDLEVBQUUsQ0FBQztJQUMzRCxNQUFNLGdCQUFnQixDQUFDLDRCQUE0QixFQUFFLENBQUM7SUFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFDRCxVQUFVLENBQUMsS0FBSyxFQUFDLElBQUksQ0FBQyxDQUFBIn0=