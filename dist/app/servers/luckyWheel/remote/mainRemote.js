"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainRemote = void 0;
const pinus_logger_1 = require("pinus-logger");
const ApiResultDTO_1 = require("../../../common/pojo/dto/ApiResultDTO");
const roomManager_1 = require("../lib/roomManager");
const langsrv_1 = require("../../../services/common/langsrv");
function default_1(app) {
    return new MainRemote(app);
}
exports.default = default_1;
;
class MainRemote {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('Logger_err_log', __filename);
        this.roomManager = roomManager_1.default;
    }
    async entry({ player, roomId, sceneId }) {
        this.logger.debug(`幸运转盘|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);
            const _player = room.getPlayer(player.uid);
            if (_player) {
                _player.onLine = true;
                room.deleteTimer(player);
            }
            else {
                room.addPlayerInRoom(player);
            }
            return { code: 200, msg: '', roomId: room.roomId };
        }
        catch (error) {
            this.logger.error(`幸运转盘|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_6) };
        }
    }
    async exit({ sceneId, roomId, player }) {
        this.logger.debug(`幸运转盘|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
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
            this.logger.error(`幸运转盘|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            apiResult.code = 200;
        }
        return apiResult;
    }
    async leave({ uid, language, sceneId, roomId }) {
        this.logger.debug(`幸运转盘|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`);
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
            room.removePlayer(p);
            apiResult.code = 200;
        }
        catch (error) {
            this.logger.error(`幸运转盘|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`, error.stack);
            apiResult.msg = JSON.stringify(error);
        }
        return apiResult;
    }
    async rpcLowerPlayer({ uid, sceneId, roomId }) {
        this.logger.debug(`幸运转盘|玩家游戏中下分|房间:${roomId}|场:${sceneId}|玩家:${uid}`);
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
            this.logger.error('幸运转盘|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }
    async reconnectBeforeEntryRoom({ uid }) {
        const rooms = this.roomManager.getAllRooms();
        let player;
        for (let room of rooms) {
            player = room.getPlayer(uid);
            if (!!player)
                break;
        }
        if (player) {
            player.onLine = true;
            return { code: 200, msg: '' };
        }
        return { code: 500, msg: '' };
    }
}
exports.MainRemote = MainRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2x1Y2t5V2hlZWwvcmVtb3RlL21haW5SZW1vdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsK0NBQWlEO0FBQ2pELHdFQUFpRTtBQUNqRSxvREFBOEQ7QUFDOUQsOERBQTRFO0FBWTVFLG1CQUF5QixHQUFHO0lBQ3hCLE9BQU8sSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUZELDRCQUVDO0FBQUEsQ0FBQztBQUVGLE1BQWEsVUFBVTtJQVFuQixZQUFZLEdBQWdCO1FBQ3hCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxxQkFBVyxDQUFDO0lBQ25DLENBQUM7SUFNTSxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUU7UUFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxNQUFNLE1BQU0sT0FBTyxPQUFPLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRXZFLElBQUk7WUFFQSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRy9ELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRzNDLElBQUksT0FBTyxFQUFFO2dCQUNULE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2dCQUV0QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzVCO2lCQUFN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