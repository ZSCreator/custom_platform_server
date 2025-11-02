'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.userHandler = void 0;
const pinus_1 = require("pinus");
const Utils = require("../../../utils");
const RedisManager = require("../../../common/dao/redis/lib/redisManager");
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const langsrv = require("../../../services/common/langsrv");
const hallConst = require("../../../consts/hallConst");
const MailService = require("../../../services/MailService");
const pinus_logger_1 = require("pinus-logger");
const log4js = require("log4js");
const sessionService = require("../../../services/sessionService");
function default_1(app) {
    return new userHandler(app);
}
exports.default = default_1;
class userHandler {
    constructor(app) {
        this.app = app;
        this.changeHeadurl = async ({ headurl }, session) => {
            let lockRef = null;
            let language = null;
            try {
                const uid = session.uid;
                const player = await Player_manager_1.default.findOne({ uid }, false);
                if (!player) {
                    return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_3) };
                }
                language = player.language;
                if (Utils.isVoid(headurl)) {
                    return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_20) };
                }
                await Player_manager_1.default.updateOne({ uid: player.uid }, { headurl });
                return { code: 200, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_96) };
            }
            catch (error) {
                this.logger.error(`hall.userHandler.changeHeadurl==>${error}`);
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_97) };
            }
            finally {
                !!lockRef && await RedisManager.unlock(lockRef);
            }
        };
        this.changeLanguage = async ({ language }, session) => {
            const uid = session.uid;
            let language1 = null;
            try {
                if (!Object.values(hallConst.LANGUAGE).includes(language)) {
                    return { code: 500, error: langsrv.getlanguage(language1, langsrv.Net_Message.id_97) };
                }
                const player = await Player_manager_1.default.findOne({ uid }, false);
                if (!player) {
                    return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_3) };
                }
                await Player_manager_1.default.updateOne({ uid: player.uid }, { language });
                await sessionService.sessionSet(session, { "language": language });
                return { code: 200, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_96) };
            }
            catch (error) {
                this.logger.error(`hall.userHandler.changeLanguage==>${error}`);
                return { code: 200, msg: langsrv.getlanguage(language1, langsrv.Net_Message.id_96) };
            }
        };
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
        this.cashLogger = log4js.getLogger('tixian_money_record');
    }
    async getSystemNoticAndMails({}, session) {
        const { uid } = session;
        try {
            const count = await MailService.playerNotReadMails(uid);
            return { code: 200, systemNoticeList: [], emailCount: count };
        }
        catch (e) {
            this.logger.error(`${pinus_1.pinus.app.getServerId()} | 获取玩家的公告以及有几封未读 | 出错:${e.stack}`);
            return { code: 500, msg: e };
        }
    }
    ;
}
exports.userHandler = userHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9oYWxsL2hhbmRsZXIvdXNlckhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFDYixpQ0FBbUU7QUFDbkUsd0NBQXlDO0FBQ3pDLDJFQUE0RTtBQUM1RSxrRkFBNkU7QUFDN0UsNERBQTZEO0FBQzdELHVEQUF3RDtBQUN4RCw2REFBOEQ7QUFDOUQsK0NBQXdDO0FBQ3hDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVqQyxtRUFBb0U7QUFDcEUsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxXQUFXO0lBR3BCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFhcEMsa0JBQWEsR0FBRyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxPQUF1QixFQUFFLEVBQUU7WUFDM0QsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ25CLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztZQUNwQixJQUFJO2dCQUNBLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBRXhCLE1BQU0sTUFBTSxHQUFXLE1BQU0sd0JBQWdCLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3RFLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ1QsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQTtpQkFDdkY7Z0JBQ0QsUUFBUSxHQUFHLE1BQU0sQ0FB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