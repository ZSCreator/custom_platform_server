'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const RedisManager = require("../../app/dao/dbManager/redisManager");
const doJob = async () => {
    await DatabaseService.getRedisClient();
    let keys = await RedisManager.getKeysSatisfyPattern("real_player_info:*");
    console.log(`目标用户 ${keys.length}`);
    let i = 1;
    for (let k of keys) {
        let v = await RedisManager.getObjectFromRedis(k);
        if (v && v.data && v.data.yesterdayPlayCommissionRatio instanceof Object) {
            console.log(`改变用户${k} ${v.data.uid} ${i++} of ${keys.length}`);
            let before = v.data.yesterdayPlayCommissionRatio;
            v.data.yesterdayPlayCommissionRatio = 0;
            console.log(`change ${JSON.stringify(before)} => ${v.data.yesterdayPlayCommissionRatio}`);
            await RedisManager.setObjectIntoRedisHasExpiration(k, v, 3600);
        }
    }
    console.log(`任务完成`);
};
doJob();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmF0Y2hVcGRhdGVSZWRpcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL2hvdGZpeC9iYXRjaFVwZGF0ZVJlZGlzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixzRUFBdUU7QUFDdkUscUVBQXNFO0FBRXRFLE1BQU0sS0FBSyxHQUFHLEtBQUssSUFBSSxFQUFFO0lBRXJCLE1BQU0sZUFBZSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3ZDLElBQUksSUFBSSxHQUFHLE1BQU0sWUFBWSxDQUFDLHFCQUFxQixDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNWLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFO1FBQ2hCLElBQUksQ0FBQyxHQUFHLE1BQU0sWUFBWSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBR2pELElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsWUFBWSxNQUFNLEVBQUU7WUFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUMvRCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDO1lBQ2pELENBQUMsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEdBQUcsQ0FBQyxDQUFDO1lBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxDQUFDO1lBQzFGLE1BQU0sWUFBWSxDQUFDLCtCQUErQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDbEU7S0FDSjtJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEIsQ0FBQyxDQUFDO0FBRUYsS0FBSyxFQUFFLENBQUMifQ==