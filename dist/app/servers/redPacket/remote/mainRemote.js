"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedPacketRemote = void 0;
const pinus_1 = require("pinus");
const ApiResultDTO_1 = require("../../../common/pojo/dto/ApiResultDTO");
const langsrv = require("../../../services/common/langsrv");
const PlayerGameStatusEnum_1 = require("../lib/enum/PlayerGameStatusEnum");
const ApiResult_1 = require("../../../common/pojo/ApiResult");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const RedPacketTenantRoomManager_1 = require("../lib/RedPacketTenantRoomManager");
const langsrv_1 = require("../../../services/common/langsrv");
function default_1(app) {
    return new RedPacketRemote(app);
}
exports.default = default_1;
class RedPacketRemote {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_1.getLogger)('server_out', __filename);
        this.roomManager = RedPacketTenantRoomManager_1.default;
    }
    async entry({ player, nid, roomId, sceneId }) {
        if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER) {
            this.logger.debug(`红包扫雷|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        }
        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);
            const result = room.addPlayerInRoom(player);
            if (!result) {
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012) };
            }
            this.roomManager.recordPlayerSeat(player.uid, sceneId, room.roomId);
            return { code: 200, roomId: room.roomId };
        }
        catch (error) {
            this.logger.error(`红包扫雷|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2004) };
        }
    }
    async exit({ nid, sceneId, roomId, player }) {
        if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER) {
            this.logger.debug(`红包扫雷|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        }
        let apiResult = new ApiResultDTO_1.default();
        try {
            const room = this.roomManager.searchRoom(sceneId, roomId);
            if (player.isRobot === RoleEnum_1.RoleEnum.ROBOT) {
                if (!room) {
                    return ApiResult_1.ApiResult.SUCCESS();
                }
            }
            let resultMessage = room.leaveRoom(player.uid, false);
            if (resultMessage) {
                apiResult['msg'] = resultMessage;
            }
            else {
                apiResult['code'] = 200;
                this.roomManager.removePlayerSeat(player.uid);
            }
        }
        catch (error) {
            this.logger.error(`红包扫雷|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            apiResult.code = 200;
        }
        return apiResult;
    }
    async leave({ uid, language, nid, sceneId, roomId }) {
        this.logger.debug(`红包扫雷|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`);
        let apiResult = new ApiResultDTO_1.default();
        apiResult.code = 500;
        try {
            const room = this.roomManager.searchRoom(sceneId, roomId);
            if (!room)
                apiResult['msg'] = langsrv.getlanguage(language, langsrv.Net_Message.id_1705);
            if (apiResult['msg'].length === 0) {
                const playerInRoom = room.getPlayer(uid);
                let resultMessage = room.leaveRoom(playerInRoom.uid, true);
                resultMessage ? apiResult['msg'] = resultMessage : apiResult['code'] = 200;
                this.roomManager.removePlayer(playerInRoom);
            }
        }
        catch (error) {
            this.logger.error(`红包扫雷|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`, error.stack);
            apiResult.msg = JSON.stringify(error);
        }
        return apiResult;
    }
    async reconnectBeforeEntryRoom({ uid }) {
        try {
            this.logger.debug(`红包扫雷|重连| 玩家: ${uid}`);
            const roomList = this.roomManager.getAllRooms();
            for (const roomInfo of roomList) {
                let playerInfo = roomInfo.players.find(pl => pl && pl.uid == uid);
                if (playerInfo) {
                    playerInfo.onLine = true;
                    return { code: 200, msg: '' };
                }
            }
            return { code: 500, msg: '' };
        }
        catch (error) {
            this.logger.warn('async  leave==>', error);
            return { code: 500, msg: '' };
        }
    }
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
            if (playerInfo.status !== PlayerGameStatusEnum_1.PlayerGameStatusEnum.GAME) {
                playerInfo.gold = 0;
                return { code: 200 };
            }
            const redPacketInfo = roomInfo.redPackQueue[0];
            if (redPacketInfo.owner_uid === playerInfo.uid) {
                return { code: 500 };
            }
            return { code: 500 };
        }
        catch (error) {
            this.logger.error('红包扫雷|离开房间  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }
    async leaveGameAndBackToHall(player, roomId) {
        try {
            this.roomManager.removePlayer(player);
            return ApiResult_1.ApiResult.SUCCESS();
        }
        catch (e) {
            this.logger.error(` 红包扫雷 | 玩家回到大厅 | 出错  ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR();
        }
    }
    async entryScenes({ player }) {
        try {
            const group = this.roomManager.getTenantScene(player);
            this.roomManager.addPlayer(player);
            const rooms = group.getRooms();
            const data = rooms.map((roomInfo) => {
                return {
                    sceneId: roomInfo.sceneId,
                    roomId: roomInfo.roomId,
                    history: {
                        sceneId: roomInfo.sceneId,
                        roomId: roomInfo.roomId,
                    },
                };
            });
            return { code: 200, data };
        }
        catch (error) {
            this.logger.error('entryScenes', error);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(null, langsrv_1.Net_Message.id_1213) };
        }
    }
}
exports.RedPacketRemote = RedPacketRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3JlZFBhY2tldC9yZW1vdGUvbWFpblJlbW90ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBcUY7QUFDckYsd0VBQWlFO0FBQ2pFLDREQUE2RDtBQUM3RCwyRUFBd0U7QUFDeEUsOERBQTJEO0FBQzNELHVFQUFvRTtBQUVwRSxrRkFBNEY7QUFFNUYsOERBQTRFO0FBVTVFLG1CQUF5QixHQUFnQjtJQUN2QyxPQUFPLElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFGRCw0QkFFQztBQUdELE1BQWEsZUFBZTtJQVExQixZQUFZLEdBQWdCO1FBQzFCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxXQUFXLEdBQUcsb0NBQVcsQ0FBQztJQUNqQyxDQUFDO0lBS00sS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRTtRQUVqRCxJQUFJLE1BQU0sQ0FBQyxPQUFPLEtBQUssbUJBQVEsQ0FBQyxXQUFXLEVBQUU7WUFDM0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxNQUFNLE1BQU0sT0FBTyxPQUFPLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQ3hFO1FBRUQsSUFBSTtZQW9CRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRS9ELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFNUMsSUFBSSxD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