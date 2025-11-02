"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainRemote = void 0;
const pinus_logger_1 = require("pinus-logger");
const roomManager_1 = require("../lib/roomManager");
const ApiResultDTO_1 = require("../../../common/pojo/dto/ApiResultDTO");
const langsrv_1 = require("../../../services/common/langsrv");
function default_1(app) {
    return new MainRemote(app);
}
exports.default = default_1;
class MainRemote {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
        this.roomManager = roomManager_1.default;
    }
    async entry({ player, roomId, sceneId }) {
        this.logger.debug(`hl6xc|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);
            room.addPlayerInRoom(player);
            return { code: 200, msg: '', roomId: room.roomId };
        }
        catch (error) {
            this.logger.error(`hl6xc|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_6) };
        }
    }
    async exit({ sceneId, roomId, player }) {
        this.logger.debug(`hl6xc|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        let apiResult = new ApiResultDTO_1.default();
        try {
            const room = this.roomManager.searchRoom(sceneId, roomId);
            if (!room) {
                apiResult.code = 200;
                this.logger.error(`hl6xc|离开房间未找到房间: ${roomId}|场:${sceneId}|`);
                return apiResult;
            }
            const currPlayer = room.getPlayer(player.uid);
            if (!currPlayer) {
                apiResult.code = 200;
                return apiResult;
            }
            if (currPlayer.isGameState() || currPlayer.islucky) {
                apiResult.msg = (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103);
                apiResult.code = 500;
                return apiResult;
            }
            room.removePlayer(player);
            apiResult['code'] = 200;
            return apiResult;
        }
        catch (error) {
            this.logger.error(`hl6xc|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            apiResult.code = 200;
        }
        return apiResult;
    }
    async leave({ uid, language, sceneId, roomId }) {
        this.logger.debug(`hl6xc|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`);
        let apiResult = new ApiResultDTO_1.default();
        try {
            const room = this.roomManager.searchRoom(sceneId, roomId);
            if (!room) {
                apiResult.code = 200;
                apiResult.msg = (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1004);
                return apiResult;
            }
            const currPlayer = room.getPlayer(uid);
            if (!currPlayer) {
                apiResult.code = 200;
                return apiResult;
            }
            if (currPlayer.isGameState() || currPlayer.islucky) {
                apiResult.msg = (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_3103);
                currPlayer.setOffline();
                return apiResult;
            }
            room.removePlayer(currPlayer);
            apiResult.code = 200;
            return apiResult;
        }
        catch (error) {
            this.logger.error(`hl6xc|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`, error.stack);
            apiResult.code = 200;
            apiResult.msg = JSON.stringify(error);
            return apiResult;
        }
    }
    async rpcLowerPlayer({ uid, sceneId, roomId }) {
        this.logger.debug(`hl6xc|玩家游戏中下分|房间:${roomId}|场:${sceneId}|玩家:${uid}`);
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
            this.logger.error('hl6xc|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }
}
exports.MainRemote = MainRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2hsNnhjL3JlbW90ZS9tYWluUmVtb3RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtDQUF5QztBQUN6QyxvREFBbUU7QUFDbkUsd0VBQWlFO0FBQ2pFLDhEQUE0RTtBQVk1RSxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBRkQsNEJBRUM7QUFHRCxNQUFhLFVBQVU7SUFRbkIsWUFBWSxHQUFnQjtRQUN4QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsV0FBVyxHQUFHLHFCQUFXLENBQUM7SUFDbkMsQ0FBQztJQU1NLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRTtRQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLE1BQU0sTUFBTSxPQUFPLE9BQU8sTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFeEUsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU3QixPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDdEQ7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUVaLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFD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