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
        this.logger.debug(`halloween|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);
            const _player = room.getPlayer(player.uid);
            if (_player) {
                _player.setOnline();
            }
            else {
                room.addPlayerInRoom(player);
            }
            return { code: 200, msg: '', roomId: room.roomId };
        }
        catch (error) {
            this.logger.error(`halloween|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_6) };
        }
    }
    async exit({ sceneId, roomId, player }) {
        this.logger.debug(`halloween|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        let apiResult = new ApiResultDTO_1.default();
        try {
            const room = this.roomManager.searchRoom(sceneId, roomId);
            if (!room) {
                apiResult.code = 200;
                this.logger.error(`halloween|离开房间未找到房间: ${roomId}|场:${sceneId}|`);
                return apiResult;
            }
            const currPlayer = room.getPlayer(player.uid);
            if (!currPlayer) {
                apiResult.code = 200;
                return apiResult;
            }
            if (currPlayer.isGameState()) {
                apiResult.msg = (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_3103);
                apiResult.code = 500;
                return apiResult;
            }
            room.removePlayer(player);
            apiResult['code'] = 200;
            return apiResult;
        }
        catch (error) {
            this.logger.error(`halloween|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            apiResult.code = 200;
        }
        return apiResult;
    }
    async leave({ uid, language, sceneId, roomId }) {
        this.logger.debug(`halloween|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`);
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
            if (currPlayer.isGameState() || !!currPlayer.subGameType) {
                apiResult.msg = (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_3103);
                currPlayer.setOffline();
                return apiResult;
            }
            room.removePlayer(currPlayer);
            apiResult.code = 200;
            return apiResult;
        }
        catch (error) {
            this.logger.error(`halloween|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`, error.stack);
            apiResult.code = 200;
            apiResult.msg = JSON.stringify(error);
            return apiResult;
        }
    }
    async rpcLowerPlayer({ uid, sceneId, roomId }) {
        this.logger.debug(`halloween|玩家游戏中下分|房间:${roomId}|场:${sceneId}|玩家:${uid}`);
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
            this.logger.error('halloween|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }
}
exports.MainRemote = MainRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2hhbGxvd2Vlbi9yZW1vdGUvbWFpblJlbW90ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQ0FBeUM7QUFDekMsb0RBQWdFO0FBQ2hFLHdFQUFpRTtBQUNqRSw4REFBNEU7QUFZNUUsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUZELDRCQUVDO0FBR0QsTUFBYSxVQUFVO0lBUW5CLFlBQVksR0FBZ0I7UUFDeEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxxQkFBVyxDQUFDO0lBQ25DLENBQUM7SUFNTSxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUU7UUFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLE1BQU0sTUFBTSxPQUFPLE9BQU8sTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFNUUsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFHL0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFHM0MsSUFBSSxPQUFPLEVBQUU7Z0JBQ1QsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFBO2FBQ3RCO2lCQUFNO2dCQUNILElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDaEM7WUFFRCxPQUFP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