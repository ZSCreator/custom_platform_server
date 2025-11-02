'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const baicaoMgr_1 = require("../lib/baicaoMgr");
const sessionService = require("../../../services/sessionService");
const pinus_logger_1 = require("pinus-logger");
const LoggerErr = (0, pinus_logger_1.getLogger)('server_out', __filename);
const langsrv = require("../../../services/common/langsrv");
async function check(sceneId, roomId, uid, language) {
    const roomInfo = await baicaoMgr_1.default.getRoom(sceneId, roomId);
    if (!roomInfo) {
        LoggerErr.info(`error ==> mainHandler==>process函数 | 玩家${uid}: 未在游戏场${sceneId}找到对应房间`);
        return { err: langsrv.getlanguage(language, langsrv.Net_Message.id_2004) };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        LoggerErr.info(`error ==> mainHandler==>process函数 | 玩家${uid}: 未在游戏场${sceneId}房间${roomId}找到对应玩家`);
        return { err: langsrv.getlanguage(language, langsrv.Net_Message.id_2004) };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo };
}
function default_1(app) {
    return new mainHandler(app);
}
exports.default = default_1;
;
class mainHandler {
    constructor(app) {
        this.app = app;
    }
    async loaded({}, session) {
        const { uid, roomId, sceneId, language } = sessionService.sessionInfo(session);
        const { err, roomInfo, playerInfo } = await check(sceneId, roomId, uid, language);
        if (err)
            return { code: 501, error: err };
        try {
            if (playerInfo.status == `NONE`) {
                playerInfo.status = `WAIT`;
            }
            roomInfo.wait(playerInfo);
            return {
                code: 200, room: {
                    sceneId: roomInfo.sceneId,
                    roomId: roomInfo.roomId,
                    roundId: roomInfo.roundId,
                    status: roomInfo.status,
                    players: roomInfo.players.map(pl => pl && pl.strip()),
                    countdown: roomInfo.toStatusTime(),
                    total_bet: roomInfo.total_bet,
                    lowBet: roomInfo.lowBet,
                }
            };
        }
        catch (e) {
            LoggerErr.info(`baicao.mainHandler.loaded ==> 加载游戏出错  ${JSON.stringify(e)}`);
            return { code: 500, msg: e };
        }
    }
    ;
}
exports.mainHandler = mainHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9iYWljYW8vaGFuZGxlci9tYWluSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUdiLGdEQUF5RDtBQUN6RCxtRUFBb0U7QUFDcEUsK0NBQXlDO0FBQ3pDLE1BQU0sU0FBUyxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDdEQsNERBQTZEO0FBRTdELEtBQUssVUFBVSxLQUFLLENBQUMsT0FBZSxFQUFFLE1BQWMsRUFBRSxHQUFXLEVBQUUsUUFBZ0I7SUFDL0UsTUFBTSxRQUFRLEdBQUcsTUFBTSxtQkFBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFMUQsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNYLFNBQVMsQ0FBQyxJQUFJLENBQUMseUNBQXlDLEdBQUcsVUFBVSxPQUFPLFFBQVEsQ0FBQyxDQUFDO1FBQ3RGLE9BQU8sRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO0tBQzlFO0lBRUQsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQyxJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ2IsU0FBUyxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsR0FBRyxVQUFVLE9BQU8sS0FBSyxNQUFNLFFBQVEsQ0FBQyxDQUFDO1FBQ2pHLE9BQU8sRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO0tBQzlFO0lBQ0QsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3pCLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLENBQUM7QUFDcEMsQ0FBQztBQUNELG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQUFBLENBQUM7QUFFRixNQUFhLFdBQVc7SUFDcEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtJQUNwQyxDQUFDO0lBUUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFHLEVBQUUsT0FBdUI7UUFDckMsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0UsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFbEYsSUFBSSxHQUFHO1lBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBRTFDLElBQUk7WUFDQSxJQUFJLFVBQVUsQ0FBQyxNQUFNLElBQUksTUFBTSxFQUFFO2dCQUM3QixVQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzthQUM5QjtZQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDMUIsT0FBTztnQkFDSCxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtvQkFDYixPQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU87b0JBQ3pCLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtvQkFDdkIsT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPO29CQUN6QixNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU07b0JBQ3ZCLE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ3JELFNBQVMsRUFBRSxRQUFRLENBQUMsWUFBWSxFQUFFO29CQUNsQyxTQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVM7b0JBQzdCLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtpQkFDMUI7YUFDSixDQUFDO1NBQ0w7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLFNBQVMsQ0FBQyxJQUFJLENBQUMseUNBQXlDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzdFLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztTQUNoQztJQUNMLENBQUM7SUFBQSxDQUFDO0NBQ0w7QUF0Q0Qsa0NBc0NDIn0=