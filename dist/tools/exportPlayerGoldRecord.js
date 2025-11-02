'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../app/services/databaseService");
const hallConst = require("../app/consts/hallConst");
const databaseConst = require("../app/consts/databaseConst");
const recordManager = require("../app/dao/domainManager/record/recordManager");
const commonUtil = require("../app/utils/lottery/commonUtil");
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
    let info = 'ID,时间,改变类型,改变金币,当前金币,场id,节id,押注事件';
    const footballRecord = await recordManager.findRecordList({
        uid: '19422884',
        nid: hallConst.SERVER.FOOTBALL.NID
    }, null, { sort: { time: -1 } });
    let cnt = 0;
    for (let record of footballRecord) {
        info += "\r\n" + record.uid + "," + commonUtil.getYearMonthDayHourMinuteSeconds(record.time) +
            ',' + (record.change_type === databaseConst.GOLD_CHANGE_TYPE.BET ? '押注' : '赢取') + ','
            + record.changed_gold + ',' + record.current_gold + ',' + record.match_id + ',' + record.quarter_id + ',' + (record.bet_event ? record.bet_event : '');
        cnt++;
        console.log("当前处理:", cnt);
    }
    console.log('__dirname..', __dirname);
    let paths = path.resolve(__dirname, './data/');
    console.log('paths', paths);
    paths = paths + '/football_bet_record.csv';
    fs.writeFile(paths, info, function (err) {
        console.log("文件生成地址：" + paths);
    });
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0UGxheWVyR29sZFJlY29yZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rvb2xzL2V4cG9ydFBsYXllckdvbGRSZWNvcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUdiLG1FQUFvRTtBQUNwRSxxREFBc0Q7QUFDdEQsNkRBQThEO0FBQzlELCtFQUFnRjtBQUNoRiw4REFBK0Q7QUFDL0QsNkJBQThCO0FBQzlCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ25ELHlCQUEwQjtBQUUxQixlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDN0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNsQyxDQUFDLENBQUM7QUFFSCxLQUFLLFVBQVUsU0FBUztJQUNwQixJQUFJLElBQUksR0FBRyxtQ0FBbUMsQ0FBQztJQUMvQyxNQUFNLGNBQWMsR0FBRyxNQUFNLGFBQWEsQ0FBQyxjQUFjLENBQUM7UUFDdEQsR0FBRyxFQUFFLFVBQVU7UUFDZixHQUFHLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRztLQUNyQyxFQUFFLElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBQyxFQUFDLENBQUMsQ0FBQztJQUM3QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDWixLQUFLLElBQUksTUFBTSxJQUFJLGNBQWMsRUFBRTtRQUMvQixJQUFJLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLFVBQVUsQ0FBQyxnQ0FBZ0MsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ3hGLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEtBQUssYUFBYSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHO2NBQ25GLE1BQU0sQ0FBQyxZQUFZLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxZQUFZLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0osR0FBRyxFQUFFLENBQUM7UUFDTixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztLQUM3QjtJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3RDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRTVCLEtBQUssR0FBRyxLQUFLLEdBQUcsMEJBQTBCLENBQUM7SUFDM0MsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsR0FBRztRQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQTtJQUNsQyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxTQUFTLEVBQUUsQ0FBQyJ9