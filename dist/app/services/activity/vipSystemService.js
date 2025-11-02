'use strict';
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVipLevelAndBouns = exports.initVipConfig = exports.getSystemVipRatio = exports.receiveVipSystemCommission = exports.getNexVipLevelNeedVipScore = exports.getPlayerLevel = void 0;
const pinus_logger_1 = require("pinus-logger");
const JsonMgr = require("../../../config/data/JsonMgr");
const CommonUtil = require("../../utils/lottery/commonUtil");
const VipConfig_mysql_dao_1 = require("../../common/dao/mysql/VipConfig.mysql.dao");
const VipBonusDetails_mysql_dao_1 = require("../../common/dao/mysql/VipBonusDetails.mysql.dao");
const moment = require("moment");
const globalErrorLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const getPlayerLevel = async (vipScore) => {
    let level = 0;
    try {
        const configJson = JsonMgr.get('system/vipConfig').datas;
        console.log('config1', configJson);
        const config = configJson.vipLevels;
        console.log('vipConfig', config);
        if (!config) {
            return 0;
        }
        let level = 0;
        if (!config || !vipScore) {
            return level;
        }
        if (!(config instanceof Array)) {
            return level;
        }
        config.sort((v1, v2) => {
            return v2.levelScore - v1.levelScore;
        });
        for (let value of config) {
            if (vipScore >= value.levelScore) {
                level = value.level;
                break;
            }
        }
        console.log('level', level);
        return level;
    }
    catch (e) {
        globalErrorLogger.info(`getPlayerLevel==vipScore: ${vipScore} 计算vip等级错误：${e.stack || e}`);
        return level;
    }
};
exports.getPlayerLevel = getPlayerLevel;
const getNexVipLevelNeedVipScore = async (selfVipLevel, nextVipLevel) => {
    let level = 0;
    try {
        const configJson = JsonMgr.get('system/vipConfig').datas;
        const config = configJson.vipLevels;
        if (!config) {
            return 10000;
        }
        const selfLevelScore = config.find(x => x.level == selfVipLevel).levelScore;
        const selfLevelRatio = config.find(x => x.level == selfVipLevel).ratio;
        const nextLevelScore = config.find(x => x.level == nextVipLevel).levelScore;
        const nextLevelRatio = config.find(x => x.level == nextVipLevel).ratio;
        return { selfLevelRatio, nextLevelRatio, nextLevelScore };
    }
    catch (e) {
        globalErrorLogger.info(`getPlayerLevel==:计算vip等级错误：${e.stack || e}`);
        return level;
    }
};
exports.getNexVipLevelNeedVipScore = getNexVipLevelNeedVipScore;
const receiveVipSystemCommission = async (player, lock, playCommission) => {
};
exports.receiveVipSystemCommission = receiveVipSystemCommission;
const getSystemVipRatio = (vipScore) => {
    let ratio = 0;
    try {
        if (CommonUtil.isNullOrUndefined(vipScore)) {
            return 0;
        }
        const configJson = JsonMgr.get('system/vipConfig').datas;
        const config = configJson.vipLevels;
        config.sort((v1, v2) => {
            return v2.levelScore - v1.levelScore;
        });
        for (let value of config) {
            if (vipScore >= value.levelScore) {
                ratio = value.ratio;
                break;
            }
        }
        return ratio;
    }
    catch (error) {
        globalErrorLogger.error('CommissionService.receivePlayCommission ==>', error);
        return ratio;
    }
};
exports.getSystemVipRatio = getSystemVipRatio;
async function initVipConfig() {
    var e_1, _a;
    console.warn("初始化vip等级、充值奖励、周奖励、月奖励配置信息");
    const list = await VipConfig_mysql_dao_1.default.findList({});
    if (list.length === 0) {
        const configJson = JsonMgr.get('system/vipConfig').datas;
        const cfgList = configJson.vipLevels;
        try {
            for (var cfgList_1 = __asyncValues(cfgList), cfgList_1_1; cfgList_1_1 = await cfgList_1.next(), !cfgList_1_1.done;) {
                const vipConfig = cfgList_1_1.value;
                await VipConfig_mysql_dao_1.default.insertOne(vipConfig);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (cfgList_1_1 && !cfgList_1_1.done && (_a = cfgList_1.return)) await _a.call(cfgList_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
}
exports.initVipConfig = initVipConfig;
async function checkVipLevelAndBouns(uid, level = 0, addRmb = 0) {
    const list = await VipConfig_mysql_dao_1.default.findList({});
    addRmb = addRmb / 100;
    let lastlevelScore = 0;
    const l = list.reduce((res, info) => {
        if (lastlevelScore === 0 && info.levelScore === 0) {
            return res;
        }
        res.push([lastlevelScore, info.levelScore]);
        lastlevelScore = info.levelScore;
        return res;
    }, []);
    const levelAfterPay = l.findIndex(info => addRmb >= info[0] && addRmb < info[1]);
    if (levelAfterPay > level) {
        const ll = list.slice(level + 1, levelAfterPay + 1);
        const playerVipBonusDetails = await VipBonusDetails_mysql_dao_1.default.findOne({ uid });
        let initDetails = {
            level: 0,
            bonus: 0,
            bonusForWeeks: 0,
            bonusForMonth: 0,
        };
        if (playerVipBonusDetails) {
            if (playerVipBonusDetails.whetherToReceiveLeverBonus === 0) {
                initDetails.bonus = playerVipBonusDetails.bonus;
            }
            let bonusForWeeksLastDateFlag = !!playerVipBonusDetails.bonusForWeeksLastDate;
            if (bonusForWeeksLastDateFlag) {
                const currentDate = moment().format("YYYY-MM-DD hh:mm:ss");
                const lastDate = moment(playerVipBonusDetails.bonusForWeeksLastDate).format("YYYY-MM-DD hh:mm:ss");
                const diffDays = moment(lastDate).diff(moment(currentDate), "d");
                if (diffDays > 7) {
                    initDetails.bonusForWeeks += playerVipBonusDetails.bonusForWeeks;
                }
            }
            else {
                initDetails.bonusForWeeks += playerVipBonusDetails.bonusForWeeks;
            }
            let bonusForMonthLastDateFlag = !!playerVipBonusDetails.bonusForMonthLastDate;
            if (bonusForMonthLastDateFlag) {
                const currentDate = moment().format("YYYY-MM-DD hh:mm:ss");
                const lastDate = moment(playerVipBonusDetails.bonusForMonthLastDate).format("YYYY-MM-DD hh:mm:ss");
                const diffDays = moment(lastDate).diff(moment(currentDate), "d");
                if (diffDays > 30) {
                    initDetails.bonusForMonth += playerVipBonusDetails.bonusForMonth;
                }
            }
            else {
                initDetails.bonusForMonth += playerVipBonusDetails.bonusForMonth;
            }
        }
        const info = ll.reduce((result, info) => {
            result.level = info.level;
            result.bonus += info.bonus;
            result.bonusForWeeks += info.bonusForWeeks;
            result.bonusForMonth += info.bonusForMonth;
            return result;
        }, initDetails);
        if (playerVipBonusDetails) {
            Object.assign(info, { whetherToReceiveLeverBonus: 0 });
            Object.assign(info, { bonusForWeeksLastDate: null });
            Object.assign(info, { bonusForMonthLastDate: null });
            await VipBonusDetails_mysql_dao_1.default.updateOne({ uid }, info);
        }
        else {
            Object.assign(info, { uid });
            await VipBonusDetails_mysql_dao_1.default.insertOne(info);
        }
        return levelAfterPay;
    }
    return level;
}
exports.checkVipLevelAndBouns = checkVipLevelAndBouns;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlwU3lzdGVtU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9hY3Rpdml0eS92aXBTeXN0ZW1TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7OztBQUNiLCtDQUF5QztBQUV6Qyx3REFBeUQ7QUFDekQsNkRBQThEO0FBRTlELG9GQUEyRTtBQUMzRSxnR0FBdUY7QUFDdkYsaUNBQWlDO0FBQ2pDLE1BQU0saUJBQWlCLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQW1DdkQsTUFBTSxjQUFjLEdBQUcsS0FBSyxFQUFFLFFBQWdCLEVBQUUsRUFBRTtJQUNyRCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDZCxJQUFJO1FBQ0EsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN6RCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNuQyxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxPQUFPLENBQUMsQ0FBQztTQUNaO1FBQ0QsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUN0QixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUNELElBQUksQ0FBQyxDQUFDLE1BQU0sWUFBWSxLQUFLLENBQUMsRUFBRTtZQUM1QixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7WUFDbkIsT0FBTyxF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