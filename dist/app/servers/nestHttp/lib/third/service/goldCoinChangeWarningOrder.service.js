"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoldCoinChangeWarningOrderService = void 0;
const common_1 = require("@nestjs/common");
const ThirdApiWarnGoldDao = require("../../../../../common/dao/redis/ThirdApiWarnGoldDao");
const Player_entity_1 = require("../../../../../common/dao/mysql/entity/Player.entity");
const ThirdGoldRecord_mysql_dao_1 = require("../../../../../common/dao/mysql/ThirdGoldRecord.mysql.dao");
const ThirdGoldRecordType_enum_1 = require("../../../../../common/dao/mysql/entity/enum/ThirdGoldRecordType.enum");
const ThirdGoldRecordStatus_enum_1 = require("../../../../../common/dao/mysql/entity/enum/ThirdGoldRecordStatus.enum");
const Player_redis_dao_1 = require("../../../../../common/dao/redis/Player.redis.dao");
const connectionManager_1 = require("../../../../../common/dao/mysql/lib/connectionManager");
let GoldCoinChangeWarningOrderService = class GoldCoinChangeWarningOrderService {
    async checkLowerMoney(player, money, account, orderId, agentRecord, agent, timestamp) {
        try {
            if (player.earlyWarningFlag) {
                return true;
            }
            const goldRecordInfo = await ThirdGoldRecord_mysql_dao_1.default.findOneForEesc(player.uid);
            if (!goldRecordInfo) {
                return true;
            }
            const warnGoldCfg = await ThirdApiWarnGoldDao.findWarnGoldCfg();
            if (!Array.isArray(warnGoldCfg) && warnGoldCfg.length === 0) {
                common_1.Logger.warn(`玩家 ${player.uid} 下分 | 金币预警异常: 后台没有配置预警金币区间值，按默认《自动通过》处理`);
                return true;
            }
            if (warnGoldCfg.every(cfg => cfg.status === 0)) {
                common_1.Logger.warn(`玩家 ${player.uid} 下分 | 金币预警异常: 预警金币区间值均设置《未生效》，按默认《自动通过》处理`);
                return true;
            }
            const beContinue = warnGoldCfg.reduce((beContinue, info) => {
                if (!beContinue) {
                    return beContinue;
                }
                const { startGold, endGold, targetGold, status } = info;
                if (status === 0) {
                    return beContinue;
                }
                if (player.oneAddRmb >= startGold && player.oneAddRmb <= endGold) {
                    if (typeof money === "number") {
                        if (Math.abs(money * 100) >= targetGold) {
                            common_1.Logger.log(`玩家 ${player.uid} 下分 | 目标分数:${money} | 满足区间[${startGold},${endGold}] | 高于预警金币: ${targetGold}`);
                            return false;
                        }
                    }
                    else {
                        if (player.gold >= targetGold) {
                            common_1.Logger.log(`玩家 ${player.uid} 下分 | 全部下分:${player.gold} | 满足区间[${startGold},${endGold}] | 高于预警金币: ${targetGold}`);
                            return false;
                        }
                    }
                }
                return beContinue;
            }, true);
            common_1.Logger.warn(`玩家:${player.uid} | ${beContinue ? "不" : "是"}进入预警阶段`);
            if (!beContinue) {
                let updateGold = player.gold;
                player.gold -= updateGold;
                if (typeof player.earlyWarningGold === "number") {
                    player.entryGold += player.oneAddRmb;
                    player.earlyWarningGold += updateGold;
                }
                else {
                    player.earlyWarningGold = updateGold;
                    player.entryGold = player.oneAddRmb;
                }
                await connectionManager_1.default.getManager()
                    .transaction(async (entityManager) => {
                    await entityManager.update(Player_entity_1.Player, { uid: player.uid }, {
                        gold: player.gold,
                        earlyWarningGold: player.earlyWarningGold,
                        oneAddRmb: 0,
                        entryGold: player.entryGold
                    });
                    await Player_redis_dao_1.default.updateOne({ uid: player.uid }, { gold: player.gold, oneAddRmb: 0 });
                });
                const recordInfo = {
                    orderId: orderId,
                    uid: player.uid,
                    type: ThirdGoldRecordType_enum_1.ThirdGoldRecordType.Player,
                    agentRemark: agent,
                    goldChangeBefore: Math.floor(updateGold),
                    gold: typeof money === "number" ? (money * 100) : player.gold,
                    goldChangeAfter: typeof money === "number" ? player.gold : 0,
                    status: ThirdGoldRecordStatus_enum_1.ThirdGoldRecordStatus.WaitingForReview,
                    remark: "等待审核"
                };
                await ThirdGoldRecord_mysql_dao_1.default.insertOne(recordInfo);
                return {
                    s: 103,
                    m: "/lowerPlayerMoney",
                    d: {
                        code: 48,
                        account,
                        money: 0,
                    }
                };
            }
            return true;
        }
        catch (e) {
            common_1.Logger.error(`玩家下分 | 金币预警出错:${e.stack}`);
            return {
                s: 103,
                m: "/lowerPlayerMoney",
                d: {
                    code: 48,
                    account,
                    money: 0,
                }
            };
        }
    }
};
GoldCoinChangeWarningOrderService = __decorate([
    (0, common_1.Injectable)()
], GoldCoinChangeWarningOrderService);
exports.GoldCoinChangeWarningOrderService = GoldCoinChangeWarningOrderService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZENvaW5DaGFuZ2VXYXJuaW5nT3JkZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL25lc3RIdHRwL2xpYi90aGlyZC9zZXJ2aWNlL2dvbGRDb2luQ2hhbmdlV2FybmluZ09yZGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsMkNBQW9EO0FBQ3BELDJGQUEyRjtBQUMzRix3RkFBOEU7QUFDOUUseUdBQWdHO0FBQ2hHLG1IQUEyRztBQUMzRyx1SEFBK0c7QUFDL0csdUZBQThFO0FBQzlFLDZGQUFzRjtBQU10RixJQUFhLGlDQUFpQyxHQUE5QyxNQUFhLGlDQUFpQztJQUkxQyxLQUFLLENBQUMsZUFBZSxDQUFDLE1BQWMsRUFBRSxLQUFvQixFQUFFLE9BQWUsRUFBRSxPQUFlLEVBQUUsV0FBZ0IsRUFBRSxLQUFhLEVBQUUsU0FBaUI7UUFFNUksSUFBSTtZQUNBLElBQUksTUFBTSxDQUFDLGdCQUFnQixFQUFFO2dCQUN6QixPQUFPLElBQUksQ0FBQzthQUNmO1lBR0QsTUFBTSxjQUFjLEdBQUcsTUFBTSxtQ0FBdUIsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWhGLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ2pCLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRWhFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN6RCxlQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sTUFBTSxDQUFDLEdBQUcseUNBQXlDLENBQUMsQ0FBQztnQkFDdkUsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUVELElBQUksV0FBVyxDQUFDLEtBQUssQ0FB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