"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatePlayerService = void 0;
const pinus_1 = require("pinus");
const pinus_logger_1 = require("pinus-logger");
const Player_manager_1 = require("../../../../common/dao/daoManager/Player.manager");
const Player_builder_1 = require("../../../../common/dao/mysql/builder/Player.builder");
const SystemConfig_manager_1 = require("../../../../common/dao/daoManager/SystemConfig.manager");
const DayCreatePlayer_redis_dao_1 = require("../../../../common/dao/redis/DayCreatePlayer.redis.dao");
const PlayerAgent_mysql_dao_1 = require("../../../../common/dao/mysql/PlayerAgent.mysql.dao");
const PlayerRebate_mysql_dao_1 = require("../../../../common/dao/mysql/PlayerRebate.mysql.dao");
const PlayerAgent_redis_dao_1 = require("../../../../common/dao/redis/PlayerAgent.redis.dao");
class GatePlayerService {
    constructor() {
        this.logger = (0, pinus_logger_1.getLogger)("server_out", __filename);
        this.lineCodeList = ['line_1'];
    }
    async createPlayer(guestId = null, superior = null, group_id = null, thirdUid = null, groupRemark = null, language = null, lineCode = null, shareUid = null, rom_type = null) {
        try {
            const playerImpl = await new Player_builder_1.PlayerBuilder()
                .createPlayer()
                .setGuestId(guestId)
                .setPlayerRole()
                .setThirdUid(superior, group_id, thirdUid, groupRemark, language, lineCode, shareUid, rom_type)
                .getPlayerImpl();
            const cfg = await SystemConfig_manager_1.default.findOne({ id: 1 });
            playerImpl.gold = cfg.startGold || 0;
            if (!language && cfg.languageForWeb) {
                playerImpl.language = cfg.languageForWeb;
            }
            const p = await Player_manager_1.default.insertOne(playerImpl);
            await DayCreatePlayer_redis_dao_1.default.insertOne({ uid: p.uid, createTime: Date.now() });
            return !!p ? p : null;
        }
        catch (e) {
            let ServerId = pinus_1.pinus.app && pinus_1.pinus.app.getServerId() || "";
            this.logger.error(`网关服务器 ${ServerId} | 玩家服务 | 创建玩家出错: ${e.stack}`);
            return null;
        }
    }
    async checkPlayerExits(guestid, defaultChannelCode, channelCode, shareUid, rom_type) {
        try {
            if (shareUid && shareUid.length == 8) {
                const playerAgent = await PlayerAgent_mysql_dao_1.default.findOne({ uid: shareUid });
                if (!playerAgent) {
                    shareUid = null;
                }
            }
            else {
                shareUid = null;
            }
            let player = null;
            if (guestid) {
                player = await Player_manager_1.default.findOne({ guestid }, true);
            }
            if (!player) {
                let lineCode = this.lineCodeList[0];
                if (channelCode) {
                    const platfromInfo = await PlayerAgent_redis_dao_1.default.findOne({ platformName: channelCode });
                    if (!platfromInfo) {
                        const platfromInfo = await PlayerAgent_redis_dao_1.default.findOne({ platformName: defaultChannelCode });
                        if (platfromInfo) {
                            player = await this.createPlayer(null, platfromInfo.uid, platfromInfo.rootUid, null, platfromInfo.platformName, null, lineCode, shareUid, rom_type);
                            PlayerAgent_mysql_dao_1.default.insertOne({
                                uid: player.uid,
                                parentUid: platfromInfo.uid,
                                rootUid: platfromInfo.rootUid,
                                platformName: player.uid,
                                platformGold: 0,
                                deepLevel: platfromInfo.deepLevel + 1,
                                roleType: 1,
                                status: 1,
                            });
                            if (shareUid) {
                                PlayerRebate_mysql_dao_1.default.updateAddDayPeople(shareUid, 1);
                            }
                        }
                        else {
                            player = await this.createPlayer();
                        }
                    }
                    else {
                        player = await this.createPlayer(null, platfromInfo.uid, platfromInfo.rootUid, null, platfromInfo.platformName, null, lineCode, shareUid, rom_type);
                        PlayerAgent_mysql_dao_1.default.insertOne({
                            uid: player.uid,
                            parentUid: platfromInfo.uid,
                            rootUid: platfromInfo.rootUid,
                            platformName: player.uid,
                            platformGold: 0,
                            deepLevel: platfromInfo.deepLevel + 1,
                            roleType: 1,
                            status: 1,
                        });
                        if (shareUid) {
                            PlayerRebate_mysql_dao_1.default.updateAddDayPeople(shareUid, 1);
                        }
                    }
                }
                else {
                    if (defaultChannelCode) {
                        const platfromInfo = await PlayerAgent_redis_dao_1.default.findOne({ platformName: defaultChannelCode });
                        if (platfromInfo) {
                            player = await this.createPlayer(null, platfromInfo.uid, platfromInfo.rootUid, null, platfromInfo.platformName, null, lineCode, shareUid);
                            PlayerAgent_mysql_dao_1.default.insertOne({
                                uid: player.uid,
                                parentUid: platfromInfo.uid,
                                rootUid: platfromInfo.rootUid,
                                platformName: player.uid,
                                platformGold: 0,
                                deepLevel: platfromInfo.deepLevel + 1,
                                roleType: 1,
                                status: 1,
                            });
                            if (shareUid) {
                                PlayerRebate_mysql_dao_1.default.updateAddDayPeople(shareUid, 1);
                            }
                        }
                        else {
                            player = await this.createPlayer(null, null, null, null, null, null, lineCode, null);
                        }
                    }
                    else {
                        player = await this.createPlayer(null, null, null, null, null, null, lineCode, null);
                    }
                }
            }
            return player;
        }
        catch (e) {
            this.logger.error(`网关服务器 ${pinus_1.pinus.app.getServerId()} | 玩家服务 | 检测玩家存在或创建玩家出错: ${e.stack}`);
            return null;
        }
    }
}
exports.GatePlayerService = GatePlayerService;
exports.default = new GatePlayerService();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0ZVBsYXllclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nYXRlL2xpYi9zZXJ2aWNlcy9HYXRlUGxheWVyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBc0M7QUFDdEMsK0NBQXlDO0FBQ3pDLHFGQUE2RTtBQUU3RSx3RkFBb0Y7QUFDcEYsaUdBQXlGO0FBQ3pGLHNHQUFxRjtBQUNyRiw4RkFBcUY7QUFDckYsZ0dBQXVGO0FBQ3ZGLDhGQUFxRjtBQUVyRixNQUFhLGlCQUFpQjtJQUkxQjtRQUNJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVNLEtBQUssQ0FBQyxZQUFZLENBQUMsVUFBa0IsSUFBSSxFQUFFLFdBQW1CLElBQUksRUFBRSxXQUFtQixJQUFJLEVBQUUsV0FBbUIsSUFBSSxFQUFFLGNBQXNCLElBQUksRUFBRSxXQUFtQixJQUFJLEVBQUUsV0FBbUIsSUFBSSxFQUFFLFdBQW1CLElBQUksRUFBRSxXQUFtQixJQUFJO1FBQ3ZQLElBQUk7WUFDQSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksOEJBQWEsRUFBRTtpQkFDdkMsWUFBWSxFQUFFO2lCQUNkLFVBQVUsQ0FBQyxPQUFPLENBQUM7aUJBQ25CLGFBQWEsRUFBRTtpQkFDZixXQUFXLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQztpQkFDOUYsYUFBYSxFQUFFLENBQUM7WUFDckIsTUFBTSxHQUFHLEdBQUcsTUFBTSw4QkFBbUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENB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