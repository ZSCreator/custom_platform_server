"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainRemote = void 0;
const pinus_1 = require("pinus");
const ldMgr_1 = require("../lib/ldMgr");
const expandingMethod_1 = require("../../../services/robotRemoteService/expandingMethod");
const langsrv = require("../../../services/common/langsrv");
const ApiResultDTO_1 = require("../../../common/pojo/dto/ApiResultDTO");
function default_1(app) {
    return new mainRemote(app);
}
exports.default = default_1;
;
class mainRemote {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_1.getLogger)('server_out', __filename);
        this.roomManager = ldMgr_1.default;
    }
    async entryScenes(msg) {
        try {
            this.roomManager.getTenantScene(msg.player);
            this.roomManager.addPlayer(msg.player);
            return { code: 200, data: "" };
        }
        catch (error) {
            this.logger.error('entryScenes', error);
            return { code: 500, msg: langsrv.getlanguage(null, langsrv.Net_Message.id_1213) };
        }
    }
    async entry({ player, sceneId, roomId, nid }) {
        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);
            if (!room) {
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012) };
            }
            const result = room.addPlayerInRoom(player);
            if (!result) {
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012) };
            }
            this.roomManager.recordPlayerSeat(player.uid, sceneId, room.roomId);
            return { code: 200, roomId: room.roomId };
        }
        catch (error) {
            console.warn('async entrydoudizhu==>', error);
            return { code: 500, msg: '创建房间失败' };
        }
    }
    ;
    async exit({ nid, sceneId, roomId, player }) {
        const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
        if (!roomInfo) {
            return { code: 200, msg: `not find roomCode:${roomId}` };
        }
        const playerInfo = roomInfo ? roomInfo.getPlayer(player.uid) : null;
        if (playerInfo && playerInfo.status == "GAME") {
            return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1052) };
        }
        playerInfo && roomInfo.leave(playerInfo, false);
        return { code: 200, msg: '' };
    }
    ;
    async leave({ uid, sceneId, roomId, group_id, lineCode }) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                return { code: 200, msg: `not find roomCode:${roomId}` };
            }
            const playerInfo = roomInfo ? roomInfo.getPlayer(uid) : null;
            if (!playerInfo) {
                this.roomManager.removePlayer({ uid, group_id, lineCode });
                return { code: 200, msg: '未找到玩家' };
            }
            if (playerInfo.status == "GAME") {
                roomInfo.leave(playerInfo, true);
                return { code: 500, msg: '玩家正在游戏中' };
            }
            roomInfo.leave(playerInfo, false);
            this.roomManager.removePlayer(playerInfo);
            return { code: 200, msg: '' };
        }
        catch (error) {
            return { code: 500, msg: JSON.stringify(error) };
        }
    }
    ;
    async rpcLowerPlayer({ uid, sceneId, roomId }) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                return { code: 200, msg: `not find roomCode:${roomId}` };
            }
            const playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                return { code: 200 };
            }
            return { code: 500 };
        }
        catch (error) {
            console.error('LuckyDice|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }
    ;
    async reconnectBeforeEntryRoom({ uid }) {
        const apiResult = new ApiResultDTO_1.default();
        try {
            const seat = this.roomManager.getPlayerSeat(uid);
            if (!seat) {
                return apiResult;
            }
            const room = this.roomManager.searchRoom(seat.sceneId, seat.roomId);
            const player = room.getPlayer(uid);
            if (player) {
                player.onLine = true;
                apiResult.code = 200;
            }
            else {
                this.roomManager.removePlayerSeat(uid);
            }
            return apiResult;
        }
        catch (error) {
            console.warn('async  leave==>', error);
            return { code: 500, msg: '' };
        }
    }
    MessageDispatch(Message_Id, data) {
        return expandingMethod_1.default.MessageDispatch(Message_Id, this.app, data);
    }
    leaveGameAndBackToHall(player) {
        this.roomManager.removePlayer(player);
        return { code: 200 };
    }
}
exports.mainRemote = mainRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0x1Y2t5RGljZS9yZW1vdGUvbWFpblJlbW90ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBcUY7QUFDckYsd0NBQXlEO0FBQ3pELDBGQUFtRjtBQUNuRiw0REFBNkQ7QUFFN0Qsd0VBQWlFO0FBWWpFLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFGRCw0QkFFQztBQUFBLENBQUM7QUFFRixNQUFhLFVBQVU7SUFJbkIsWUFBWSxHQUFnQjtRQUN4QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSxpQkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsV0FBVyxHQUFHLGVBQVcsQ0FBQztJQUNuQyxDQUFDO0lBSU0sS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFlO1FBQ3BDLElBQUk7WUFDQSxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQztTQUNsQztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7U0FDckY7SUFDTCxDQUFDO0lBSUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtRQUN4QyxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUcvRCxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNQLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2FBQ2hHO1lBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU1QyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNULE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFBO2FBQy9GO1lBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFcEUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUM3QztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM5QyxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBQUEsQ0FBQztJQUtGLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUU7UUFDdkMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDWCxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUscUJBQXFCLE1BQU0sRUFBRSxFQUFFLENBQUM7U0FDNUQ7UUFHRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDcEUsSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxNQUFNLEVBQUU7WUFDM0MsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7U0FDcEc7UUFDRCxVQUFVLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEQsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFBQSxDQUFDO0lBS0ssS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUU7UUFDM0QsSUFBSTtZQUNBLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNYLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFF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