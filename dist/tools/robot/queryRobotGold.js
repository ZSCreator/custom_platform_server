#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const RedisManager = require("../../app/dao/dbManager/redisManager");
const doJob = async () => {
    await DatabaseService.getRedisClient();
    let keys = await RedisManager.getKeysSatisfyPattern("robot_player_info:*");
    console.log(`目标机器人 ${keys.length}`);
    const array = [];
    for (let k of keys) {
        let v = await RedisManager.getObjectFromRedis(k);
        array.push({ gold: Math.floor(v.data.gold / 100), uid: v.data.uid });
    }
    array.sort(function (b, a) {
        if (a.gold > b.gold) {
            return 1;
        }
        else if (a.gold === b.gold) {
            return 0;
        }
        else {
            return -1;
        }
    });
    array.forEach(m => {
        console.log(`${m.uid}\t${m.gold}`);
    });
    console.log(`任务完成`);
    process.exit();
};
doJob();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlSb2JvdEdvbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9yb2JvdC9xdWVyeVJvYm90R29sZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxzRUFBdUU7QUFDdkUscUVBQXNFO0FBQ3RFLE1BQU0sS0FBSyxHQUFHLEtBQUssSUFBSSxFQUFFO0lBRXJCLE1BQU0sZUFBZSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3ZDLElBQUksSUFBSSxHQUFHLE1BQU0sWUFBWSxDQUFDLHFCQUFxQixDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDM0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBR3BDLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNqQixLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRTtRQUNoQixJQUFJLENBQUMsR0FBRyxNQUFNLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRCxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztLQUN4RTtJQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRTtZQUNqQixPQUFPLENBQUMsQ0FBQztTQUNaO2FBQU0sSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUU7WUFDMUIsT0FBTyxDQUFDLENBQUM7U0FDWjthQUFNO1lBQ0gsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNiO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDdkMsQ0FBQyxDQUFDLENBQUE7SUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDLENBQUM7QUFFRixLQUFLLEVBQUUsQ0FBQyJ9