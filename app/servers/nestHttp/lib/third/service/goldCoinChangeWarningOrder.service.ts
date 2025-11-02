import { Injectable, Logger } from '@nestjs/common';
import * as ThirdApiWarnGoldDao from '../../../../../common/dao/redis/ThirdApiWarnGoldDao';
import { Player } from '../../../../../common/dao/mysql/entity/Player.entity';
import ThirdGoldRecordMysqlDao from '../../../../../common/dao/mysql/ThirdGoldRecord.mysql.dao';
import { ThirdGoldRecordType } from "../../../../../common/dao/mysql/entity/enum/ThirdGoldRecordType.enum";
import { ThirdGoldRecordStatus } from "../../../../../common/dao/mysql/entity/enum/ThirdGoldRecordStatus.enum";
import PlayerRedisDao from '../../../../../common/dao/redis/Player.redis.dao';
import ConnectionManager from "../../../../../common/dao/mysql/lib/connectionManager";

/**
 * 金币预警订单
 */
@Injectable()
export class GoldCoinChangeWarningOrderService {
    /**
     * 查询上一次上分记录
     */
    async checkLowerMoney(player: Player, money: number | null, account: string, orderId: string, agentRecord: any, agent: string, timestamp: number) {

        try {
            if (player.earlyWarningFlag) {
                return true;
            }

            // Step 1: 取出最近一次金币大于0的登入记录
            const goldRecordInfo = await ThirdGoldRecordMysqlDao.findOneForEesc(player.uid);

            if (!goldRecordInfo) {
                return true;
            }
            // Step 2: 取出预警金币配置信息
            const warnGoldCfg = await ThirdApiWarnGoldDao.findWarnGoldCfg();

            if (!Array.isArray(warnGoldCfg) && warnGoldCfg.length === 0) {
                Logger.warn(`玩家 ${player.uid} 下分 | 金币预警异常: 后台没有配置预警金币区间值，按默认《自动通过》处理`);
                return true;
            }

            if (warnGoldCfg.every(cfg => cfg.status === 0)) {
                Logger.warn(`玩家 ${player.uid} 下分 | 金币预警异常: 预警金币区间值均设置《未生效》，按默认《自动通过》处理`);
                return true;
            }


            // Step 3: 检测是否满足目标区间
            const beContinue = warnGoldCfg.reduce((beContinue: boolean, info) => {
                if (!beContinue) {
                    return beContinue;
                }
                /**
                 * startGold    最低带入金额
                 * endGold      最大带入金额
                 * targetGold   人工介入金额
                 * status       是否生效       0 1
                 */
                const { startGold, endGold, targetGold, status } = info;

                if (status === 0) {
                    return beContinue;
                }

                if (player.oneAddRmb >= startGold && player.oneAddRmb <= endGold) {
                    if (typeof money === "number") {
                        if (Math.abs(money * 100) >= targetGold) {
                            Logger.log(`玩家 ${player.uid} 下分 | 目标分数:${money} | 满足区间[${startGold},${endGold}] | 高于预警金币: ${targetGold}`);
                            return false;
                        }
                    } else {
                        if (player.gold >= targetGold) {
                            Logger.log(`玩家 ${player.uid} 下分 | 全部下分:${player.gold} | 满足区间[${startGold},${endGold}] | 高于预警金币: ${targetGold}`);
                            return false;
                        }
                    }
                }

                return beContinue;
            }, true);

            Logger.warn(`玩家:${player.uid} | ${beContinue ? "不" : "是"}进入预警阶段`);

            if (!beContinue) {
                let updateGold = player.gold;
                player.gold -= updateGold;
                if (typeof player.earlyWarningGold === "number") {
                    player.entryGold += player.oneAddRmb;
                    player.earlyWarningGold += updateGold;
                } else {
                    player.earlyWarningGold = updateGold;
                    player.entryGold = player.oneAddRmb;
                }

                /** Step 5: 数据库事务操作 */
                await ConnectionManager.getManager()
                    .transaction(async entityManager => {

                        /**step1 更新玩家身上的金币**/
                        await entityManager.update(Player, { uid: player.uid }, {
                            gold: player.gold,
                            earlyWarningGold: player.earlyWarningGold,
                            oneAddRmb: 0,
                            entryGold: player.entryGold
                        });

                        await PlayerRedisDao.updateOne({ uid: player.uid }, { gold: player.gold,  oneAddRmb: 0 });
                    });
                /**step3 添加玩家上下分记录**/
                const recordInfo = {
                    orderId: orderId,
                    uid: player.uid,
                    type: ThirdGoldRecordType.Player,
                    agentRemark: agent,
                    goldChangeBefore: Math.floor(updateGold),
                    gold: typeof money === "number" ? (money * 100) : player.gold,
                    goldChangeAfter: typeof money === "number" ? player.gold : 0,
                    status: ThirdGoldRecordStatus.WaitingForReview,
                    remark: "等待审核"
                };
                await ThirdGoldRecordMysqlDao.insertOne(recordInfo);

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
        } catch (e) {
            Logger.error(`玩家下分 | 金币预警出错:${e.stack}`);
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
}