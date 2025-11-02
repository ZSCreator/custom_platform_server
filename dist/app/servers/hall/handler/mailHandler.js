'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailHandler = void 0;
const MailService = require("../../../services/MailService");
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const LanguageService = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
function default_1(app) {
    return new mailHandler(app);
}
exports.default = default_1;
class mailHandler {
    constructor(app) {
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
    async userMailBox({}, session) {
        let language = null;
        try {
            const uid = session.uid;
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_3) };
            }
            language = player.language;
            let result = await MailService.findAllMails(uid);
            let count = result.count;
            let list = result.list;
            return { code: 200, userMails: list, count };
        }
        catch (error) {
            this.logger.error(`hall.mailHandler.userMailBox,error:${error}`);
            return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_14) };
        }
    }
    ;
    async removeMail({ id }, session) {
        let language = null;
        try {
            const uid = session.uid;
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_3) };
            }
            language = player.language;
            await MailService.removeAllMail(uid);
            return { code: 200, msg: LanguageService.getlanguage(language, LanguageService.Net_Message.id_3) };
        }
        catch (error) {
            this.logger.error(`hall.mailHandler.userMailBox,error:${error}`);
            return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_104) };
        }
    }
    ;
    async removeOneMail({ id }, session) {
        let language = null;
        try {
            const uid = session.uid;
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_3) };
            }
            language = player.language;
            await MailService.removeOneMail(id);
            return { code: 200, msg: LanguageService.getlanguage(language, LanguageService.Net_Message.id_3) };
        }
        catch (error) {
            this.logger.error(`hall.mailHandler.userMailBox,error:${error}`);
            return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_104) };
        }
    }
    ;
    async openMail({ id }, session) {
        let language = null;
        try {
            const uid = session.uid;
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_3) };
            }
            language = player.language;
            if (!id) {
                return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_28) };
            }
            let mail = await MailService.openMail(id);
            return { code: 200, mail: mail };
        }
        catch (error) {
            this.logger.error(`玩家打开指定的邮件${id},error:${error}`);
            return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_28) };
        }
    }
    ;
    async getAllSystemNotice({}, session) {
        let language = null;
        try {
            const uid = session.uid;
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_3) };
            }
            let { list } = await MailService.getAllSystemNotice();
            let resultList = [];
            for (let m of list) {
                m.name = m.title;
                resultList.push(m);
            }
            return { code: 200, result: resultList };
        }
        catch (error) {
            this.logger.error(`发送所有公告内容,error:${error}`);
            return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_14) };
        }
    }
    ;
}
exports.mailHandler = mailHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9oYWxsL2hhbmRsZXIvbWFpbEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFHYiw2REFBOEQ7QUFDOUQsa0ZBQThFO0FBQzlFLG9FQUFxRTtBQUNyRSwrQ0FBeUM7QUFFekMsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxXQUFXO0lBRXBCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFNRCxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUcsRUFBRSxPQUF1QjtRQUMxQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSTtZQUNBLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDeEIsTUFBTyxNQUFNLEdBQUksTUFBTSx3QkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNoRSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNULE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxlQUFlLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUE7YUFDdkc7WUFDRCxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUMzQixJQUFJLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFFLENBQUM7WUFDbEQsSUFBSSxLQUFLLEdB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