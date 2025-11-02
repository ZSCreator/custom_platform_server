'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../app/services/databaseService");
const InfiniteAgentManager = require("../app/dao/domainManager/hall/infiniteAgentManager");
const MongoManager = require("../app/dao/dbManager/mongoManager");
const Utils = require("../app/utils");
const path = require("path");
const dbMongo = require('../config/db/mongo.json');
const fs = require("fs");
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function statistic() {
    const PayInfo = MongoManager.getDao('pay_info');
    const allPays = await PayInfo.find({}).sort('-time');
    let info = 'ID,昵称,充值时间,订单号,充值金额,现有金币,充值途径,客服ID,所属大区';
    let cnt = 0;
    for (let temp of allPays) {
        let uid = temp.uid;
        let nickname = temp.nickname;
        let createTime = Utils.cDate(temp.time);
        let id = temp.id;
        let total_fee = temp.total_fee / 100;
        let gold = temp.lastGold;
        let remark = temp.remark;
        let customerId = temp.customerId;
        let inviteCodeInfo = await InfiniteAgentManager.findAgent({ uid }, 'group_id');
        let daqu = '';
        if (inviteCodeInfo && inviteCodeInfo.group_id) {
            daqu = inviteCodeInfo.group_id;
        }
        info += "\r\n" + uid + ',' + nickname + ',' + createTime + ',' + id + ',' + total_fee + ',' + gold + ',' + remark + ',' + customerId + ',' + daqu;
        cnt++;
        console.log("当前处理:", cnt);
    }
    console.log('__dirname..', __dirname);
    let paths = path.resolve(__dirname, './data/');
    console.log('paths', paths);
    paths = paths + '/payInfo.csv';
    fs.writeFile(paths, info, function (err) {
        console.log("文件生成地址：" + paths);
    });
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcm90UGF5SW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rvb2xzL2V4cHJvdFBheUluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLG1FQUFvRTtBQUdwRSwyRkFBNEY7QUFFNUYsa0VBQW1FO0FBQ25FLHNDQUF1QztBQUN2Qyw2QkFBOEI7QUFDOUIsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDbkQseUJBQTBCO0FBQzFCLGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDaEMsS0FBSyxFQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUMvQixNQUFNLEVBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ25DLENBQUMsQ0FBQztBQUVILEtBQUssVUFBVSxTQUFTO0lBQ3BCLE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEQsTUFBTSxPQUFPLEdBQUcsTUFBTyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0RCxJQUFJLElBQUksR0FBRSx5Q0FBeUMsQ0FBQztJQUNwRCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDWixLQUFLLElBQUksSUFBSSxJQUFJLE9BQU8sRUFBRTtRQUN0QixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ25CLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDN0IsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsSUFBSSxFQUFFLEdBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNsQixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFDLEdBQUcsQ0FBQztRQUNuQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDekIsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNqQyxJQUFJLGNBQWMsR0FBRyxNQUFNLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxFQUFDLEdBQUcsRUFBQyxFQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzVFLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUcsY0FBYyxJQUFJLGNBQWMsQ0FBQyxRQUFRLEVBQUM7WUFDekMsSUFBSSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUE7U0FDakM7UUFDRCxJQUFJLElBQUksTUFBTSxHQUFHLEdBQUcsR0FBRSxHQUFHLEdBQUUsUUFBUSxHQUFFLEdBQUcsR0FBRSxVQUFVLEdBQUUsR0FBRyxHQUFDLEVBQUUsR0FBRSxHQUFHLEdBQUMsU0FBUyxHQUFFLEdBQUcsR0FBRSxJQUFJLEdBQUUsR0FBRyxHQUFFLE1BQU0sR0FBQyxHQUFHLEdBQUMsVUFBVSxHQUFDLEdBQUcsR0FBQyxJQUFJLENBQUU7UUFDN0gsR0FBRyxFQUFFLENBQUM7UUFDTixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBQyxHQUFHLENBQUMsQ0FBQztLQUM1QjtJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRTVCLEtBQUssR0FBRyxLQUFLLEdBQUssY0FBYyxDQUFDO0lBQ2pDLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLEdBQUc7UUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUMsS0FBSyxDQUFDLENBQUE7SUFDaEMsQ0FBQyxDQUFDLENBQUM7QUFFUCxDQUFDO0FBRUQsU0FBUyxFQUFFLENBQUMifQ==