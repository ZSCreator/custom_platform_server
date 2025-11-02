"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainRemote = void 0;
const pinus_1 = require("pinus");
const langsrv_1 = require("../../../services/common/langsrv");
const roomManager_1 = require("../lib/roomManager");
const ApiResultDTO_1 = require("../../../common/pojo/dto/ApiResultDTO");
function default_1(app) {
    return new mainRemote(app);
}
exports.default = default_1;
class mainRemote {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_1.getLogger)('server_out', __filename);
        this.roomManager = roomManager_1.default;
    }
    async entry({ player, nid, roomId, sceneId }) {
        this.logger.debug(`色碟|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);
            if (!room) {
                return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_6) };
            }
            room.addPlayerInRoom(player);
            this.roomManager.recordPlayerSeat(player.uid, sceneId, room.roomId);
            this.roomManager.playerLeaveChannel(player);
            return { code: 200, msg: '', roomId: room.roomId };
        }
        catch (error) {
            this.logger.error(`色碟|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_6) };
        }
    }
    ;
    async exit({ sceneId, roomId, player }) {
        this.logger.debug(`色碟|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        let apiResult = new ApiResultDTO_1.default();
        try {
            const room = this.roomManager.searchRoom(sceneId, roomId);
            if (!room) {
                apiResult.code = 200;
                this.logger.debug(`色碟|离开房间未找到房间: ${roomId}|场:${sceneId}|`);
                return apiResult;
            }
            const roomPlayer = room.getPlayer(player.uid);
            if (!roomPlayer) {
                apiResult.code = 200;
                this.logger.info(`色碟|离开房间未找到玩家: ${roomId}|场:${sceneId}|${player.uid}||${room.players.map(p => p && p.uid)}`);
                return apiResult;
            }
            if (roomPlayer === room.getBanker() || roomPlayer.isBet()) {
                apiResult.code = 500;
                apiResult.msg = (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1050);
                return apiResult;
            }
            room.removePlayer(player);
            this.roomManager.removePlayerSeat(player.uid);
            this.roomManager.playerAddToChannel(player);
            apiResult.code = 200;
            return apiResult;
        }
        catch (error) {
            this.logger.error(`色碟|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            apiResult.code = 200;
        }
        return apiResult;
    }
    async leave({ uid, language, nid, sceneId, roomId }) {
        this.logger.warn(`色碟|断线:${roomId}|场:${sceneId}|玩家:${uid}`);
        let apiResult = new ApiResultDTO_1.default();
        try {
            const room = this.roomManager.searchRoom(sceneId, roomId);
            if (!room) {
                apiResult.code = 500;
                apiResult.msg = (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1004);
                this.logger.error(`色碟|离开房间未找到房间: ${roomId}|场:${sceneId}|`);
                return apiResult;
            }
            const roomPlayer = room.getPlayer(uid);
            if (!roomPlayer) {
                apiResult.code = 500;
                apiResult.msg = (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_2017);
                return apiResult;
            }
            if (roomPlayer === room.getBanker() || roomPlayer.isBet()) {
                apiResult.code = 500;
                apiResult.msg = (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1050);
                room.playerOffline(roomPlayer);
                return apiResult;
            }
            room.removePlayer(roomPlayer);
            this.roomManager.removePlayerSeat(uid);
            this.roomManager.removePlayer(roomPlayer);
            apiResult.code = 200;
            return apiResult;
        }
        catch (error) {
            this.logger.error(`色碟|离开房间:${roomId}|场:${sceneId}|玩家:${uid}|出错:${error}`);
            apiResult.code = 500;
            return apiResult;
        }
    }
    async reconnectBeforeEntryRoom({ uid }) {
        const apiResult = new ApiResultDTO_1.default();
        try {
            const seat = this.roomManager.getPlayerSeat(uid);
            if (!seat) {
                return apiResult;
            }
            const room = this.roomManager.searchRoom(seat.sceneId, seat.roomId);
            const roomPlayer = room.getPlayer(uid);
            roomPlayer.resetOnlineState();
            apiResult.code = 200;
            return apiResult;
        }
        catch (e) {
            this.logger.error(`色碟|reconnectBeforeEntryRoom 断线重连| 玩家:${uid}|出错:${e}`);
            return apiResult;
        }
    }
    async rpcLowerPlayer({ uid, sceneId, roomId }) {
        this.logger.debug(`色碟|玩家游戏中下分|房间:${roomId}|场:${sceneId}|玩家:${uid}`);
        let apiResult = new ApiResultDTO_1.default();
        apiResult.code = 200;
        try {
            const room = this.roomManager.searchRoom(sceneId, roomId);
            if (!room) {
                return apiResult;
            }
            const currPlayer = room.getPlayer(uid);
            if (!currPlayer) {
                return apiResult;
            }
            if (currPlayer === room.getBanker() || currPlayer.isBet()) {
                apiResult.code = 500;
                return apiResult;
            }
            currPlayer.gold = 0;
            return apiResult;
        }
        catch (error) {
            this.logger.error('色碟|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }
    async entryScenes({ player }) {
        try {
            const group = this.roomManager.getTenantScene(player);
            const rooms = group.getRooms();
            let data = rooms.map(r => {
                return {
                    sceneId: r.sceneId,
                    roomId: r.roomId,
                    status: r.processState.stateName,
                    countdown: r.processState.getRemainingTime(),
                    history: r.getLotteryHistory(true)
                };
            });
            this.roomManager.addPlayer(player);
            return { code: 200, data };
        }
        catch (error) {
            this.logger.error('entryScenes', error);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(null, langsrv_1.Net_Message.id_1213) };
        }
    }
    leaveGameAndBackToHall(player) {
        this.roomManager.removePlayer(player);
        return { code: 200 };
    }
}
exports.mainRemote = mainRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2NvbG9yUGxhdGUvcmVtb3RlL21haW5SZW1vdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQW1GO0FBQ25GLDhEQUEwRTtBQUMxRSxvREFBc0U7QUFDdEUsd0VBQWlFO0FBY2pFLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsVUFBVTtJQUtuQixZQUFZLEdBQWdCO1FBQ3hCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxXQUFXLEdBQUcscUJBQVcsQ0FBQztJQUNuQyxDQUFDO0lBVUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBQztRQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLE1BQU0sTUFBTSxPQUFPLE9BQU8sTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFckUsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFL0QsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDUCxPQUFPLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBQSxxQkFBVyxFQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUscUJBQVcsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDO2FBQzNFO1lBRUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENB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