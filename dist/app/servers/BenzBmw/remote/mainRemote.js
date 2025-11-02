"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainRemote = void 0;
const pinus_1 = require("pinus");
const benzRoomMgr_1 = require("../lib/benzRoomMgr");
const expandingMethod_1 = require("../../../services/robotRemoteService/expandingMethod");
const langsrv = require("../../../services/common/langsrv");
function default_1(app) {
    return new mainRemote(app);
}
exports.default = default_1;
class mainRemote {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_1.getLogger)('server_out', __filename);
        this.roomManager = benzRoomMgr_1.default;
    }
    async entryScenes(msg) {
        try {
            const group = this.roomManager.getTenantScene(msg.player);
            this.roomManager.addPlayer(msg.player);
            const rooms = group.getRooms();
            let data = rooms.map(roomInfo => {
                return {
                    sceneId: roomInfo.sceneId,
                    roomId: roomInfo.roomId,
                    history: {
                        sceneId: roomInfo.sceneId,
                        roomId: roomInfo.roomId,
                        status: roomInfo.status,
                        countdown: roomInfo.countdown,
                        lotterys: roomInfo.lotterys,
                    },
                    record_historys: roomInfo.record_historys
                };
            });
            return { code: 200, data };
        }
        catch (error) {
            this.logger.error('entryScenes', error);
            return { code: 500, msg: langsrv.getlanguage(null, langsrv.Net_Message.id_1213) };
        }
    }
    async entry({ player, sceneId, roomId }) {
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
            this.roomManager.playerLeaveChannel(player);
            return { code: 200, roomId: room.roomId };
        }
        catch (error) {
            this.logger.error('BenzBmw|public async entryttz==>', error);
            return { code: 500, msg: langsrv.getlanguage(null, langsrv.Net_Message.id_1213) };
        }
    }
    ;
    async exit({ sceneId, roomId, player }) {
        const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
        if (!roomInfo) {
            return { code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}` };
        }
        const playerInfo = roomInfo.getPlayer(player.uid);
        if (!playerInfo) {
            this.logger.warn(`BenzBmw|exit|玩家：${player.uid}玩家不存在`);
            return { code: 200, msg: `BenzBmw|玩家：${player.uid}玩家不存在` };
        }
        if (playerInfo && playerInfo.bet > 0) {
            return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1050) };
        }
        roomInfo.leave(playerInfo, false);
        this.roomManager.removePlayerSeat(player.uid);
        this.roomManager.playerAddToChannel(player);
        return { code: 200, msg: '' };
    }
    ;
    async leave({ uid, sceneId, roomId }) {
        const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
        if (!roomInfo) {
            return { code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}` };
        }
        const playerInfo = roomInfo.getPlayer(uid);
        if (!playerInfo) {
            return { code: 200, msg: '未找到玩家' };
        }
        if (playerInfo.bet > 0) {
            roomInfo.leave(playerInfo, true);
            return { code: 500, msg: '玩家有押注' };
        }
        roomInfo.leave(playerInfo, false);
        this.roomManager.removePlayer(playerInfo);
        this.roomManager.removePlayerSeat(uid);
        return { code: 200, msg: '' };
    }
    ;
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
            if (playerInfo.bet > 0) {
                return { code: 500 };
            }
            else {
                playerInfo.gold = 0;
                return { code: 200 };
            }
        }
        catch (error) {
            this.logger.error('BenzBmw|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }
    ;
    async reconnectBeforeEntryRoom({ uid }) {
        try {
            const roomList = this.roomManager.getAllRooms();
            for (const roomInfo of roomList) {
                let playerInfo = roomInfo.players.find(pl => pl && pl.uid == uid);
                if (playerInfo) {
                    playerInfo.onLine = true;
                    return { code: 200, msg: '' };
                }
            }
        }
        catch (error) {
            this.logger.warn('async  leave==>', error);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JlbnpCbXcvcmVtb3RlL21haW5SZW1vdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQXFGO0FBQ3JGLG9EQUFpRTtBQUNqRSwwRkFBbUY7QUFDbkYsNERBQTZEO0FBYzdELG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsVUFBVTtJQUluQixZQUFZLEdBQWdCO1FBQ3hCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxXQUFXLEdBQUcscUJBQVcsQ0FBQztJQUNuQyxDQUFDO0lBSU0sS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFlO1FBQ3BDLElBQUk7WUFFQSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXZDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMvQixJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUM1QixPQUFPO29CQUNILE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTztvQkFDekIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNO29CQUN2QixPQUFPLEVBQUU7d0JBQ0wsT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPO3dCQUN6QixNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU07d0JB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