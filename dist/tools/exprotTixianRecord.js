'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../app/services/databaseService");
const MongoManager = require("../app/dao/dbManager/mongoManager");
const path = require("path");
const dbMongo = require('../config/db/mongo.json');
const commonUtil = require("../app/utils/lottery/commonUtil");
const InfiniteAgentManager = require("../app/dao/domainManager/hall/infiniteAgentManager");
const fs = require("fs");
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function statistic() {
    const tiXianRecord = MongoManager.getDao('tixian_money_record');
    const allTiXian = await tiXianRecord.find({}, null, { lean: true, sort: { createTime: -1 } });
    let info = 'id,uid,昵称,提现时间,提取金额,提取得到金额,开户行,银行卡号,持卡人,预留电话,累计已提现,累计已充值,提现状态,备注,所属大区';
    let cnt = 0;
    let inviteCodeInfo;
    let daqu;
    for (let temp of allTiXian) {
        inviteCodeInfo = await InfiniteAgentManager.findAgent({ uid: temp.uid }, 'group_id');
        daqu = inviteCodeInfo && inviteCodeInfo.group_id ? inviteCodeInfo.group_id : '';
        info += "\r\n" + temp.id + ',' + temp.uid + ',' + temp.nickname + ',' + commonUtil.getYearMonthDayHourMinuteSeconds(temp.createTime) + ',' + temp.moneyNum + ',' + temp.money + ','
            + temp.bankName + ',' + temp.bankCardNo + ',' + temp.bankCardName + ',' + temp.moblieNO + ',' + temp.selfTixian + ',' +
            temp.selfAddRmb + ',' + (temp.type === 0 ? '未审核' : (temp.type === 1 ? '通过' : '未通过')) + ',' + temp.remark + ',' + daqu;
        cnt++;
        console.log("当前处理:", cnt);
    }
    console.log('__dirname..', __dirname);
    let paths = path.resolve(__dirname, './data/');
    console.log('paths', paths);
    paths = paths + '/tiXianRecord.csv';
    fs.writeFile(paths, info, function (err) {
        console.log("文件生成地址：" + paths);
    });
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcm90VGl4aWFuUmVjb3JkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdG9vbHMvZXhwcm90VGl4aWFuUmVjb3JkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYixtRUFBb0U7QUFDcEUsa0VBQW1FO0FBQ25FLDZCQUE4QjtBQUM5QixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUNuRCw4REFBK0Q7QUFDL0QsMkZBQTRGO0FBQzVGLHlCQUEwQjtBQUMxQixlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDN0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNsQyxDQUFDLENBQUM7QUFFSCxLQUFLLFVBQVUsU0FBUztJQUNwQixNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDaEUsTUFBTSxTQUFTLEdBQUcsTUFBTyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBQyxFQUFDLENBQUMsQ0FBQztJQUUzRixJQUFJLElBQUksR0FBRyx1RUFBdUUsQ0FBQztJQUNuRixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDWixJQUFJLGNBQWMsQ0FBQztJQUNuQixJQUFJLElBQUksQ0FBQztJQUNULEtBQUssSUFBSSxJQUFJLElBQUksU0FBUyxFQUFFO1FBQ3hCLGNBQWMsR0FBRyxNQUFNLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFDLEVBQUMsVUFBVSxDQUFDLENBQUM7UUFDbEYsSUFBSSxHQUFHLGNBQWMsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDaEYsSUFBSSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsR0FBRyxVQUFVLENBQUMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUc7Y0FDN0ssSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHO1lBQ3JILElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDMUgsR0FBRyxFQUFFLENBQUM7UUFDTixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztLQUM3QjtJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3RDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRTVCLEtBQUssR0FBRyxLQUFLLEdBQUcsbUJBQW1CLENBQUM7SUFDcEMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsR0FBRztRQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQTtJQUNsQyxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUM7QUFFRCxTQUFTLEVBQUUsQ0FBQyJ9