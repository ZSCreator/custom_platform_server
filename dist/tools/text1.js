'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../app/services/databaseService");
const MongoManager = require("../app/common/dao/mongoDB/lib/mongoManager");
const game_record = MongoManager.game_record;
const dbMongo = require('../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function clean() {
    let length = 5;
    let _id = null;
    let startTime = 1590561103869;
    for (let i = 0; i < length; i++) {
        console.time('test' + i);
        let match = { createTime: { $gt: startTime } };
        if (_id) {
            match = { createTime: { $gt: startTime } };
        }
        const records = await game_record.find(match, '_id createTime').sort({ createTime: -1 }).limit(50000);
        console.log(`一共多少条${records.length},第一条的_id:${records[0]}`);
        console.log(`一共多少条${records.length},第一条的_id:${records[49999]}`);
        startTime = records[49999].createTime;
        console.timeEnd('test' + i);
    }
}
clean();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dDEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90b29scy90ZXh0MS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxZQUFZLENBQUM7O0FBS2IsbUVBQW9FO0FBS3BFLDJFQUE0RTtBQUk1RSxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsV0FBVyxDQUFDO0FBQzdDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBRW5ELGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDaEMsS0FBSyxFQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUMvQixNQUFNLEVBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ25DLENBQUMsQ0FBQztBQUVILEtBQUssVUFBVSxLQUFLO0lBQ2hCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNmLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztJQUNmLElBQUksU0FBUyxHQUFHLGFBQWEsQ0FBQztJQUM5QixLQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFDO1FBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLElBQUksS0FBSyxHQUFRLEVBQUUsVUFBVSxFQUFDLEVBQUMsR0FBRyxFQUFDLFNBQVMsRUFBQyxFQUFDLENBQUM7UUFDL0MsSUFBRyxHQUFHLEVBQUM7WUFDRixLQUFLLEdBQUksRUFBRSxVQUFVLEVBQUMsRUFBQyxHQUFHLEVBQUMsU0FBUyxFQUFDLEVBQUMsQ0FBQztTQUMzQztRQUNELE1BQU0sT0FBTyxHQUFHLE1BQU0sV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsRyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsT0FBTyxDQUFDLE1BQU0sWUFBWSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxPQUFPLENBQUMsTUFBTSxZQUFZLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEUsU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLENBQUM7UUFDdEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUUsQ0FBQyxDQUFDLENBQUM7S0FDOUI7QUFFTCxDQUFDO0FBR0QsS0FBSyxFQUFFLENBQUMifQ==