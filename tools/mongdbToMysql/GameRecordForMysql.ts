
import DatabaseService = require("../../app/services/databaseService");
import MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
import GameRecordMysqlDao from '../../app/common/dao/mysql/GameRecord.mysql.dao';
import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import * as moment from "moment";
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});

RDSClient.demoInit();
const GameRecord = MongoManager.game_record;
async function clean() {
    console.warn(`开始执行`);
    const startTime = "2021-01-10 10:21:12";   //自己输入时间
    const endTime = "2021-05-10 10:21:12";     //自己输入时间
    let startDate = new Date(startTime); //时间对象
    let endDate = new Date(endTime); //时间对象
    let startTimeTemp = startDate.getTime();
    let endTimeTemp = endDate.getTime();
    console.warn(startTimeTemp);
    console.warn(endTimeTemp);
    let where = {createTime:{$gt:startTimeTemp , $lt:endTimeTemp }}
    const length = await GameRecord.countDocuments(where);
    let size = 5000;
    console.warn("length..",length)
    let num = Math.floor(length / size);
    let insertNum = 0;
    for(let i = 0 ; i <= num ; i++ ){
        const records = await GameRecord.find(where).sort({createTime: 1}).skip(i * size).limit(size);
        for(let item of records) {
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

                isDealer: item.isDealer ,

                result: item.result ?  item.result : null,

                gold: item.gold,

                input: item.input,

                validBet: item.validBet,

                profit: item.profit,

                way: 4,

                targetCharacter: 2,

                bet_commission:item.bet_commission,

                win_commission: item.win_commission,

                settle_commission: item.settle_commission,

                multiple: item.multiple ? item.multiple  : 0 ,

                status: item.playStatus,

                gameOrder:`${item._id}`,

                createTimeDate: new Date(moment(item.createTime).format("YYYY-MM-DD HH:mm:ss") ),

                game_Records_live_result : null,
            };
            // console.warn(info)
            await GameRecordMysqlDao.insertOne(info);
            insertNum++;
            console.warn(`完成:${item.uid},第${insertNum}条`)
        }
    }
    console.warn(`执行完成`);
    process.exit();
    return;
}
setTimeout(clean, 2000);