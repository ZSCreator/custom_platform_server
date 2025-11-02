"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const Game_manager_1 = require("../../app/common/dao/daoManager/Game.manager");
const Scene_manager_1 = require("../../app/common/dao/daoManager/Scene.manager");
const Room_manager_1 = require("../../app/common//dao/daoManager/Room.manager");
RDSClient_1.RDSClient.demoInit();
const args = process.argv.splice(2);
console.log(args);
if (args.length == 0) {
    console.warn("传入参数  nid=10  则 输入 10即可");
    process.exit();
}
const nid = args[0];
console.warn(`游戏 nid=${nid}`);
function init() {
    if (nid == "all") {
        All_clean();
    }
    else {
        clean();
    }
}
async function clean() {
    await Game_manager_1.default.delete({ nid });
    const sceneList = await Scene_manager_1.default.findList({ nid });
    for (const sceneInfo of sceneList) {
        const scene = await Scene_manager_1.default.delete({ nid: sceneInfo.nid, sceneId: sceneInfo.sceneId });
    }
    const roomList = await Room_manager_1.default.findList({ nid });
    for (const roomInfo of roomList) {
        const room = await Room_manager_1.default.delete({ serverId: roomInfo.serverId, roomId: roomInfo.roomId });
    }
    console.log("clear all ok!!!!");
    process.exit();
}
async function All_clean() {
    let gamesList = await Game_manager_1.default.findList({}, true);
    console.warn(gamesList.map(c => c.nid));
    for (const game of gamesList) {
        const nid = game.nid;
        await Game_manager_1.default.delete({ nid });
        const sceneList = await Scene_manager_1.default.findList({ nid }, true);
        for (const sceneInfo of sceneList) {
            const scene = await Scene_manager_1.default.delete({ nid: sceneInfo.nid, sceneId: sceneInfo.sceneId });
        }
        const roomList = await Room_manager_1.default.findList({ nid }, true);
        for (const roomInfo of roomList) {
            const room = await Room_manager_1.default.delete({ serverId: roomInfo.serverId, roomId: roomInfo.roomId });
        }
        console.log("clear all ok!!!!", nid);
    }
    process.exit();
}
setTimeout(init, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYXJHYW1lU2NlbmVSb29tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvc3lzdGVtL2NsZWFyR2FtZVNjZW5lUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBSWIsd0VBQXFFO0FBRXJFLCtFQUEwRTtBQUMxRSxpRkFBNEU7QUFDNUUsZ0ZBQTJFO0FBQzNFLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7QUFLckIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO0lBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUN4QyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDbEI7QUFDRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFFOUIsU0FBUyxJQUFJO0lBQ1QsSUFBSSxHQUFHLElBQUksS0FBSyxFQUFFO1FBQ2QsU0FBUyxFQUFFLENBQUM7S0FDZjtTQUFNO1FBQ0gsS0FBSyxFQUFFLENBQUM7S0FDWDtBQUNMLENBQUM7QUFFRCxLQUFLLFVBQVUsS0FBSztJQUNoQixNQUFNLHNCQUFjLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUVyQyxNQUFNLFNBQVMsR0FBRyxNQUFNLHVCQUFlLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUMxRCxLQUFLLE1BQU0sU0FBUyxJQUFJLFNBQVMsRUFBRTtRQUMvQixNQUFNLEtBQUssR0FBRyxNQUFNLHVCQUFlLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0tBQ2xHO0lBQ0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxzQkFBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDeEQsS0FBSyxNQUFNLFFBQVEsSUFBSSxRQUFRLEVBQUU7UUFDN0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxzQkFBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztLQUN0RztJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNoQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQUVELEtBQUssVUFBVSxTQUFTO0lBQ3BCLElBQUksU0FBUyxHQUFHLE1BQU0sc0JBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hELE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3hDLEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxFQUFFO1FBQzFCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDckIsTUFBTSxzQkFBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFckMsTUFBTSxTQUFTLEdBQUcsTUFBTSx1QkFBZSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hFLEtBQUssTUFBTSxTQUFTLElBQUksU0FBUyxFQUFFO1lBQy9CLE1BQU0sS0FBSyxHQUFHLE1BQU0sdUJBQWUsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7U0FDbEc7UUFDRCxNQUFNLFFBQVEsR0FBRyxNQUFNLHNCQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDOUQsS0FBSyxNQUFNLFFBQVEsSUFBSSxRQUFRLEVBQUU7WUFDN0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxzQkFBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztTQUN0RztRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDeEM7SUFFRCxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQUVELFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMifQ==