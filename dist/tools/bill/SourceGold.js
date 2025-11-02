#!/usr/bin/env node
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name
});
exports.single = async (uid) => {
    if (!uid || !/[0-9]+/.test(uid)) {
        console.error("请输入UID");
        process.exit();
    }
    const records = await MongoManager.game_record.find({ uid, playStatus: 1 }).sort({ createTime: 1 });
    console.log(`__比对开始__ 记录: ${records.length}条`);
    let lastRecord = null;
    let totalDiff = 0;
    for (let record of records) {
        if (lastRecord === null) {
            lastRecord = record;
            continue;
        }
        if (lastRecord.gold + record.profit !== record.gold) {
            console.log(`金币记录错误上 => ${new Date(lastRecord.createTime).toLocaleString()} 剩余金币=${lastRecord.gold}\t盈利=${lastRecord.profit}\t ${lastRecord.nid} ${lastRecord.gname}`);
            console.log(`金币记录错误下 => ${new Date(record.createTime).toLocaleString()} 剩余金币=${record.gold}\t盈利=${record.profit}\t${record.nid} ${record.gname}`);
            console.log(`实际金币 - 理论金币 = ${record.gold - lastRecord.gold - record.profit}`);
            totalDiff += (record.gold - lastRecord.gold - record.profit);
            console.log('---');
        }
        lastRecord = record;
    }
    console.log(`__比对结束__ 总差异: ${totalDiff}`);
    process.exit();
};
exports.single(process.argv[2]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU291cmNlR29sZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL2JpbGwvU291cmNlR29sZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFDOztBQUliLHNFQUF1RTtBQUN2RSw4RUFBa0Y7QUFDbEYsTUFBTyxPQUFPLEdBQVcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFFL0QsZUFBZSxDQUFDLGNBQWMsQ0FBQztJQUMzQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixLQUFLLEVBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0lBQzlCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7Q0FDbEMsQ0FBQyxDQUFDO0FBRVUsUUFBQSxNQUFNLEdBQUcsS0FBSyxFQUFFLEdBQVcsRUFBRSxFQUFFO0lBQ3hDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQzdCLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDdkIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2xCO0lBRUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwRyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUUvQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDdEIsSUFBSSxTQUFTLEdBQUksQ0FBQyxDQUFDO0lBQ25CLEtBQUssSUFBSSxNQUFNLElBQUksT0FBTyxFQUFFO1FBQ3hCLElBQUksVUFBVSxLQUFLLElBQUksRUFBRTtZQUNyQixVQUFVLEdBQUcsTUFBTSxDQUFDO1lBQ3BCLFNBQVM7U0FDWjtRQUdELElBQUksVUFBVSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxjQUFjLEVBQUUsU0FBUyxVQUFVLENBQUMsSUFBSSxRQUFRLFVBQVUsQ0FBQyxNQUFNLE1BQU0sVUFBVSxDQUFDLEdBQUcsSUFBSSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQTtZQUN0SyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLGNBQWMsRUFBRSxTQUFTLE1BQU0sQ0FBQyxJQUFJLFFBQVEsTUFBTSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO1lBR2pKLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUM5RSxTQUFTLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQzVELE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdEI7UUFDRCxVQUFVLEdBQUcsTUFBTSxDQUFDO0tBQ3ZCO0lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsU0FBUyxFQUFFLENBQUMsQ0FBQztJQUMxQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsQ0FBQyxDQUFBO0FBRUQsY0FBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSJ9