'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userEnvRecord = exports.funningMoneyDeduct = exports.addMoney = exports.deductMoney = exports.boomNotice = exports.boomJudge = exports.dealOnlineAward = exports.addMoneyNew = void 0;
__exportStar(require("../../utils/goldUtil"), exports);
const mathjs = require("mathjs");
const util = require("../../utils");
const censusMgr = require("../../utils/db/dbMgr/censusMgr");
const MessageService = require("../../services/MessageService");
const pinus_logger_1 = require("pinus-logger");
const langsrv = require("../../services/common/langsrv");
const globalErrorLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const addMoneyNew = function (player, money) {
    money = Math.abs(money);
    if (!player || typeof money !== 'number' || money <= 0) {
        globalErrorLogger.info('处理加钱失败', player, money);
        return [];
    }
    player.gold += money;
    return ['gold'];
};
exports.addMoneyNew = addMoneyNew;
const dealOnlineAward = function (totalBet, onlineAwards) {
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
};
exports.dealOnlineAward = dealOnlineAward;
const boomJudge = function (jackpot, amount, bet, maxOdd) {
    if (jackpot < 5000000) {
        return false;
    }
    const rate = 1 - (1 - 15 * mathjs.log(amount + 5, 10) / (4000 + 4 * mathjs.log(amount + 5, 10)))
        * (1 - (jackpot / 10000 / (100 * (jackpot / 10000) * 5 + 5 * 100000) + 0.002));
    return (Math.random() < rate && jackpot >= maxOdd * bet);
};
exports.boomJudge = boomJudge;
const boomNotice = function ({ nickname, gname, roomId, num, moneyType, session }) {
    moneyType = moneyType == 'integral' ? '积分' : '金币';
    const content = '恭喜<color=#FDD105>' + decodeURI(nickname) + '</c>在<color=#FDD105>'
        + gname + '</c>游戏<color=#FDD105>' + roomId + '</c>号机器爆机成功 获得<color=#FDD105>'
        + util.moneyToString(num) + '</c>' + moneyType;
    let data;
    data.route = 'system';
    data.content = content;
    data.session = session;
    MessageService.notice(data);
};
exports.boomNotice = boomNotice;
const deductMoney = function (totalBet, { integral = 0, gold, isVip = false }, profitAccu = 0, indiana = false) {
    if (isVip) {
        if (indiana) {
            if (util.sum([integral, profitAccu]) < totalBet) {
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_25) };
            }
            if (integral >= totalBet) {
                return { code: 200, remainder: integral - totalBet, envProfit: profitAccu, intoJackpot: true };
            }
            else {
                return { code: 200, remainder: 0, envProfit: profitAccu - (totalBet - integral), intoJackpot: true };
            }
        }
        else {
            if (integral - totalBet < 0) {
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_25) };
            }
            else {
                return { code: 200, remainder: integral - totalBet, envProfit: 0, intoJackpot: true };
            }
        }
    }
    else {
        if (indiana) {
            if (util.sum(gold) + util.sum(profitAccu) < totalBet) {
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_1015) };
            }
            if (util.sum(gold) >= totalBet) {
                if (gold >= totalBet) {
                    gold -= totalBet;
                    return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true };
                }
                else {
                    censusMgr.addAnnexationRechargeMoney(gold);
                    gold -= (totalBet - gold);
                    gold = 0;
                    return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true };
                }
            }
            else {
                if (gold > 0) {
                    if (gold > 0) {
                        if (profitAccu >= totalBet - gold) {
                            censusMgr.addAnnexationRechargeMoney(gold);
                            profitAccu -= (totalBet - util.sum(gold));
                        }
                        else {
                            censusMgr.addAnnexationRechargeMoney(totalBet - gold - profitAccu);
                            profitAccu -= (totalBet - util.sum(gold) - profitAccu);
                            profitAccu = 0;
                        }
                        gold = 0;
                        return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true };
                    }
                    else {
                        if (util.sum([gold, profitAccu]) > totalBet) {
                            profitAccu -= (totalBet - util.sum(gold));
                            gold = 0;
                            return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true };
                        }
                        else {
                            if (profitAccu + gold >= totalBet) {
                                censusMgr.addAnnexationRechargeMoney(gold);
                                profitAccu -= (totalBet - gold);
                                gold = 0;
                            }
                            else {
                                censusMgr.addAnnexationRechargeMoney(totalBet - profitAccu);
                                profitAccu -= (totalBet - gold - profitAccu);
                                profitAccu = 0;
                                gold = 0;
                            }
                            return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true };
                        }
                    }
                }
                else {
                    if (gold > 0) {
                        if (gold + profitAccu >= totalBet) {
                            profitAccu -= (totalBet - gold);
                            gold = 0;
                        }
                        else {
                            censusMgr.addAnnexationRechargeMoney(totalBet - gold - profitAccu);
                            profitAccu -= (totalBet - gold - profitAccu);
                            profitAccu = 0;
                            gold = 0;
                        }
                        return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true };
                    }
                    else {
                        if (profitAccu >= totalBet) {
                            profitAccu -= totalBet;
                            return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true };
                        }
                        else {
                            censusMgr.addAnnexationRechargeMoney(profitAccu);
                            profitAccu -= (totalBet - profitAccu);
                            profitAccu = 0;
                            return { code: 200, remainder: gold, envProfit: profitAccu, intoJackpot: true };
                        }
                    }
                }
            }
        }
        else {
            if (util.sum(gold) - totalBet < 0) {
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_1015) };
            }
            if (gold >= totalBet) {
                gold -= totalBet;
                return { code: 200, remainder: gold, envProfit: 0, intoJackpot: true };
            }
            else {
                censusMgr.addAnnexationRechargeMoney(gold);
                gold -= (totalBet - gold);
                gold = 0;
                return { code: 200, remainder: gold, envProfit: 0, intoJackpot: true };
            }
        }
    }
};
exports.deductMoney = deductMoney;
const addMoney = function ({ isVip = false, gold, integral = 0 }, count, addRandom = false) {
    if (isVip) {
        return addRandom ? [integral + count, true] : integral + count;
    }
    else {
        if (addRandom) {
            gold += util.sum(count);
            gold = gold | 0;
            return [gold, true];
        }
        else {
            gold += count;
            gold += count;
            gold = gold || 0;
            return gold;
        }
    }
};
exports.addMoney = addMoney;
const funningMoneyDeduct = function ({ isVip, num, money }) {
    if (isVip) {
        return money - num;
    }
    else {
        if (money >= num) {
            money -= num;
        }
        else {
            money -= (num - money);
            money = 0;
        }
        return money;
    }
};
exports.funningMoneyDeduct = funningMoneyDeduct;
const userEnvRecord = function ({ app, isVip, uid, server, viper = null }) {
    return new Promise((resolve, reject) => {
        app.rpc[server].mainRemote.getEnvRecord(null, { isVip, uid, viper }, function (envRecord) {
            return resolve(envRecord);
        });
    });
};
exports.userEnvRecord = userEnvRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9kb21haW4vZ2FtZXMvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ2IsdURBQXFDO0FBQ3JDLGlDQUFrQztBQUNsQyxvQ0FBcUM7QUFDckMsNERBQTZEO0FBQzdELGdFQUFpRTtBQUNqRSwrQ0FBeUM7QUFDekMseURBQXlEO0FBQ3pELE1BQU0saUJBQWlCLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQVF2RCxNQUFNLFdBQVcsR0FBRyxVQUFVLE1BQU0sRUFBRSxLQUFLO0lBQzlDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hCLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7UUFDcEQsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEQsT0FBTyxFQUFFLENBQUM7S0FDYjtJQUNELE1BQU0sQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQixDQUFDLENBQUE7QUFSWSxRQUFBLFdBQVcsZUFRdkI7QUFnQ00sTUFBTSxlQUFlLEdBQUcsVUFBVSxRQUFRLEVBQUUsWUFBWTtJQUUzRCxPQUFPLEtBQUssQ0FBQztJQUNiLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxZQUFZLEVBQUU7UUFDNUIsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFDRCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRTtRQUM1QyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxRQUFRLEdBQUcs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