"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcHttpController = void 0;
const common_1 = require("@nestjs/common");
const log4js = require("log4js");
const OnlinePlayer_redis_dao_1 = require("../../../../../common/dao/redis/OnlinePlayer.redis.dao");
const pinus_1 = require("pinus");
const connectionManager_1 = require("../../../../../common/dao/mysql/lib/connectionManager");
const PlayerGameHistory_entity_1 = require("../../../../../common/dao/mysql/entity/PlayerGameHistory.entity");
const Game_manager_1 = require("../../../../../common/dao/daoManager/Game.manager");
let RpcHttpController = class RpcHttpController {
    constructor() {
        this.logger = log4js.getLogger('tixian_money_record');
    }
    async lowerPlayerMoney({ uid, account }) {
        let serverId = null;
        try {
            if (!uid) {
                return { code: 200, isCanLower: false };
            }
            const onlinePlayer = await OnlinePlayer_redis_dao_1.default.findOne({ uid });
            if (!onlinePlayer) {
                const historyRecord = await connectionManager_1.default.getConnection(false)
                    .getRepository(PlayerGameHistory_entity_1.PlayerGameHistory)
                    .createQueryBuilder("PlayerGameHistory")
                    .where("PlayerGameHistory.uid = :uid", { uid })
                    .orderBy("PlayerGameHistory.createDateTime", "DESC")
                    .getOne();
                if (!historyRecord) {
                    return { code: 200, isCanLower: true };
                }
                else {
                    const { nid, sceneId, roomId } = historyRecord;
                    const paramsData = { nid, uid, sceneId, roomId, hallServerId: null };
                    const result = await this.checkPlayerLower(paramsData);
                    return result;
                }
            }
            const { nid, sceneId, roomId, hallServerId, frontendServerId } = onlinePlayer;
            serverId = frontendServerId;
            if (nid == '-1') {
                pinus_1.pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer(frontendServerId, uid);
                await OnlinePlayer_redis_dao_1.default.deleteOne({ uid });
                return { code: 200, isCanLower: true };
            }
            if (sceneId == -1) {
                pinus_1.pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer(frontendServerId, uid);
                await OnlinePlayer_redis_dao_1.default.deleteOne({ uid });
                return { code: 200, isCanLower: true };
            }
            const paramsData = { nid, uid, sceneId, roomId, hallServerId };
            const result = await this.checkPlayerLower(paramsData);
            if (result.code == 200) {
                pinus_1.pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer(frontendServerId, uid);
                await OnlinePlayer_redis_dao_1.default.deleteOne({ uid });
            }
            return result;
        }
        catch (e) {
            this.logger.error(`uid: ${uid} ,account:${account}, e:${e.stack}`);
            if (serverId) {
                pinus_1.pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer(serverId, uid);
            }
            await OnlinePlayer_redis_dao_1.default.deleteOne({ uid });
            return { code: 200, isCanLower: true };
        }
    }
    async checkPlayerLower(paramsData) {
        try {
            let { nid, uid, sceneId, roomId, hallServerId } = paramsData;
            const { name } = await Game_manager_1.default.findOne({ nid });
            if (!pinus_1.pinus.app.rpc[name]) {
                return { code: 200, isCanLower: true };
            }
            if (!hallServerId) {
                hallServerId = `${name}-server-1`;
            }
            let result = await pinus_1.pinus.app.rpc[name].mainRemote.rpcLowerPlayer.toServer(hallServerId, { uid, sceneId, roomId });
            if (result && result.code == 200) {
                return { code: 200, isCanLower: true };
            }
            return { code: 500, isCanLower: false };
        }
        catch (e) {
            console.error(`检查玩家是否可以下分:${e}`);
            return { code: 200, isCanLower: true };
        }
    }
    ;
};
__decorate([
    (0, common_1.Post)('lowerPlayerMoney'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RpcHttpController.prototype, "lowerPlayerMoney", null);
RpcHttpController = __decorate([
    (0, common_1.Controller)('rpc'),
    __metadata("design:paramtypes", [])
], RpcHttpController);
exports.RpcHttpController = RpcHttpController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnBjSHR0cC5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY2hlY2tQbGF5ZXJJbkdhbWUvbGliL21vZHVsZXMvbG9nL3JwY0h0dHAuY29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBdUQ7QUFDdkQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLG1HQUEwRjtBQUMxRixpQ0FBNEI7QUFDNUIsNkZBQXNGO0FBQ3RGLDhHQUFrRztBQUNsRyxvRkFBNEU7QUFFNUUsSUFBYSxpQkFBaUIsR0FBOUIsTUFBYSxpQkFBaUI7SUFHMUI7UUFDSSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBT0QsS0FBSyxDQUFDLGdCQUFnQixDQUFTLEVBQUUsR0FBRyxFQUFHLE9BQU8sRUFBRTtRQUM1QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSTtZQUNBLElBQUcsQ0FBQyxHQUFHLEVBQUM7Z0JBQ0osT0FBTyxFQUFDLElBQUksRUFBRyxHQUFHLEVBQUcsVUFBVSxFQUFHLEtBQUssRUFBQyxDQUFDO2FBQzVDO1lBQ0QsTUFBTSxZQUFZLEdBQUcsTUFBTSxnQ0FBb0IsQ0FBQyxPQUFPLENBQUMsRUFBQyxHQUFHLEVBQUMsQ0FBQyxDQUFDO1lBRS9ELElBQUcsQ0FBQyxZQUFZLEVBQUM7Z0JBRWIsTUFBTSxhQUFhLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO3FCQUM3RCxhQUFhLENBQUMsNENBQWlCLENBQUM7cUJBQ2hDLGtCQUFrQixDQUFDLG1CQUFtQixDQUFDO3FCQUN2QyxLQUFLLENBQUMsOEJBQThCLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztxQkFDOUMsT0FB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