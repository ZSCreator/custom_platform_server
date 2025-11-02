"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeSession = void 0;
const pinus_1 = require("pinus");
const Game_manager_1 = require("../../dao/daoManager/Game.manager");
const ApiResult_1 = require("../../pojo/ApiResult");
const systemState_1 = require("../../systemState");
const PlayersInRoom_redis_dao_1 = require("../../dao/redis/PlayersInRoom.redis.dao");
const RoleEnum_1 = require("../../constant/player/RoleEnum");
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const pinus_logger_1 = require("pinus-logger");
const PositionEnum_1 = require("../../constant/player/PositionEnum");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
async function closeSession(backendServerId, nid, sceneId, roomId, player) {
    try {
        const { name } = await Game_manager_1.default.findOne({ nid });
        const { uid, language, isRobot } = player;
        if (!pinus_1.pinus.app.rpc[name]) {
            return new ApiResult_1.ApiResult(systemState_1.hallState.Game_Not_Open, [], '游戏暂未开放，即将上线');
        }
        const [{ code, msg }] = await pinus_1.pinus.app.rpc[name].mainRemote.leave.toServer('*', {
            uid, language, nid, sceneId, roomId, group_id: player.group_id, lineCode: player.lineCode
        });
        if (code === 200) {
            if (backendServerId !== undefined) {
                await PlayersInRoom_redis_dao_1.default.delete(backendServerId, roomId, uid, isRobot);
            }
            if (isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER) {
                await Player_manager_1.default.updateOne({ uid }, {
                    position: PositionEnum_1.PositionEnum.HALL,
                    kickself: false,
                    abnormalOffline: false,
                    lastLogoutTime: new Date(),
                    sid: null,
                });
            }
        }
        else {
            if (isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER) {
                logger.debug(`${pinus_1.pinus.app.getServerId()} | RPC玩家离线退出玩家出错: uid ${uid} nid: ${nid}, sceneId: ${sceneId}, roomId: ${roomId}, serverId: ${backendServerId}, msg: ${msg}`);
            }
        }
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | RPC玩家离线出错:${e.stack}`);
    }
}
exports.closeSession = closeSession;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Vzc2lvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2V2ZW50L3NlcnZpY2UvU2Vzc2lvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQThCO0FBQzlCLG9FQUE0RDtBQUM1RCxvREFBaUQ7QUFDakQsbURBQThDO0FBQzlDLHFGQUF1RTtBQUN2RSw2REFBMEQ7QUFFMUQsa0ZBQTZFO0FBQzdFLCtDQUF5QztBQUN6QyxxRUFBa0U7QUFJbEUsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUU1QyxLQUFLLFVBQVUsWUFBWSxDQUFDLGVBQXVCLEVBQUUsR0FBVyxFQUFFLE9BQWUsRUFBRSxNQUFjLEVBQUcsTUFBa0M7SUFDekksSUFBSTtRQUNBLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLHNCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNwRCxNQUFNLEVBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUMsR0FBRyxNQUFNLENBQUM7UUFHeEMsSUFBSSxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sSUFBSSxxQkFBUyxDQUFDLHVCQUFTLENBQUMsYUFBYSxFQUFFLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztTQUNwRTtRQUlELE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLE1BQU0sYUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQzdFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRO1NBQUUsQ0FBQyxDQUFDO1FBRWpHLElBQUksSUFBSSxLQUFLLEdBQUcsRUFBRTtZQUNkLElBQUksZUFBZSxLQUFLLFNBQVMsRUFBRTtnQkFDL0IsTUFBTSxpQ0FBZ0IsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFHeEU7WUFFRCxJQUFJLE9BQU8sS0FBSyxtQkFBUSxDQUFDLFdBQVcsRUFBRTtnQkFDbEMsTUFBTSx3QkFBZ0IsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFDcEM7b0JBQ0ksUUFBUSxFQUFFLDJCQUFZLENBQUMsSUFBSTtvQkFDM0IsUUFBUSxFQUFFLEtBQUs7b0JBQ2YsZUFBZSxFQUFFLEtBQUs7b0JBQ3RCLGNBQWMsRUFBRSxJQUFJLElBQUksRUFBRTtvQkFDMUIsR0FBRyxFQUFFLElBQUk7aUJBQ1osQ0FDSixDQUFDO2FBQ0w7U0FDSjthQUFNO1lBQ0gsSUFBSSxPQUFPLEtBQUssbUJBQVEsQ0FBQyxXQUFXLEVBQUU7Z0JBQ2xDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSx5QkFBeUIsR0FBRyxTQUFTLEdBQUcsY0FBYyxPQUFPLGFBQWEsTUFBTSxlQUFlLGVBQWUsVUFBVSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2FBQ3pLO1NBQ0o7S0FFSjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUNyRTtBQUNMLENBQUM7QUExQ0Qsb0NBMENDIn0=