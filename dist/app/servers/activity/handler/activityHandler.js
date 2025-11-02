'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityHandler = void 0;
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const langsrv = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
const SignRecord_mysql_dao_1 = require("../../../common/dao/mysql/SignRecord.mysql.dao");
const moment = require("moment");
const SystemConfig_manager_1 = require("../../../common/dao/daoManager/SystemConfig.manager");
const Utils = require("../../../utils");
const Player_manager_2 = require("../../../common/dao/daoManager/Player.manager");
const VipBonusDetails_mysql_dao_1 = require("../../../common/dao/mysql/VipBonusDetails.mysql.dao");
function default_1(app) {
    return new activityHandler(app);
}
exports.default = default_1;
;
class activityHandler {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
    async playerSign({}, session) {
        let language = null;
        const { uid } = session;
        try {
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
            }
            player.language = language;
            const record = await SignRecord_mysql_dao_1.default.findSignToUid(uid);
            if (record) {
                const recordTime = moment(record.createDate).format("YYYY-MM-DD HH:mm:ss");
                const dayTime = moment().format("YYYY-MM-DD 00:00:00");
                if (recordTime > dayTime) {
                    return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_211) };
                }
            }
            const systemConfig = await SystemConfig_manager_1.default.findOne({});
            let signData = systemConfig.signData;
            if (signData && signData.length == 0) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_211) };
            }
            signData.sort((a, b) => a - b);
            let start = signData[0] * 100;
            let end = signData[1] * 100;
            const gold = Utils.random(start, end);
            if (gold < 0) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_211) };
            }
            if (gold > 10000) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_211) };
            }
            let lastGold = player.gold + Math.floor(gold);
            await Player_manager_1.default.updateOne({ uid: player.uid }, { gold: lastGold });
            const info = {
                uid: player.uid,
                type: 1,
                beginGold: player.gold,
                lastGold: lastGold,
                gold: gold,
            };
            await SignRecord_mysql_dao_1.default.insertOne(info);
            return { code: 200, gold: gold, playerGold: lastGold };
        }
        catch (e) {
            this.logger.error(`| 玩家签到 | 出错:${e.stack}`);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_211) };
        }
    }
    ;
    async getPlayerSign({}, session) {
        let language = null;
        const { uid } = session;
        try {
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
            }
            player.language = language;
            let weekOfday = parseInt(moment().format("d"));
            if (weekOfday == 0) {
                weekOfday = 7;
            }
            let weekTime = moment().subtract(weekOfday - 1, 'days').format("YYYY-MM-DD 00:00:00");
            const records = await SignRecord_mysql_dao_1.default.findPlayerWeekSign(uid, weekTime);
            let resultList = [];
            let dayTime = moment().format("YYYY-MM-DD 00:00:00");
            for (let i = 1; i <= 7; i++) {
                let info = {
                    day: i,
                    isSign: false,
                    canSign: false,
                    expired: false,
                };
                let starTime = moment(weekTime).add(i - 1, 'day').format("YYYY-MM-DD 00:00:00");
                let endTime = moment(weekTime).add(i, 'day').format("YYYY-MM-DD 00:00:00");
                const item = records.find(x => starTime < moment(x.createDate).format("YYYY-MM-DD HH:mm:ss") && moment(x.createDate).format("YYYY-MM-DD HH:mm:ss") < endTime);
                if (item) {
                    info.isSign = true;
                    info.canSign = false;
                }
                else {
                    if (dayTime == starTime) {
                        info.isSign = false;
                        info.canSign = true;
                    }
                    else {
                        info.isSign = false;
                        info.canSign = false;
                    }
                }
                if (info.isSign == false && starTime < dayTime) {
                    info.expired = true;
                    info.canSign = false;
                }
                resultList.push(info);
            }
            return { code: 200, resultList };
        }
        catch (e) {
            this.logger.error(` | 获取签到面板 | 出错:${e.stack}`);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_211) };
        }
    }
    ;
    async getVipBonusDetails({}, session) {
        const uid = session.uid;
        let language = null;
        try {
            const player = await Player_manager_2.default.findOne({ uid });
            if (!player) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
            }
            language = player.language;
            let details = {
                level: 0,
                bonusForDayFlag: 1,
                bonus: 0,
                bonusFlag: 0,
                bonusForWeeks: 0,
                bonusForWeeksFlag: 0,
                bonusForMonth: 0,
                bonusForMonthFlag: 0,
            };
            const info = await VipBonusDetails_mysql_dao_1.default.findOne({ uid });
            if (info) {
                details.level = info.level;
                details.bonus = info.bonus;
                details.bonusFlag = info.whetherToReceiveLeverBonus;
                details.bonusForWeeks = info.bonusForWeeks;
                details.bonusForWeeksFlag = !info.bonusForWeeksLastDate ?
                    1 :
                    diffDays(info.bonusForWeeksLastDate) > 7 ? 1 : 0;
                details.bonusForMonth = info.bonusForMonth;
                details.bonusForMonthFlag = !info.bonusForMonthLastDate ?
                    1 :
                    diffDays(info.bonusForMonthLastDate) > 30 ? 1 : 0;
            }
            const record = await SignRecord_mysql_dao_1.default.findSignToUid(uid);
            if (record) {
                const recordTime = moment(record.createDate).format("YYYY-MM-DD HH:mm:ss");
                const dayTime = moment().format("YYYY-MM-DD 00:00:00");
                if (recordTime > dayTime) {
                    details.bonusForDayFlag = 0;
                }
            }
            return { code: 200, data: details };
        }
        catch (e) {
            return { code: 500, data: null, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_7) };
        }
    }
    async getVipBonus({ bonusType }, session) {
        const uid = session.uid;
        let language = null;
        try {
            if (typeof bonusType !== 'number') {
                return { code: 422, data: [], msg: "bonusType 类型错误，应为number" };
            }
            const player = await Player_manager_2.default.findOne({ uid });
            language = player.language;
            const info = await VipBonusDetails_mysql_dao_1.default.findOne({ uid });
            let gold = 0;
            switch (bonusType) {
                case 1:
                    if (info.bonus > 0 && info.whetherToReceiveLeverBonus) {
                        gold = info.bonus * 100;
                        await VipBonusDetails_mysql_dao_1.default.updateOne({ uid }, {
                            whetherToReceiveLeverBonus: 0,
                            bonus: 0
                        });
                    }
                    break;
                case 2:
                    if (info.bonusForWeeks > 0) {
                        if (info.bonusForWeeksLastDate === null || diffDays(info.bonusForWeeksLastDate) > 7) {
                            gold = info.bonusForWeeks * 100;
                            await VipBonusDetails_mysql_dao_1.default.updateOne({ uid }, {
                                bonusForWeeksLastDate: new Date(),
                                bonusForWeeks: 0
                            });
                        }
                    }
                    break;
                case 3:
                    if (info.bonusForMonth > 0) {
                        if (info.bonusForMonthLastDate === null || diffDays(info.bonusForMonthLastDate) > 30) {
                            gold = info.bonusForMonth * 100;
                            await VipBonusDetails_mysql_dao_1.default.updateOne({ uid }, {
                                bonusForMonthLastDate: new Date(),
                                bonusForMonth: 0
                            });
                        }
                    }
                    break;
                default:
                    break;
            }
            let updateGold = gold;
            if (gold > 0) {
                await Player_manager_2.default.updateOne({ uid }, { gold: player.gold + gold });
                gold += player.gold;
            }
            else {
                gold = player.gold;
            }
            return { code: 200, data: { gold, updateGold } };
        }
        catch (e) {
            return { code: 500, data: [], msg: langsrv.getlanguage(language, langsrv.Net_Message.id_99) };
        }
    }
    async getreceiveRelief(msg, session) {
        let language = null;
        try {
            const uid = session.uid;
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                throw langsrv.getlanguage(language, langsrv.Net_Message.id_3);
            }
            language = player.language;
            let almsTimes = 0;
            if (player.addRmb <= 0 && player.gold < 100 && player.cellPhone) {
                const createTime = moment(player.createTime).format("YYYY-MM-DD");
                const now = moment().format("YYYY-MM-DD");
                const diffDays = moment(now).diff(createTime, "d");
                if (diffDays < 4) {
                    if (almsTimes < 0) {
                        almsTimes = 0;
                    }
                }
            }
            return {
                code: 200,
                almsTimes: almsTimes,
                reliefGold: 5,
                underGold: 1
            };
        }
        catch (error) {
            this.logger.warn("获取救济金info", error);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_99) };
        }
    }
}
exports.activityHandler = activityHandler;
function diffDays(date) {
    const currentDate = moment().format("YYYY-MM-DD hh:mm:ss");
    const lastDate = moment(date).format("YYYY-MM-DD hh:mm:ss");
    const diffDays = moment(lastDate).diff(moment(currentDate), "d");
    return diffDays;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYWN0aXZpdHkvaGFuZGxlci9hY3Rpdml0eUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFJYixrRkFBNkU7QUFDN0UsNERBQTZEO0FBQzdELCtDQUF5QztBQUV6Qyx5RkFBZ0Y7QUFDaEYsaUNBQWlDO0FBQ2pDLDhGQUFzRjtBQUN0Rix3Q0FBeUM7QUFFekMsa0ZBQTBFO0FBQzFFLG1HQUEwRjtBQUkxRixtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRkQsNEJBRUM7QUFBQSxDQUFDO0FBR0YsTUFBYSxlQUFlO0lBRXhCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFTRCxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxPQUF1QjtRQUN4QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDcEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUN4QixJQUFJO1lBRUEsTUFBTSxNQUFNLEdBQVcsTUFBTSx3QkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNULE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7YUFDdEY7WUFDRCxNQUFNLENBQUMsUUFBUSxHQUFHLFFB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