
import DatabaseService = require("../../app/services/databaseService");
import MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
import PlayerAgentMysqlDao from '../../app/common/dao/mysql/PlayerAgent.mysql.dao';
import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});

RDSClient.demoInit();
const InfiniteAgentInfo = MongoManager.infinite_agent_info;
async function clean() {
    console.warn(`开始执行`);
    const records = await InfiniteAgentInfo.find({});
    let num = 0;
    for(let item of records) {
        if(item.agentLevel !== 0){
            let roleType = 1;
            if(item.agentLevel == 1){
                roleType = 2;
            }else if(item.agentLevel == 2){
                roleType = 3;
            }
            console.warn(`uid:${item.uid},gold:${Math.abs(item.gold)}`)
            const info = {
                uid: item.uid,
                platformName: item.remark ? item.remark : item.uid,
                platformGold: Math.abs(item.gold),
                rootUid: item.group_id,
                parentUid: item.superior ? item.superior : '',
                deepLevel: item.agentLevel,
                roleType: roleType,
                status : 1,
            }
            await PlayerAgentMysqlDao.insertOne(info);
            num ++ ;
            console.warn(`完成:${item.uid},第${num}条`)
        }
    }
    console.warn(`执行完成`);
    process.exit();
    return;

}
setTimeout(clean, 2000);