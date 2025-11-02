"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatePlayerService = void 0;
const pinus_1 = require("pinus");
const pinus_logger_1 = require("pinus-logger");
const Player_manager_1 = require("../../../../common/dao/daoManager/Player.manager");
const index_1 = require("../../../../utils/index");
const Player_builder_1 = require("../../../../common/dao/mysql/builder/Player.builder");
const SystemConfig_manager_1 = require("../../../../common/dao/daoManager/SystemConfig.manager");
const DayCreatePlayer_redis_dao_1 = require("../../../../common/dao/redis/DayCreatePlayer.redis.dao");
const PlayerAgent_mysql_dao_1 = require("../../../../common/dao/mysql/PlayerAgent.mysql.dao");
const PlayerRebate_mysql_dao_1 = require("../../../../common/dao/mysql/PlayerRebate.mysql.dao");
const PlayerAgent_redis_dao_1 = require("../../../../common/dao/redis/PlayerAgent.redis.dao");
class GatePlayerService {
    constructor() {
        this.logger = (0, pinus_logger_1.getLogger)("server_out", __filename);
        this.lineCodeList = ['line_1', 'line_2', 'line_3', 'line_4', 'line_5', 'line_6', 'line_7', 'line_8', 'line_9', 'line_10', 'line_11', 'line_12', 'line_13', 'line_14', 'line_15'];
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
                let index = (0, index_1.random)(0, 14);
                let lineCode = this.lineCodeList[index];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0ZVBsYXllclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nYXRlL2xpYi9zZXJ2aWNlcy9HYXRlUGxheWVyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBc0M7QUFDdEMsK0NBQXlDO0FBQ3pDLHFGQUE2RTtBQUM3RSxtREFBK0M7QUFDL0Msd0ZBQW9GO0FBQ3BGLGlHQUF5RjtBQUN6RixzR0FBcUY7QUFDckYsOEZBQXFGO0FBQ3JGLGdHQUF1RjtBQUN2Riw4RkFBcUY7QUFFckYsTUFBYSxpQkFBaUI7SUFJMUI7UUFDSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLFFBQVEsRUFBQyxRQUFRLEVBQUMsUUFBUSxFQUFDLFFBQVEsRUFBQyxRQUFRLEVBQUMsUUFBUSxFQUFDLFFBQVEsRUFBQyxRQUFRLEVBQUMsUUFBUSxFQUFDLFNBQVMsRUFBQyxTQUFTLEVBQUMsU0FBUyxFQUFDLFNBQVMsRUFBQyxTQUFTLEVBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkssQ0FBQztJQUVNLEtBQUssQ0FBQyxZQUFZLENBQUMsVUFBa0IsSUFBSSxFQUFFLFdBQW1CLElBQUksRUFBRSxXQUFtQixJQUFJLEVBQUUsV0FBbUIsSUFBSSxFQUFFLGNBQXNCLElBQUksRUFBRSxXQUFtQixJQUFJLEVBQUcsV0FBbUIsSUFBSSxFQUFHLFdBQW9CLElBQUksRUFBRyxXQUFvQixJQUFJO1FBQzVQLElBQUk7WUFDQSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksOEJBQWEsRUFBRTtpQkFDdkMsWUFBWSxFQUFFO2lCQUNkLFVBQVUsQ0FBQyxPQUFPLENBQUM7aUJBQ25CLGFBQWEsRUFBRTtpQkFDZixXQUFXLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFR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