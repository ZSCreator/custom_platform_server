#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerManager = require("../../app/dao/domainManager/hall/playerManager");
const OnlineGameHashDao_1 = require("../../app/common/dao/redis/OnlineGameHashDao");
const doJob = async (uid) => {
    const object = await OnlineGameHashDao_1.findByUid(uid);
    if (!object) {
        console.error(`${uid} 不在线`);
    }
    else {
        const { player, lock } = await PlayerManager.getPlayer({ uid }, false, false);
        console.log(`${uid} ${player.sid} 游戏${object.nid} 场${object.sceneId} 房间${object.roomId}`);
    }
    process.exit();
};
if (!process.argv[2]) {
    console.error('请输入UID');
    process.exit(100);
}
doJob(process.argv[2]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZEJ5VWlkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvcm9ib3QvZmluZEJ5VWlkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLGdGQUFpRjtBQUNqRixvRkFBeUU7QUFFekUsTUFBTSxLQUFLLEdBQUcsS0FBSyxFQUFFLEdBQVcsRUFBRSxFQUFFO0lBQ2hDLE1BQU0sTUFBTSxHQUFHLE1BQU0sNkJBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1QsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUM7S0FDL0I7U0FBTTtRQUNILE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsTUFBTSxNQUFNLENBQUMsR0FBRyxLQUFLLE1BQU0sQ0FBQyxPQUFPLE1BQU0sTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7S0FDN0Y7SUFDRCxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsQ0FBQyxDQUFBO0FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3JCO0FBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyJ9