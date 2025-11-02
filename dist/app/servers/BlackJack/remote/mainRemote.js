"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainRemote = void 0;
const pinus_logger_1 = require("pinus-logger");
const ApiResult_1 = require("../../../common/pojo/ApiResult");
const blackJack_state_1 = require("../../../common/systemState/blackJack.state");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const BlackJackPlayerStatusEnum_1 = require("../lib/enum/BlackJackPlayerStatusEnum");
const langsrv_1 = require("../../../services/common/langsrv");
const langsrv = require("../../../services/common/langsrv");
const BlackJackTenantRoomManager_1 = require("../lib/BlackJackTenantRoomManager");
function default_1(app) {
    return new mainRemote(app);
}
exports.default = default_1;
class mainRemote {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
        this.backendServerId = app.getServerId();
        this.roomManager = BlackJackTenantRoomManager_1.default;
    }
    async entry({ player, roomId, sceneId }) {
        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);
            if (!room) {
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012) };
            }
            const result = room.addPlayerInRoom(player);
            if (!result) {
                return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2012) };
            }
            return { code: 200, roomId: room.roomId };
        }
        catch (e) {
            this.logger.error(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${player.uid} | 进入房间 | 出错: ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1737));
        }
    }
    async exit({ nid, sceneId, roomId, player }) {
        try {
            const room = this.roomManager.searchRoom(sceneId, roomId);
            if (!room) {
                if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                    this.logger.warn(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${player.uid} | 离开房间 | 未查询到房间`);
                return new ApiResult_1.ApiResult(200, null, (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_226));
            }
            const blackJackPlayer = room.getPlayer(player.uid);
            if (!blackJackPlayer) {
                if (player.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
                    this.logger.warn(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${player.uid} | 离开房间 | 未查询到玩家`);
                return new ApiResult_1.ApiResult(200, null, (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1002));
            }
            if (blackJackPlayer.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game || blackJackPlayer.totalBet > 0) {
                this.logger.warn(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${player.uid} | 离开房间 | 正在对局中，不能离开`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Can_Not_Leave, null, (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_1050));
            }
            room.playerLeaveRoom(player.uid);
            this.roomManager.removePlayerSeat(player.uid);
            return ApiResult_1.ApiResult.SUCCESS();
        }
        catch (e) {
            this.logger.error(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${player.uid} | 离开房间 | 出错 | ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_230));
        }
    }
    async leave({ uid, language, nid, sceneId, roomId }) {
        try {
            const room = this.roomManager.searchRoom(sceneId, roomId);
            if (!room) {
                this.logger.warn(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${uid} | 离开房间 | 未查询到房间`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Room, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_226));
            }
            const blackJackPlayer = room.getPlayer(uid);
            if (!blackJackPlayer) {
                this.logger.warn(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${uid} | 离开房间 | 未查询到玩家`);
                return new ApiResult_1.ApiResult(blackJack_state_1.BlackJackState.Not_Find_Player, null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1002));
            }
            if (blackJackPlayer.totalBet !== 0) {
                room.playerLeaveRoom(uid, true);
                return ApiResult_1.ApiResult.ERROR();
            }
            room.playerLeaveRoom(uid, false);
            this.roomManager.removePlayer(blackJackPlayer);
            return ApiResult_1.ApiResult.SUCCESS();
        }
        catch (e) {
            this.logger.error(`${this.backendServerId} | 21点游戏 | 场 ${sceneId} | 房间 ${roomId} | 玩家 ${uid} | 玩家掉线 | 出错 | ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_230));
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
            if (playerInfo.status === BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Game) {
                return { code: 500 };
            }
            if (playerInfo.getCurrentTotalBet() > 0) {
                return { code: 500 };
            }
            return { code: 200 };
        }
        catch (error) {
            this.logger.error('红包扫雷|离开房间  rpcLowerPlayer==>', error);
            return { code: 200 };
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
    async leaveGameAndBackToHall(player, roomId) {
        try {
            this.roomManager.removePlayer(player);
            return ApiResult_1.ApiResult.SUCCESS();
        }
        catch (e) {
            this.logger.error(`${this.backendServerId} | 21点游戏 | 玩家回到大厅 | 出错  ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR();
        }
    }
}
exports.mainRemote = mainRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JsYWNrSmFjay9yZW1vdGUvbWFpblJlbW90ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQ0FBeUM7QUFDekMsOERBQTJEO0FBQzNELGlGQUE2RTtBQUM3RSx1RUFBb0U7QUFDcEUscUZBQWtGO0FBQ2xGLDhEQUE0RTtBQUM1RSw0REFBNkQ7QUFHN0Qsa0ZBQTRGO0FBWTVGLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsVUFBVTtJQVVuQixZQUFZLEdBQWdCO1FBQ3hCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBRWYsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRWxELElBQUksQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXpDLElBQUksQ0FBQyxXQUFXLEdBQUcsb0NBQVcsQ0FBQztJQUVuQyxDQUFDO0lBQ0QsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFO1FBRW5DLElBQUk7WUFLQSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRS9ELElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1AsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7YUFDaEc7WUFFRCxNQUFNLE1BQU0sR0FB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