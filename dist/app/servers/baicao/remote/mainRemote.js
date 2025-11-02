"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainRemote = void 0;
const pinus_1 = require("pinus");
const baicaoMgr_1 = require("../lib/baicaoMgr");
const expandingMethod_1 = require("../../../services/robotRemoteService/expandingMethod");
const langsrv = require("../../../services/common/langsrv");
const langsrv_1 = require("../../../services/common/langsrv");
const ApiResultDTO_1 = require("../../../common/pojo/dto/ApiResultDTO");
const LoggerErr = (0, pinus_1.getLogger)('server_out', __filename);
function default_1(app) {
    return new mainRemote(app);
}
exports.default = default_1;
class mainRemote {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_1.getLogger)('server_out', __filename);
        this.roomManager = baicaoMgr_1.default;
    }
    async entryScenes(msg) {
        try {
            const group = await this.roomManager.getTenantScene(msg.player);
            this.roomManager.addPlayer(msg.player);
            return { code: 200, data: "" };
        }
        catch (error) {
            this.logger.error('entryScenes', error);
            return { code: 500, msg: langsrv.getlanguage(null, langsrv.Net_Message.id_1213) };
        }
    }
    async entry({ player, nid, roomId, sceneId }) {
        try {
            const roomInfo = this.roomManager.getRoom(sceneId, roomId, player);
            if (!roomInfo) {
                return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv.Net_Message.id_2012) };
            }
            const result = roomInfo.addPlayerInRoom(player);
            if (!result) {
                return { code: 500, msg: (0, langsrv_1.getlanguage)(player.language, langsrv.Net_Message.id_2012) };
            }
            this.roomManager.recordPlayerSeat(player.uid, sceneId, roomInfo.roomId);
            return { code: 200, roomId: roomInfo.roomId };
        }
        catch (e) {
            LoggerErr.info(`sangong.Remote.entry ==> 进入游戏错误 ${e}`);
            return { code: 500, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_2004) };
        }
    }
    ;
    async exit({ nid, sceneId, roomId, player }) {
        let apiResult = new ApiResultDTO_1.default();
        const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
        if (!roomInfo) {
            apiResult.code = 200;
            this.logger.debug(`猜AB|离开房间未找到房间: ${roomId}|场:${sceneId}|uid:${player.uid}`);
            return apiResult;
        }
        const playerInfo = roomInfo.getPlayer(player.uid);
        if (!playerInfo) {
            LoggerErr.info(`退出房间错误 ==> ${player.uid} | ${roomId} | ${sceneId} | ${roomInfo.roomId} | ${roomInfo.sceneId}`);
            return { code: 200, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_202) };
        }
        if (playerInfo.status == 'GAME') {
            return { code: 500, msg: langsrv.getlanguage(playerInfo.language, langsrv.Net_Message.id_2014) };
        }
        roomInfo.leave(playerInfo, false);
        return { code: 200, msg: '' };
    }
    ;
    async leave({ uid, language, sceneId, roomId, group_id, lineCode }) {
        const roomInfo = this.roomManager.searchRoom(sceneId, roomId);
        if (!roomInfo) {
            return { code: 200, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2004) };
        }
        const playerInfo = roomInfo.getPlayer(uid);
        if (!playerInfo) {
            this.roomManager.removePlayer({ uid, group_id, lineCode });
            return { code: 200, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_2004) };
        }
        if (playerInfo.status == "GAME") {
            roomInfo.leave(playerInfo, true);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_1050) };
        }
        roomInfo.leave(playerInfo, true);
        this.roomManager.removePlayer(playerInfo);
        return { code: 200, msg: '' };
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
            return { code: 500 };
        }
        catch (error) {
            LoggerErr.error('baicao|async  rpcLowerPlayer==>', error);
            return { code: 200 };
        }
    }
    ;
    async reconnectBeforeEntryRoom({ uid }) {
        const apiResult = new ApiResultDTO_1.default();
        try {
            const seat = this.roomManager.getPlayerSeat(uid);
            if (!seat) {
                return apiResult;
            }
            const room = this.roomManager.searchRoom(seat.sceneId, seat.roomId);
            const player = room.getPlayer(uid);
            if (player) {
                player.onLine = true;
                apiResult.code = 200;
            }
            else {
                this.roomManager.removePlayerSeat(uid);
            }
            return apiResult;
        }
        catch (error) {
            LoggerErr.warn('async  leave==>', error);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2JhaWNhby9yZW1vdGUvbWFpblJlbW90ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBcUY7QUFDckYsZ0RBQTJEO0FBQzNELDBGQUFtRjtBQUNuRiw0REFBNkQ7QUFDN0QsOERBQStEO0FBQy9ELHdFQUFpRTtBQUdqRSxNQUFNLFNBQVMsR0FBRyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBYXRELG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFGRCw0QkFFQztBQUNELE1BQWEsVUFBVTtJQUluQixZQUFZLEdBQWdCO1FBQ3hCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxXQUFXLEdBQUcsbUJBQVcsQ0FBQztJQUNuQyxDQUFDO0lBSU0sS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFlO1FBQ3BDLElBQUk7WUFDQSxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoRSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkMsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO1NBQ2xDO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDeEMsT0FBTyxFQUFFLElBQUks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