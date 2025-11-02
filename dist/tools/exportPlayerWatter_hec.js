'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../app/services/databaseService");
const PlayerManager = require("../app/dao/domainManager/hall/playerManager");
const UserManager = require("../app/dao/domainManager/hall/userManager");
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
    let info = 'ID,昵称,注册时间,持有金币数,真实充值HEC数,客服充值HEC数,持有金币数 - 真实充值HEC数*10 - 客服充值HEC数*10,历史押注总流水,手机号';
    const filterFunc = player => player.isRobot === 0;
    const allPlayer = await PlayerManager.findPlayerList({ isRobot: 0 }, filterFunc, 'uid nickname createTime gold flowCount');
    const users = await UserManager.findUserList({}, 'cellPhone uid');
    console.log("总共需要处理人数:", allPlayer.length);
    let cnt = 0;
    for (let player of allPlayer) {
        let uid = player.uid;
        let nickname = player.nickname;
        let gold = Utils.sum(player.gold, true);
        let flowCount = player.flowCount;
        let createTime = Utils.cDate(player.createTime);
        let addRmb = 0;
        let vaddRmb = 0;
        let statisticGold = 0;
        let user = users.find(x => x.uid == uid);
        let cellPhone = user ? user.cellPhone : '';
        let playerPayRecords = await PayInfo.find({ uid: uid }, 'customerId total_fee');
        if (playerPayRecords.length != 0) {
            playerPayRecords.forEach(m => {
                console.log('m', m);
                if (!m.customerId) {
                    addRmb += m.total_fee;
                }
                else {
                    vaddRmb += m.total_fee;
                }
            });
        }
        statisticGold = gold - addRmb / 100 * 10 - vaddRmb / 100 * 10;
        info += "\r\n" + uid + "," + nickname + ',' + createTime + ',' + gold + ',' + addRmb / 100 + ',' + vaddRmb / 100 + ',' + statisticGold + ',' + flowCount + ',' + cellPhone;
        cnt++;
        console.log("当前处理:", cnt);
    }
    console.log('__dirname..', __dirname);
    let paths = path.resolve(__dirname, './data/');
    console.log('paths', paths);
    paths = paths + 'water_hec.csv';
    fs.writeFile(paths, info, function (err) {
        console.log("文件生成地址：" + paths);
    });
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0UGxheWVyV2F0dGVyX2hlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rvb2xzL2V4cG9ydFBsYXllcldhdHRlcl9oZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLG1FQUFvRTtBQUVwRSw2RUFBOEU7QUFDOUUseUVBQTBFO0FBQzFFLGtFQUFtRTtBQUNuRSxzQ0FBdUM7QUFDdkMsNkJBQThCO0FBQzlCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ25ELHlCQUEwQjtBQUMxQixlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQ2hDLEtBQUssRUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDL0IsTUFBTSxFQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNuQyxDQUFDLENBQUM7QUFFSCxLQUFLLFVBQVUsU0FBUztJQUNwQixNQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2hELElBQUksSUFBSSxHQUFFLGtGQUFrRixDQUFFO0lBQzlGLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUM7SUFDbEQsTUFBTSxTQUFTLEdBQUcsTUFBTSxhQUFhLENBQUMsY0FBYyxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxFQUFDLFVBQVUsRUFBRSx3Q0FBd0MsQ0FBQyxDQUFDO0lBQ3ZILE1BQU0sS0FBSyxHQUFHLE1BQU0sV0FBVyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUMsZUFBZSxDQUFDLENBQUM7SUFDakUs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