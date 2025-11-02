"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
const GameRecord_mysql_dao_1 = require("../../app/common/dao/mysql/GameRecord.mysql.dao");
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const moment = require("moment");
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
RDSClient_1.RDSClient.demoInit();
const GameRecord = MongoManager.game_record;
async function clean() {
    console.warn(`开始执行`);
    const startTime = "2021-01-10 10:21:12";
    const endTime = "2021-05-10 10:21:12";
    let startDate = new Date(startTime);
    let endDate = new Date(endTime);
    let startTimeTemp = startDate.getTime();
    let endTimeTemp = endDate.getTime();
    console.warn(startTimeTemp);
    console.warn(endTimeTemp);
    let where = { createTime: { $gt: startTimeTemp, $lt: endTimeTemp } };
    const length = await GameRecord.countDocuments(where);
    let size = 5000;
    console.warn("length..", length);
    let num = Math.floor(length / size);
    let insertNum = 0;
    for (let i = 0; i <= num; i++) {
        const records = await GameRecord.find(where).sort({ createTime: 1 }).skip(i * size).limit(size);
        for (let item of records) {
            const info = {
                uid: item.uid,
                thirdUid: item.thirdUid ? item.thirdUid : null,
                gameName: item.gname,
                groupRemark: item.groupRemark ? item.groupRemark : null,
                nid: item.nid,
                sceneId: item.sceneId ? item.sceneId : -1,
                roomId: item.roomId ? item.roomId : '-1',
                playersNumber: item.playersNumber,
                roundId: item.roundId ? item.roundId : null,
                seat: item.seat,
                isDealer: item.isDealer,
                result: item.result ? item.result : null,
                gold: item.gold,
                input: item.input,
                validBet: item.validBet,
                profit: item.profit,
                way: 4,
                targetCharacter: 2,
                bet_commission: item.bet_commission,
                win_commission: item.win_commission,
                settle_commission: item.settle_commission,
                multiple: item.multiple ? item.multiple : 0,
                status: item.playStatus,
                gameOrder: `${item._id}`,
                createTimeDate: new Date(moment(item.createTime).format("YYYY-MM-DD HH:mm:ss")),
                game_Records_live_result: null,
            };
            await GameRecord_mysql_dao_1.default.insertOne(info);
            insertNum++;
            console.warn(`完成:${item.uid},第${insertNum}条`);
        }
    }
    console.warn(`执行完成`);
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVJlY29yZEZvck15c3FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvbW9uZ2RiVG9NeXNxbC9HYW1lUmVjb3JkRm9yTXlzcWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxzRUFBdUU7QUFDdkUsOEVBQStFO0FBQy9FLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBQ3RELDBGQUFpRjtBQUNqRix3RUFBcUU7QUFDckUsaUNBQWlDO0FBQ2pDLGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ2xDLENBQUMsQ0FBQztBQUVILHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDckIsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQztBQUM1QyxLQUFLLFVBQVUsS0FBSztJQUNoQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JCLE1BQU0sU0FBUyxHQUFHLHFCQUFxQixDQUFDO0lBQ3hDLE1BQU0sT0FBTyxHQUFHLHFCQUFxQixDQUFDO0lBQ3RDLElBQUksU0FBUyxHQUFHLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BDLElBQUksT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hDLElBQUksYUFBYSxHQUFHLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN4QyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzFCLElBQUksS0FBSyxHQUFHLEVBQUMsVUFBVSxFQUFDLEVBQUMsR0FBRyxFQUFDLGFBQWEsRUFBRyxHQUFHLEVBQUMsV0FBVyxFQUFFLEVBQUMsQ0FBQTtJQUMvRCxNQUFNLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdEQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQy9CLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3BDLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNsQixLQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRyxDQUFDLElBQUksR0FBRyxFQUFHLENBQUMsRUFBRSxFQUFFO1FBQzVCLE1BQU0sT0FBTyxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxVQUFVLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5RixLQUFJLElBQUksSUFBSSxJQUFJLE9BQU8sRUFBRTtZQUNyQixNQUFNLElBQUksR0FBRztnQkFDVCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7Z0JBRWIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBRTlDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSztnQkFFcEIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBRXZELEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztnQkFFYixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV6QyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFFeEMsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO2dCQUVqQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFFM0MsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUVmLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFFdkIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBRXpDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFFZixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7Z0JBRWpCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFFdkIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2dCQUVuQixHQUFHLEVBQUUsQ0FBQztnQkFFTixlQUFlLEVBQUUsQ0FBQztnQkFFbEIsY0FBYyxFQUFDLElBQUksQ0FBQyxjQUFjO2dCQUVsQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7Z0JBRW5DLGlCQUFpQixFQUFFLElBQUksQ0FBQyxpQkFBaUI7Z0JBRXpDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUU1QyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVU7Z0JBRXZCLFNBQVMsRUFBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBRXZCLGNBQWMsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFFO2dCQUVoRix3QkFBd0IsRUFBRyxJQUFJO2FBQ2xDLENBQUM7WUFFRixNQUFNLDhCQUFrQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6QyxTQUFTLEVBQUUsQ0FBQztZQUNaLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUE7U0FDaEQ7S0FDSjtJQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2YsT0FBTztBQUNYLENBQUM7QUFDRCxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDIn0=