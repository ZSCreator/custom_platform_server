'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSchedule = void 0;
const Schedule = require("node-schedule");
const Utils = require("../../utils");
const pinus_logger_1 = require("pinus-logger");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const ScheduleServer = module.exports;
const startSchedule = async (app) => {
    console.log('开始执行==>startSchedule');
};
exports.startSchedule = startSchedule;
function addAgentBackDayRecord() {
    Schedule.scheduleJob('*/10 * * * *', async function () {
        try {
            console.log('开始出发定时器=====>addAgentBackDayRecord');
            const istrue = Utils.isNeedTimerToYesterDay(10);
            const oneDay = 24 * 60 * 60 * 1000;
            let startTime = Utils.zerotime();
            let endTime = Utils.zerotime() + oneDay;
            if (istrue) {
                startTime -= oneDay;
                endTime -= oneDay;
            }
            return true;
        }
        catch (error) {
            console.log('addAgentBackDayRecord ==> 每隔十分钟:', error);
            Logger.error("addAgentBackDayRecord ==> 每隔十分钟:", error);
        }
    });
}
function changeAgentBackRecord() {
    Schedule.scheduleJob('10 01 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() - 1 * oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay;
            return true;
        }
        catch (error) {
            console.log('changeAgentBackRecord ==> 每日00点01:', error);
            Logger.error("changeAgentBackRecord ==> 每日00点01:", error);
        }
    });
}
function dayProfitsRecord() {
    Schedule.scheduleJob('01 01 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() - 1 * oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay;
            return true;
        }
        catch (error) {
            Logger.error("HallController.dayProfitsRecord ==> 每日23点55统计当天的利润:", error);
        }
    });
}
function addQudaoProfits() {
    Schedule.scheduleJob('01 02 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() - 1 * oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay;
            return Promise.resolve();
        }
        catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error);
        }
    });
}
function addAgentProfits() {
    Schedule.scheduleJob('05 01 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() - oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay;
            return Promise.resolve();
        }
        catch (error) {
            Logger.error("royal_scheduleJob.addTodayPlatformAgentData", error);
        }
    });
}
function addGameRecordGameTypeDay() {
    Schedule.scheduleJob('03 03 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() - oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay;
            return Promise.resolve();
        }
        catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error);
        }
    });
}
function changeDaquProfitsToYingShou() {
    Schedule.scheduleJob('31 02 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() - 1 * oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay;
            return Promise.resolve();
        }
        catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error);
        }
    });
}
function calculatePromotionForLTV() {
    Schedule.scheduleJob('32 03 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() - 1 * oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay;
            return Promise.resolve();
        }
        catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error);
        }
    });
}
function calculatePromotionLTVForAgentLook() {
    Schedule.scheduleJob('41 03 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() - 1 * oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay;
            return Promise.resolve();
        }
        catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error);
        }
    });
}
function addDayPlayerProfitsPayRecord_wuxian_jicha() {
    Schedule.scheduleJob('*/10 * * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            let startTime = Utils.zerotime();
            let endTime = Utils.zerotime() + oneDay;
            return Promise.resolve();
        }
        catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error);
        }
    });
}
function addDayPeopleAndActive() {
    Schedule.scheduleJob('*/50 * * * *', async function () {
        try {
            const istrue = Utils.isNeedTimerToYesterDay(50);
            const oneDay = 24 * 60 * 60 * 1000;
            let startTime = Utils.zerotime();
            let endTime = Utils.zerotime() + oneDay;
            if (istrue) {
                startTime -= oneDay;
                endTime -= oneDay;
            }
            return Promise.resolve();
        }
        catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error);
        }
    });
}
function addAgentKaoheProfitsRecord() {
    Schedule.scheduleJob('59 23 * * 7', async function () {
        try {
            return Promise.resolve();
        }
        catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error);
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NoZWR1bGVTZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvc2NoZWR1bGUvU2NoZWR1bGVTZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYiwwQ0FBMkM7QUFDM0MscUNBQXNDO0FBQ3RDLCtDQUFrRDtBQUNsRCxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ25ELE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFNL0IsTUFBTSxhQUFhLEdBQUcsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQStFeEMsQ0FBQyxDQUFDO0FBaEZXLFFBQUEsYUFBYSxpQkFnRnhCO0FBUUYsU0FBVSxxQkFBcUI7SUFDM0IsUUFBUSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsS0FBSztRQUN0QyxJQUFJO1lBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoRCxNQUFNLE1BQU0sR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDbkMsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pDLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxNQUFNLENBQUU7WUFDekMsSUFBRyxNQUFNLEVBQUM7Z0JBQ04sU0FBUyxJQUFJLE1BQU0sQ0FBQztnQkFDcEIsT0FBTyxJQUFJLE1BQU0sQ0FBQzthQUNyQjtZQUVELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLE9BQU8s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