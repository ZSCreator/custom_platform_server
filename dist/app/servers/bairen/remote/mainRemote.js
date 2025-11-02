"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainRemote = void 0;
const pinus_1 = require("pinus");
const BairenRoomManager_1 = require("../lib/BairenRoomManager");
const expandingMethod_1 = require("../../../services/robotRemoteService/expandingMethod");
const langsrv = require("../../../services/common/langsrv");
const langsrv_1 = require("../../../services/common/langsrv");
function default_1(app) {
    return new mainRemote(app);
}
exports.default = default_1;
class mainRemote {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_1.getLogger)('server_out', __filename);
        this.roomManager = BairenRoomManager_1.default;
    }
    async entryScenes(msg) {
        try {
            const group = this.roomManager.getTenantScene(msg.player);
            this.roomManager.addPlayer(msg.player);
            const rooms = group.getRooms();
            let data = rooms.map(roomInfo => {
                const { sceneId, roomId, status, countdown, pais, lotterys, bairenHistory, } = roomInfo;
                const zhuang = roomInfo.getPlayer(roomInfo.zhuangInfo.uid);
                const res = zhuang ? { uid: zhuang.uid, gold: zhuang.gold } : { uid: null };
                return {
                    sceneId,
                    roomId,
                    history: {
                        sceneId,
                        roomId,
                        status,
                        countdown,
                        paiCount: pais.length,
                        lotterys,
                        zhuangInfo: res
                    },
                    bairenHistory
                };
            });
            return { code: 200, data };
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
                return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_2012) };
            }
            const result = room.addPlayerInRoom(player);
            if (!result) {
                return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_2012) };
            }
            this.roomManager.recordPlayerSeat(player.uid, sceneId, room.roomId);
            this.roomManager.playerLeaveChannel(player);
            return { code: 200, roomId: room.roomId };
        }
        catch (error) {
            this.logger.error('async entry==>', error);
            return { code: 500, msg: langsrv.getlanguage(null, langsrv.Net_Message.id_1213) };
        }
    }
    ;
    async exit({ nid, sceneId, roomId, player }) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                return { code: 200, msg: `百人牛牛没有这个房间roomCode:${roomId}` };
            }
            const playerInfo = roomInfo.getPlayer(player.uid);
            if (!playerInfo) {
                return { code: 200, msg: '' };
            }
            if (roomInfo.zhuangInfo && roomInfo.zhuangInfo.uid === playerInfo.uid) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1051) };
            }
            if (playerInfo.bet > 0) {
                return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_1050) };
            }
            roomInfo.leave(playerInfo, false);
            this.roomManager.removePlayerSeat(player.uid);
            this.roomManager.playerAddToChannel(player);
            return { code: 200, msg: '' };
        }
        catch (error) {
            this.logger.error('async exit==>', error);
            return { code: 200, msg: '' };
        }
    }
    ;
    async leave({ uid, language, nid, sceneId, roomId }) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                return { code: 200, msg: '玩家不在这个房间里面' };
            }
            const playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                return { code: 200, msg: 'tom是傻逼' };
            }
            if (playerInfo.bet > 0 || roomInfo.zhuangInfo.uid == playerInfo.uid) {
                roomInfo.leave(playerInfo, true);
                return { code: 500, msg: '玩家是庄家或者有押注' };
            }
            roomInfo.leave(playerInfo, false);
            this.roomManager.removePlayer(playerInfo);
            this.roomManager.removePlayerSeat(uid);
            return { code: 200, msg: '' };
        }
        catch (error) {
            this.logger.error('async leave==>', error);
            return { code: 500, msg: JSON.stringify(error) };
        }
    }
    ;
    async rpcLowerPlayer({ uid, sceneId, roomId }) {
        try {
            const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
            if (!roomInfo) {
                return { code: 200 };
            }
            const playerInfo = roomInfo.getPlayer(uid);
            if (!playerInfo) {
                return { code: 200 };
            }
            if (playerInfo.bet > 0 || (roomInfo.zhuangInfo && roomInfo.zhuangInfo.uid == playerInfo.uid)) {
                return { code: 500 };
            }
            else {
                playerInfo.gold = 0;
                return { code: 200 };
            }
        }
        catch (error) {
            this.logger.error('bairen|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }
    ;
    async reconnectBeforeEntryRoom({ uid }) {
        try {
            const seat = this.roomManager.getPlayerSeat(uid);
            if (!seat) {
                return { code: 200, msg: '' };
            }
            const room = this.roomManager.searchRoom(seat.sceneId, seat.roomId);
            const roomPlayer = room.getPlayer(uid);
            roomPlayer.onLine = true;
            return { code: 200, msg: '' };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2JhaXJlbi9yZW1vdGUvbWFpblJlbW90ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBcUY7QUFDckYsZ0VBQTBFO0FBQzFFLDBGQUFtRjtBQUNuRiw0REFBNkQ7QUFDN0QsOERBQTRFO0FBYzVFLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsVUFBVTtJQUluQixZQUFZLEdBQWdCO1FBQ3hCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxXQUFXLEdBQUcsMkJBQVcsQ0FBQztJQUNuQyxDQUFDO0lBS00sS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFlO1FBQ3BDLElBQUk7WUFDQSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXZDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMvQixJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUM1QixNQUFNLEVBQ0YsT0FBTyxFQUNQLE1BQU0sRUFDTixNQUFNLEVBQ04sU0FBUyxFQUNULElBQUksRUFDSixRQUFRLEVBQ1IsYUFBYSxHQUNoQixHQUFHLFFBQVEsQ0FBQztnQkFDYixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLFFB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