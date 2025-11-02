'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebateHandler = void 0;
const pinus_1 = require("pinus");
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const langsrv = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
const PlayerRebate_mysql_dao_1 = require("../../../common/dao/mysql/PlayerRebate.mysql.dao");
const PlayerReceiveRebateRecord_mysql_dao_1 = require("../../../common/dao/mysql/PlayerReceiveRebateRecord.mysql.dao");
const DayPlayerRebateRecord_mysql_dao_1 = require("../../../common/dao/mysql/DayPlayerRebateRecord.mysql.dao");
const SystemConfig_manager_1 = require("../../../common/dao/daoManager/SystemConfig.manager");
const moment = require("moment");
function default_1(app) {
    return new rebateHandler(app);
}
exports.default = default_1;
;
class rebateHandler {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
    async getPlayerRebate({}, session) {
        let language = null;
        const { uid } = session;
        try {
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
            }
            player.language = language;
            const systemConfig = await SystemConfig_manager_1.default.findOne({});
            let iplProportion = systemConfig.iplRebate ? systemConfig.iplRebate : 0;
            let activity = await PlayerRebate_mysql_dao_1.default.findOne({ uid: player.uid });
            let sharePeople = activity ? activity.sharePeople : 0;
            let yesterdayRebate = activity ? activity.yesterdayRebate : 0;
            let todayRebate = activity ? activity.todayRebate : 0;
            let iplRebate = activity ? activity.iplRebate : 0;
            return { code: 200, sharePeople, yesterdayRebate, todayRebate, iplRebate, iplProportion };
        }
        catch (e) {
            this.logger.error(`${pinus_1.pinus.app.getServerId()} | 推广活动获取推广奖励 | 出错:${e.stack}`);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_14) };
        }
    }
    ;
    async signTodayRebate({}, session) {
        let language = null;
        const { uid } = session;
        try {
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
            }
            player.language = language;
            let activity = await PlayerRebate_mysql_dao_1.default.findOne({ uid: player.uid });
            if (!activity) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_14) };
            }
            let todayRebate = activity.todayRebate;
            await PlayerRebate_mysql_dao_1.default.updateDelRebate(player.uid, todayRebate);
            let gold = player.gold + todayRebate;
            await Player_manager_1.default.updateOne({ uid: player.uid }, { gold: gold });
            PlayerReceiveRebateRecord_mysql_dao_1.default.insertOne({ uid: player.uid, rebate: todayRebate });
            return { code: 200, playerGold: gold, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_99_1) };
        }
        catch (e) {
            this.logger.error(`${pinus_1.pinus.app.getServerId()} | 推广活动领取今日奖励 | 出错:${e.stack}`);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_14) };
        }
    }
    ;
    async signIPLRebate({}, session) {
        let language = null;
        const { uid } = session;
        try {
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
            }
            player.language = language;
            let activity = await PlayerRebate_mysql_dao_1.default.findOne({ uid: player.uid });
            if (!activity) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_14) };
            }
            let iplRebate = activity.iplRebate;
            await PlayerRebate_mysql_dao_1.default.updateDelIplRebate(player.uid, iplRebate);
            let gold = player.gold + iplRebate;
            await Player_manager_1.default.updateOne({ uid: player.uid }, { gold: gold });
            PlayerReceiveRebateRecord_mysql_dao_1.default.insertOne({ uid: player.uid, rebate: iplRebate });
            return { code: 200, playerGold: gold, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_99_1) };
        }
        catch (e) {
            this.logger.error(`${pinus_1.pinus.app.getServerId()} | 推广活动领取IPL奖励 | 出错:${e.stack}`);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_14) };
        }
    }
    ;
    async getPlayerWeekDayRebateRecord({ page, limit }, session) {
        let language = null;
        const { uid } = session;
        try {
            page = page ? page : 1;
            limit = limit ? limit : 10;
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
            }
            player.language = language;
            const dayStartTime = moment().subtract(1, 'days').format("YYYY-MM-DD 00:00:00");
            const dayEndTime = moment().format("YYYY-MM-DD");
            const weekStartTime = moment().subtract(7, 'days').format("YYYY-MM-DD");
            console.warn(`uid:${uid},dayStartTime:${dayStartTime},dayEndTime:${dayEndTime},page:${page},limit:${limit},weekStartTime:${weekStartTime}`);
            const result = await DayPlayerRebateRecord_mysql_dao_1.default.getFinallyTodayRecord(uid, dayStartTime, dayEndTime, page, limit, weekStartTime, dayEndTime);
            return { code: 200, result, weekStartTime, weekEndTime: dayEndTime };
        }
        catch (e) {
            this.logger.error(`${pinus_1.pinus.app.getServerId()} | 推广活动转介绍界面 | 出错:${e.stack}`);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_14) };
        }
    }
    ;
    async getPlayerReceiveRebateRecord({ page, limit }, session) {
        let language = null;
        const { uid } = session;
        try {
            page = page ? page : 1;
            limit = limit ? limit : 10;
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
            }
            player.language = language;
            console.warn(`uid:${uid},page:${page},limit:${limit}`);
            const result = await PlayerReceiveRebateRecord_mysql_dao_1.default.getPlayerReceiveRebateRecord(uid, page, limit);
            return { code: 200, result };
        }
        catch (e) {
            this.logger.error(`${pinus_1.pinus.app.getServerId()} | 推广活动玩家领取记录 | 出错:${e.stack}`);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_14) };
        }
    }
    ;
    async shareDown({}, session) {
        let language = null;
        const { uid } = session;
        try {
            const systemConfig = await SystemConfig_manager_1.default.findOne({});
            const url = systemConfig.gameResultUrl ? systemConfig.gameResultUrl : null;
            const player = await Player_manager_1.default.findOne({ uid: uid });
            if (url && player) {
                let downUrl = url ? `${url}?PlatformCode=${player.groupRemark}&ShareUid=${uid}` : null;
                return { code: 200, downUrl };
            }
            else {
                return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_14) };
            }
        }
        catch (e) {
            this.logger.error(`${pinus_1.pinus.app.getServerId()} | 推广活动玩家领取记录 | 出错:${e.stack}`);
            return { code: 500, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_14) };
        }
    }
    ;
}
exports.rebateHandler = rebateHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmViYXRlSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2FjdGl2aXR5L2hhbmRsZXIvcmViYXRlSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUdiLGlDQUFtRTtBQUNuRSxrRkFBNkU7QUFDN0UsNERBQTZEO0FBQzdELCtDQUF5QztBQUV6Qyw2RkFBb0Y7QUFDcEYsdUhBQThHO0FBQzlHLCtHQUFzRztBQUN0Ryw4RkFBc0Y7QUFDdEYsaUNBQWlDO0FBRWpDLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFGRCw0QkFFQztBQUFBLENBQUM7QUFFRixNQUFhLGFBQWE7SUFFdEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUNoQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQVNELEtBQUssQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLE9BQXVCO1FBQzdDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztRQUNwQixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUk7WUFFQSxNQUFNLE1BQU0sR0FBVyxNQUFNLHdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1QsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzthQUN0RjtZQUNELE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxD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