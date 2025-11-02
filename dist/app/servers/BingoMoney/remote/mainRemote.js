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
        this.logger.debug(`BingoMoney|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        try {
            const room = this.roomManager.getRoom(sceneId, roomId, player);
            room.addPlayerInRoom(player);
            return { code: 200, msg: '', roomId: room.roomId };
        }
        catch (error) {
            this.logger.error(`BingoMoney|进入房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv_1.Net_Message.id_6) };
        }
    }
    async exit({ sceneId, roomId, player }) {
        this.logger.debug(`BingoMoney|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}`);
        let apiResult = new ApiResultDTO_1.default();
        try {
            const room = this.roomManager.searchRoom(sceneId, roomId);
            if (!room) {
                apiResult.code = 200;
                this.logger.error(`BingoMoney|离开房间未找到房间: ${roomId}|场:${sceneId}|`);
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
            this.logger.error(`BingoMoney|离开房间:${roomId}|场:${sceneId}|玩家:${player.uid}|出错:${error}`);
            apiResult.code = 200;
        }
        return apiResult;
    }
    async leave({ uid, language, sceneId, roomId }) {
        this.logger.debug(`BingoMoney|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`);
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
            if (currPlayer.isGameState()) {
                apiResult.msg = (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_3103);
                currPlayer.setOffline();
                return apiResult;
            }
            room.removePlayer(currPlayer);
            apiResult.code = 200;
            return apiResult;
        }
        catch (error) {
            this.logger.error(`BingoMoney|玩家掉线|房间:${roomId}|场:${sceneId}|玩家:${uid}`, error.stack);
            apiResult.code = 200;
            apiResult.msg = JSON.stringify(error);
            return apiResult;
        }
    }
    async rpcLowerPlayer({ uid, sceneId, roomId }) {
        this.logger.debug(`BingoMoney|玩家游戏中下分|房间:${roomId}|场:${sceneId}|玩家:${uid}`);
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
            this.logger.error('BingoMoney|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }
}
exports.MainRemote = MainRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JpbmdvTW9uZXkvcmVtb3RlL21haW5SZW1vdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsK0NBQXlDO0FBQ3pDLG9EQUFzRTtBQUN0RSx3RUFBaUU7QUFDakUsOERBQTRFO0FBWTVFLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFGRCw0QkFFQztBQUdELE1BQWEsVUFBVTtJQVFuQixZQUFZLEdBQWdCO1FBQ3hCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxXQUFXLEdBQUcscUJBQVcsQ0FBQztJQUNuQyxDQUFDO0lBTU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFO1FBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixNQUFNLE1BQU0sT0FBTyxPQUFPLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRTdFLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFN0IsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3REO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFFWixJQUFJLENBQUMsTUFBTSxDQUFDLEtB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