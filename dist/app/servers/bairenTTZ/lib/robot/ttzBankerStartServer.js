"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterTTZZhuang = void 0;
const ttzRobot_1 = require("./ttzRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const EventEmitter = require('events').EventEmitter;
const BairenNidEnum_1 = require("../../../../common/constant/game/BairenNidEnum");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const nid = BairenNidEnum_1.BairenNidEnum.ttz_zhuang;
const ttzRoomMgr_1 = require("../ttzRoomMgr");
function robotEnterTTZZhuang(Mode_IO = false) {
    const RoomMgr = ttzRoomMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterTTZZhuang = robotEnterTTZZhuang;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player, intoGold_arr) {
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    const ttzRobot = new ttzRobot_1.default({ Mode_IO, });
    try {
        ttzRobot.gold_min = intoGold_arr[0];
        ttzRobot.gold_max = intoGold_arr[1];
        if (Mode_IO) {
            await ttzRobot.enterHall(player, nid);
        }
        else {
            ttzRobot.enterHallMode(player, nid);
        }
        ttzRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        await ttzRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await ttzRobot.ttzLoaded();
        ttzRobot.registerListener();
    }
    catch (error) {
        robotlogger.warn(`ttz|SingleRobotEnter ==> ${JSON.stringify(error)}`);
        ttzRobot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHR6QmFua2VyU3RhcnRTZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9iYWlyZW5UVFovbGliL3JvYm90L3R0ekJhbmtlclN0YXJ0U2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBR2IseUNBQWtDO0FBQ2xDLHFHQUF5RztBQUN6RywrQ0FBeUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN2RCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxDQUFDO0FBRXBELGtGQUErRTtBQUMvRSxtRUFBbUU7QUFDbkUsTUFBTSxHQUFHLEdBQUcsNkJBQWEsQ0FBQyxVQUFVLENBQUM7QUFDckMsOENBQXVDO0FBR3ZDLFNBQWdCLG1CQUFtQixDQUFDLE9BQU8sR0FBRyxLQUFLO0lBQy9DLE1BQU0sT0FBTyxHQUFHLG9CQUFVLENBQUM7SUFDM0IsTUFBTSxXQUFXLEdBQUcsSUFBSSx1QkFBVyxFQUFFLENBQUM7SUFDdEMsV0FBVyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN4RyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDcEIsT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQztBQU5ELGtEQU1DO0FBQUEsQ0FBQztBQUVGLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsT0FBZSxFQUFFLE1BQWMsRUFBRSxPQUFnQixFQUFFLE1BQWUsRUFBRSxZQUFzQjtJQUNuSSxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1QsT0FBTztLQUNWO0lBQ0QsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFHNUUsTUFBTSxRQUFRLEdBQUcsSUFBSSxrQkFBUSxDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUM1QyxJQUFJO1FBQ0EsUUFBUSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEMsUUFBUSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFcEMsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3ZDO2FBQU07WUFDTCxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNyQztRQUVILFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRXpELE1BQU0sUUFBUSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDOUQsTUFBTSxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFM0IsUUFBUSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDL0I7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLFdBQVcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN0QjtBQUNMLENBQUMifQ==