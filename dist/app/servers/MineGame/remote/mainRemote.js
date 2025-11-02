"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainRemote = void 0;
const pinus_1 = require("pinus");
const roomManager_1 = require("../lib/roomManager");
const ApiResultDTO_1 = require("../../../common/pojo/dto/ApiResultDTO");
const langsrv_1 = require("../../../services/common/langsrv");
function default_1(app) {
    return new mainRemote(app);
}
exports.default = default_1;
class mainRemote {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_1.getLogger)('Logger_err_log', __filename);
        this.roomManager = roomManager_1.default;
    }
    async entry({ player, roomId, sceneId }) {
        this.logger.debug(`糖果派对|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);
            const _player = room.getPlayer(player.uid);
            if (_player) {
                _player.setOnline();
                room.deleteTimer(player);
            }
            else {
                room.addPlayerInRoom(player);
            }
            return { code: 200, msg: '', roomId: room.roomId };
        }
        catch (error) {
            this.logger.error(`糖果派对|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_6) };
        }
    }
    async exit({ player, roomId, sceneId }) {
        this.logger.debug(`糖果派对|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        let apiResult = new ApiResultDTO_1.default();
        try {
            const room = this.roomManager.searchRoom(sceneId, roomId);
            if (!room) {
                apiResult.code = 200;
                this.logger.error(`slots777|离开房间未找到房间: ${roomId}|场:${sceneId}|`);
                return apiResult;
            }
            room.removePlayer(player);
            apiResult['code'] = 200;
            return apiResult;
        }
        catch (error) {
            this.logger.error(`糖果派对|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            apiResult.code = 200;
        }
        return apiResult;
    }
    async leave({ uid, language, sceneId, roomId }) {
        this.logger.debug(`糖果派对|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`);
        let apiResult = new ApiResultDTO_1.default();
        try {
            const room = this.roomManager.searchRoom(sceneId, roomId);
            if (!room) {
                apiResult.code = 500;
                apiResult.msg = (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1004);
                return apiResult;
            }
            const p = room.getPlayer(uid);
            if (p.isGameState()) {
                apiResult.msg = (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_3103);
                p.setOffline();
                return apiResult;
            }
            await room.removePlayer(p);
            apiResult.code = 200;
        }
        catch (error) {
            this.logger.error(`糖果派对|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`, error.stack);
        }
        return apiResult;
    }
    async rpcLowerPlayer({ uid, sceneId, roomId }) {
        this.logger.debug(`糖果派对|玩家游戏中下分|房间:${roomId}|场:${sceneId}|玩家:${uid}`);
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
            if (currPlayer.isGameState()) {
                apiResult.code = 500;
                return apiResult;
            }
            currPlayer.gold = 0;
            return apiResult;
        }
        catch (error) {
            this.logger.error('糖果派对|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }
}
exports.mainRemote = mainRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL01pbmVHYW1lL3JlbW90ZS9tYWluUmVtb3RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUFxRjtBQUNyRixvREFBbUU7QUFDbkUsd0VBQWlFO0FBQ2pFLDhEQUE0RTtBQVk1RSxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFhLFVBQVU7SUFPbkIsWUFBWSxHQUFnQjtRQUN4QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSxpQkFBUyxFQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxXQUFXLEdBQUcscUJBQVcsQ0FBQztJQUNuQyxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFO1FBQ25DLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsTUFBTSxNQUFNLE9BQU8sT0FBTyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUV2RSxJQUFJO1lBRUEsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUcvRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUczQyxJQUFJLE9BQU8sRUFBRTtnQkFDVCxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUE7Z0JBRW5CLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDNUI7aUJBQU07Z0JBQ0gsSUFBSSxDQUFD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