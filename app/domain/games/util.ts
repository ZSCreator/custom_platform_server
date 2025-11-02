'use strict';
export * from '../../utils/goldUtil';
import mathjs = require('mathjs');
import util = require('../../utils');
import censusMgr = require('../../utils/db/dbMgr/censusMgr');
import MessageService = require('../../services/MessageService');
import { getLogger } from 'pinus-logger';
import * as langsrv from "../../services/common/langsrv";
const globalErrorLogger = getLogger('server_out', __filename);


/**
 *加钱
 * @param player  玩家对象 money加钱的金额
 * @param money  返回值 更新的字段数组
 */
export const addMoneyNew = function (player, money) {
    money = Math.abs(money);
    if (!player || typeof money !== 'number' || money <= 0) {
        globalErrorLogger.info('处理加钱失败', player, money);
        return [];
    }
    player.gold += money;
    return ['gold'];
}
// /**
//  * 扣钱
//  * @param param player 玩家对象 money扣除的金额 running是否记录流水（默认记录）
//  *返回值 更新的字段数组
//  */
// export const deductMoneyNew = function ({ player, money, running = false }) {
//     const updateArr = ['gold'];
//     money = Math.abs(money);
//     if (!player || !player.gold || typeof money !== 'number' || money <= 0) {
//         globalErrorLogger.info('处理扣钱失败', player, money);
//         return [];
//     }
//     if (money > player.gold) {
//         globalErrorLogger.info('扣钱时金币不足', player, money);
//         return [];
//     }
//     // 执行扣钱(先把金币字段为零的扣掉)
//     player.gold -= money;
//     if (player.gold < 0) {
//         player.gold = 0;
//     }
//     return updateArr;
// }




/**
 * 判断是否开出联机大奖
 *  totalBet-玩家总押注  onlineAwards-联机大奖奖池
 */
export const dealOnlineAward = function (totalBet, onlineAwards) {
    // 暂时屏蔽联机大奖
    return false;
    if (!totalBet || !onlineAwards) {
        return false;
    }
    if (onlineAwards > util.random(200000, 500000)) {
        if (Math.random() < totalBet / onlineAwards) {
            return true;
        }
    }
    return false;
}

/*
 * 判断能否触发爆机
 * @param jackpot: 奖池金额, amount:充值金额, bet: 下注倍数, maxOdd: 最大奖倍数
 */
export const boomJudge = function (jackpot, amount, bet, maxOdd) {
    if (jackpot < 5000000) {
        return false;
    }
    const rate = 1 - (1 - 15 * mathjs.log(amount + 5, 10) / (4000 + 4 * mathjs.log(amount + 5, 10)))
        * (1 - (jackpot / 10000 / (100 * (jackpot / 10000) * 5 + 5 * 100000) + 0.002));
    return (Math.random() < rate && jackpot >= maxOdd * bet);
}

/**
 * 发送爆机公告
 */
export const boomNotice = function ({ nickname, gname, roomId, num, moneyType, session }) {
    moneyType = moneyType == 'integral' ? '积分' : '金币';
    const content = '恭喜<color=#FDD105>' + decodeURI(nickname) + '</c>在<color=#FDD105>'
        + gname + '</c>游戏<color=#FDD105>' + roomId + '</c>号机器爆机成功 获得<color=#FDD105>'
        + util.moneyToString(num) + '</c>' + moneyType;
    let data: MessageService.notice_Interface;
    data.route = 'system';
    data.content = content;
    data.session = session;
    MessageService.notice(data);
}

/**
 * 处理玩家扣钱问题
 * @return 是否进入奖池 扣款后的货币@remainder
 * indiana 是否是夺宝类游戏 profitAccu: 盈利累积  返回玩家货币 和 扣款后的盈利累计 和 是否进入奖池
 */
export const deductMoney = function (totalBet: number, { integral = 0, gold, isVip = false }, profitAccu: number = 0, indiana: boolean = false) {
    if (isVip) {
        if (indiana) {
            if (util.sum([integral, profitAccu]) < totalBet) {
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_25) };
            }
            if (integral >= totalBet) {   //玩家自身的积分足够
                return { code: 200, remainder: integral - totalBet, envProfit: profitAccu, intoJackpot: true }
            } else {
                return { code: 200, remainder: 0, envProfit: profitAccu - (totalBet - integral), intoJackpot: true }
            }
        } else {
            if (integral - totalBet < 0) {
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_25) };
            } else {
                return { code: 200, remainder: integral - totalBet, envProfit: 0, intoJackpot: true }
            }
        }
    } else {
        if (indiana) {
            if (util.sum(gold) + util.sum(profitAccu) < totalBet) {
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_1015) };
            }
            //从玩家角度(看到的两个金币数量是不区分类型的)
            if (util.sum(gold) >= totalBet) {
                if (gold >= totalBet) {
                    gold -= totalBet;
                    return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true }
                } else {
                    censusMgr.addAnnexationRechargeMoney(gold);
                    gold -= (totalBet - gold);
                    gold = 0;
                    return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true }
                }
            } else {  //玩家自身金币不够
                if (gold > 0) {  //玩家还有非充值金币
                    if (gold > 0) {
                        //判断盈利累积中的非充值金币是否足够
                        if (profitAccu >= totalBet - gold) {
                            censusMgr.addAnnexationRechargeMoney(gold);
                            profitAccu -= (totalBet - util.sum(gold));
                        } else {
                            censusMgr.addAnnexationRechargeMoney(totalBet - gold - profitAccu);
                            profitAccu -= (totalBet - util.sum(gold) - profitAccu);
                            profitAccu = 0;
                        }

                        gold = 0;
                        return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true }
                    } else {//玩家自身只有充值金币
                        if (util.sum([gold, profitAccu]) > totalBet) {
                            profitAccu -= (totalBet - util.sum(gold));
                            gold = 0;
                            return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true }
                        } else {
                            if (profitAccu + gold >= totalBet) {
                                censusMgr.addAnnexationRechargeMoney(gold);
                                profitAccu -= (totalBet - gold);
                                gold = 0;
                            } else {
                                censusMgr.addAnnexationRechargeMoney(totalBet - profitAccu);
                                profitAccu -= (totalBet - gold - profitAccu);
                                profitAccu = 0;
                                gold = 0;
                            }
                            return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true }
                        }
                    }
                } else {     //玩家只有非充值金币的情况
                    if (gold > 0) {
                        if (gold + profitAccu >= totalBet) {
                            profitAccu -= (totalBet - gold);
                            gold = 0;
                        } else {
                            censusMgr.addAnnexationRechargeMoney(totalBet - gold - profitAccu);
                            profitAccu -= (totalBet - gold - profitAccu);
                            profitAccu = 0;
                            gold = 0;
                        }
                        return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true }
                    } else { //玩家自身没有金币了
                        if (profitAccu >= totalBet) {
                            profitAccu -= totalBet;
                            return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true }
                        } else {
                            censusMgr.addAnnexationRechargeMoney(profitAccu);
                            profitAccu -= (totalBet - profitAccu);
                            profitAccu = 0;
                            return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true }
                        }
                    }
                }
            }

        } else {
            if (util.sum(gold) - totalBet < 0) {
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_1015) };
            }
            if (gold >= totalBet) {
                gold -= totalBet;   //扣充值的金币
                return { code: 200, remainder: gold, envProfit: 0, intoJackpot: true }
            } else {
                //记录系统侵吞的充值金币
                censusMgr.addAnnexationRechargeMoney(gold);
                gold -= (totalBet - gold);
                gold = 0;
                return { code: 200, remainder: gold, envProfit: 0, intoJackpot: true }
            }
        }
    }
}
/**
 * 玩家加钱处理
 */
export const addMoney = function ({ isVip = false, gold, integral = 0 }, count, addRandom = false) {
    if (isVip) {
        return addRandom ? [integral + count, true] : integral + count;
    } else {
        if (addRandom) {
            gold += util.sum(count);
            gold = gold | 0;
            return [gold, true];
        } else {
            // gold += count;
            gold += count;
            gold += count;
            gold = gold || 0;
            return gold;
        }
    }
}

/**
 * 功能性服务扣钱 (默认从非充值金币扣钱)
 * num-扣款数量  money-对应环境下玩家货币数
 * 这里默认玩家金钱数量足够
 */
export const funningMoneyDeduct = function ({ isVip, num, money }) {
    if (isVip) {
        return money - num;
    } else {
        if (money >= num) {
            money -= num;
        } else {
            money -= (num - money);
            money = 0;
        }
        return money;
    }
}

/**
 * 从指定服务器上取指定玩家的游戏内存记录
 */
export const userEnvRecord = function ({ app, isVip, uid, server, viper = null }) {
    return new Promise((resolve, reject) => {
        app.rpc[server].mainRemote.getEnvRecord(null, { isVip, uid, viper }, function (envRecord) {
            return resolve(envRecord);
        })
    });
}