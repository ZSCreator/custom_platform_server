'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainRemote = void 0;
const TeenPattiMgr_1 = require("../lib/TeenPattiMgr");
const expandingMethod_1 = require("../../../services/robotRemoteService/expandingMethod");
const pinus_logger_1 = require("pinus-logger");
const langsrv = require("../../../services/common/langsrv");
const log_logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const ApiResultDTO_1 = require("../../../common/pojo/dto/ApiResultDTO");
function default_1(app) {
    return new mainRemote(app);
}
exports.default = default_1;
class mainRemote {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
        this.roomManager = TeenPattiMgr_1.default;
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
    async entry({ player, nid, roomId, sceneId }) {
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
            console.error('entry.zhajinhua==>', error);
            return { code: 500, msg: '创建房间失败' };
        }
    }
    ;
    async exit({ nid, sceneId, roomId, player }) {
        const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
        if (!roomInfo) {
            return { code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}` };
        }
        const playerInfo = roomInfo ? roomInfo.getPlayer(player.uid) : null;
        if (!roomInfo || !playerInfo) {
            return { code: 200, msg: '' };
        }
        if (playerInfo.status == 'GAME') {
            return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1050) };
        }
        roomInfo.leave(playerInfo, false);
        return { code: 200, msg: '' };
    }
    ;
    async leave({ uid, sceneId, roomId, group_id, lineCode }) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                return { code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}` };
            }
            const playerInfo = roomInfo ? roomInfo.getPlayer(uid) : null;
            if (!playerInfo) {
                this.roomManager.removePlayer({ uid, group_id, lineCode });
                return { code: 200, msg: '玩家正在游戏中' };
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
            return { code: 500, msg: error };
        }
    }
    async rpcLowerPlayer({ uid, sceneId, roomId }) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                return { code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}` };
            }
            const playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                return { code: 200 };
            }
            if (roomInfo.status == "INGAME" && playerInfo.is_settlement == false) {
                return { code: 500 };
            }
            else {
                roomInfo.leave(playerInfo, false);
                return { code: 200 };
            }
        }
        catch (error) {
            log_logger.error('TeenPatti|async  rpcLowerPlayer==>', error);
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
            log_logger.warn('TeenPatti|reconnectBeforeEntryRoom', error);
            return { code: 500, msg: '' };
        }
    }
    MessageDispatch(Message_Id, data) {
        return expandingMethod_1.default.MessageDispatch(Message_Id, this.app, data);
    }
    async exitEx(sceneId, roomId, uid) {
        const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
        if (!roomInfo) {
            return { code: 200, msg: `not find roomCode:${roomId}` };
        }
        const currPlayer = roomInfo ? roomInfo.getPlayer(uid) : null;
        if (currPlayer) {
            if (roomInfo.status === 'INGAME' && currPlayer.status === 'GAME') {
                return { code: 500, msg: langsrv.getlanguage(currPlayer.language, langsrv.Net_Message.id_1050) };
            }
            roomInfo.leave(currPlayer, false);
        }
        return { code: 200, msg: '' };
    }
    ;
    leaveGameAndBackToHall(player) {
        this.roomManager.removePlayer(player);
        return { code: 200 };
    }
}
exports.mainRemote = mainRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1RlZW5QYXR0aS9yZW1vdGUvbWFpblJlbW90ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHNEQUFnRTtBQUNoRSwwRkFBbUY7QUFDbkYsK0NBQXlDO0FBQ3pDLDREQUE2RDtBQUM3RCxNQUFNLFVBQVUsR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRXZELHdFQUFpRTtBQVlqRSxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBRkQsNEJBRUM7QUFHRCxNQUFhLFVBQVU7SUFJbkIsWUFBWSxHQUFnQjtRQUN4QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsV0FBVyxHQUFHLHNCQUFXLENBQUM7SUFDbkMsQ0FBQztJQUlNLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBZTtRQUNwQyxJQUFJO1lBQ0EsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7U0FDbEM7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN4QyxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxH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