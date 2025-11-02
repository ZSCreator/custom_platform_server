"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainRemote = void 0;
const FisheryRoomManagerImpl_1 = require("../lib/FisheryRoomManagerImpl");
const pinus_logger_1 = require("pinus-logger");
const ApiResult_1 = require("../../../common/pojo/ApiResult");
const langsrv_1 = require("../../../services/common/langsrv");
const ApiResultDTO_1 = require("../../../common/pojo/dto/ApiResultDTO");
const fisheryLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function default_1(app) {
    return new MainRemote(app);
}
exports.default = default_1;
class MainRemote {
    constructor(app) {
        this.app = app;
    }
    async entry({ player, roomId, sceneId }) {
        try {
            const room = await FisheryRoomManagerImpl_1.default.getRoom(sceneId, roomId, player);
            if (!room) {
                return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_6) };
            }
            room.addPlayerInRoom(player);
            FisheryRoomManagerImpl_1.default.recordPlayerSeat(player.uid, sceneId, room.roomId);
            FisheryRoomManagerImpl_1.default.playerLeaveChannel(player);
            return { code: 200, roomId: room.roomId };
        }
        catch (error) {
            fisheryLogger.error('fishery.prototype.entry==>', error);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_6) };
        }
    }
    async exit({ sceneId, roomId, player }) {
        try {
            const room = FisheryRoomManagerImpl_1.default.searchRoom(sceneId, roomId);
            if (!room) {
                fisheryLogger.warn(`渔场大亨没有这个房间roomCode:${roomId}`);
                return { code: 200, msg: `` };
            }
            const roomPlayer = room.getPlayer(player.uid);
            if (!roomPlayer) {
                fisheryLogger.warn(`渔场大亨${roomId}房间没有这个玩家uid:${player.uid}`);
                return { code: 200, msg: `` };
            }
            if (roomPlayer.bet > 0) {
                return { code: 200, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1050) };
            }
            room.leave(roomPlayer, false);
            FisheryRoomManagerImpl_1.default.removePlayerSeat(player.uid);
            FisheryRoomManagerImpl_1.default.playerAddToChannel(player);
            return { code: 200, msg: `` };
        }
        catch (error) {
            fisheryLogger.error('Remote.prototype.exit==>', error);
            return { code: 200, msg: `` };
        }
    }
    async leave({ uid, sceneId, roomId }) {
        try {
            const room = FisheryRoomManagerImpl_1.default.searchRoom(sceneId, roomId);
            if (!room) {
                return { code: 200, msg: `未找到房间` };
            }
            const roomPlayer = room.getPlayer(uid);
            if (!roomPlayer) {
                fisheryLogger.warn(`渔场大亨${roomId}房间没有这个玩家uid:${uid}`);
                return { code: 200, msg: `未找到玩家` };
            }
            if (roomPlayer.bet > 0) {
                room.leave(roomPlayer, true);
                return { code: 500, msg: `玩家正在游戏中` };
            }
            room.leave(roomPlayer, false);
            FisheryRoomManagerImpl_1.default.removePlayerSeat(uid);
            FisheryRoomManagerImpl_1.default.removePlayer(roomPlayer);
            return { code: 200, msg: `` };
        }
        catch (error) {
            fisheryLogger.error('Remote.prototype.leave==>', error);
            return { code: 200, msg: `` };
        }
    }
    async rpcLowerPlayer({ uid, sceneId, roomId }) {
        fisheryLogger.debug(`渔场大亨|玩家游戏中下分|房间:${roomId}|场:${sceneId}|玩家:${uid}`);
        let apiResult = new ApiResultDTO_1.default();
        apiResult.code = 200;
        try {
            const room = FisheryRoomManagerImpl_1.default.searchRoom(sceneId, roomId);
            if (!room) {
                return { code: 200 };
            }
            const currPlayer = room.getPlayer(uid);
            if (!currPlayer) {
                return apiResult;
            }
            if (currPlayer.bet > 0) {
                apiResult.code = 500;
                return apiResult;
            }
            currPlayer.gold = 0;
            return apiResult;
        }
        catch (error) {
            fisheryLogger.error('渔场大亨|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }
    async getRoomHistory(player) {
        try {
            const group = await FisheryRoomManagerImpl_1.default.findGroup(player);
            const rooms = group.getRooms();
            const list = rooms.map((roomInfo) => {
                return {
                    sceneId: roomInfo.sceneId,
                    roomId: roomInfo.roomId,
                    fisheryHistory: roomInfo.fisheryHistory,
                    history: {
                        sceneId: roomInfo.sceneId,
                        roomId: roomInfo.roomId,
                        roomStatus: roomInfo.roomStatus,
                        countDown: roomInfo.countDown,
                    },
                };
            });
            return ApiResult_1.ApiResult.SUCCESS(list);
        }
        catch (e) {
            fisheryLogger.error('async  getRoomHistory==>', e.satck);
            return { code: 500, msg: `` };
        }
    }
    async entryScenes({ player }) {
        try {
            const group = FisheryRoomManagerImpl_1.default.getTenantScene(player);
            const rooms = group.getRooms();
            const data = rooms.map((roomInfo) => {
                return {
                    sceneId: roomInfo.sceneId,
                    roomId: roomInfo.roomId,
                    fisheryHistory: roomInfo.fisheryHistory,
                    history: {
                        sceneId: roomInfo.sceneId,
                        roomId: roomInfo.roomId,
                        roomStatus: roomInfo.roomStatus,
                        countDown: roomInfo.countDown,
                    },
                };
            });
            FisheryRoomManagerImpl_1.default.addPlayer(player);
            return { code: 200, data };
        }
        catch (error) {
            fisheryLogger.error('entryScenes', error);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(null, langsrv_1.Net_Message.id_1213) };
        }
    }
    leaveGameAndBackToHall(player) {
        FisheryRoomManagerImpl_1.default.removePlayer(player);
        return { code: 200 };
    }
    async reconnectBeforeEntryRoom({ uid }) {
        const apiResult = new ApiResultDTO_1.default();
        try {
            const seat = FisheryRoomManagerImpl_1.default.getPlayerSeat(uid);
            if (!seat) {
                return apiResult;
            }
            const room = FisheryRoomManagerImpl_1.default.searchRoom(seat.sceneId, seat.roomId);
            const roomPlayer = room.getPlayer(uid);
            roomPlayer.onLine = true;
            apiResult.code = 200;
            return apiResult;
        }
        catch (e) {
            return apiResult;
        }
    }
}
exports.MainRemote = MainRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2Zpc2hlcnkvcmVtb3RlL21haW5SZW1vdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsMEVBQXdEO0FBQ3hELCtDQUF1QztBQUN2Qyw4REFBeUQ7QUFFekQsOERBQTBFO0FBQzFFLHdFQUFpRTtBQUdqRSxNQUFNLGFBQWEsR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBVTFELG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsVUFBVTtJQUduQixZQUFZLEdBQWdCO1FBQ3hCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ25CLENBQUM7SUFLRCxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUM7UUFDakMsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sZ0NBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUVoRSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNQLE9BQU8sRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFBLHFCQUFXLEVBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUM7YUFDM0U7WUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRzdCLGdDQUFXLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9ELGdDQUFXLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7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