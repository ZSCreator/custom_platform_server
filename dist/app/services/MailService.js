"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSystemNotice = exports.removeAllMail = exports.removeOneMail = exports.openMail = exports.playerNotReadMails = exports.selectPlayerMails = exports.findAllMails = exports.generatorMail = void 0;
const MailRecord_mysql_dao_1 = require("../common/dao/mysql/MailRecord.mysql.dao");
const Announcement_mysql_dao_1 = require("../common/dao/mysql/Announcement.mysql.dao");
const pinus_logger_1 = require("pinus-logger");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
async function generatorMail(opts, uid) {
    try {
        opts.uid = uid;
        await MailRecord_mysql_dao_1.default.insertOne(opts);
        return true;
    }
    catch (error) {
        Logger.error('MailService.generatorMail ==>', error);
        return Promise.reject(error);
    }
}
exports.generatorMail = generatorMail;
;
async function findAllMails(uid) {
    try {
        const { list, count } = await MailRecord_mysql_dao_1.default.findListToLimitNoTime(uid);
        return { list, count };
    }
    catch (error) {
        Logger.error('MailService.findMails==>', error);
        return { list: [], count: 0 };
    }
}
exports.findAllMails = findAllMails;
;
async function selectPlayerMails(uid, page) {
    try {
        const { list, count } = await MailRecord_mysql_dao_1.default.findListToLimit(uid, page, 20);
        return { list, count };
    }
    catch (error) {
        Logger.error(`MailService.playerNotReadMails ==>`, error);
        return { list: [], count: 0 };
    }
}
exports.selectPlayerMails = selectPlayerMails;
;
async function playerNotReadMails(uid) {
    try {
        const count = await MailRecord_mysql_dao_1.default.findListToLimitNoTimeForNoRead(uid);
        return count;
    }
    catch (error) {
        Logger.error(`MailService.playerNotReadMails ==>`, error);
        return { list: [], count: 0 };
    }
}
exports.playerNotReadMails = playerNotReadMails;
;
async function openMail(id) {
    try {
        const mail = await MailRecord_mysql_dao_1.default.findOne({ id });
        if (mail) {
            await MailRecord_mysql_dao_1.default.updateOne({ id }, { isRead: true });
        }
        return mail;
    }
    catch (error) {
        Logger.error(`MailService.openMail ==>`, error);
        return false;
    }
}
exports.openMail = openMail;
;
const removeOneMail = async (id) => {
    try {
        await MailRecord_mysql_dao_1.default.delete({ id });
        return true;
    }
    catch (error) {
        Logger.error(`MailService.updateOneMails ==>`, error);
        return false;
    }
};
exports.removeOneMail = removeOneMail;
const removeAllMail = async (uid) => {
    try {
        await MailRecord_mysql_dao_1.default.updateOne({ id: uid, isRead: true }, { isDelete: true });
        return true;
    }
    catch (error) {
        Logger.error(`MailService.updateOneMails ==>`, error);
        return false;
    }
};
exports.removeAllMail = removeAllMail;
const getAllSystemNotice = async () => {
    let errorMessage = 'MailService.findNotReadMails ==>';
    try {
        const { list, count } = await Announcement_mysql_dao_1.default.findListToLimit();
        return { list, count };
    }
    catch (error) {
        Logger.error(errorMessage, error);
        return Promise.reject([]);
    }
};
exports.getAllSystemNotice = getAllSystemNotice;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvc2VydmljZXMvTWFpbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsbUZBQTBFO0FBQzFFLHVGQUE4RTtBQUU5RSwrQ0FBeUM7QUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQVE1QyxLQUFLLFVBQVUsYUFBYSxDQUFDLElBQVUsRUFBRSxHQUFXO0lBQ3ZELElBQUk7UUFDQSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLE1BQU0sOEJBQWtCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE1BQU0sQ0FBQyxLQUFLLENBQUMsK0JBQStCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckQsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2hDO0FBQ0wsQ0FBQztBQVRELHNDQVNDO0FBQUEsQ0FBQztBQVFLLEtBQUssVUFBVSxZQUFZLENBQUUsR0FBVztJQUMzQyxJQUFJO1FBQ0EsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBSyxNQUFNLDhCQUFrQixDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlFLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7S0FDMUI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE1BQU0sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEQsT0FBTyxFQUFFLElBQUksRUFBRyxFQUFFLEVBQUUsS0FBSyxFQUFHLENBQUMsRUFBRSxDQUFDO0tBQ25DO0FBQ0wsQ0FBQztBQVJELG9DQVFDO0FBQUEsQ0FBQztBQVNLLEtBQUssVUFB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