'use strict';
import { Application, BackendSession, pinus, Logger } from 'pinus';
import Utils = require('../../../utils');
import RedisManager = require('../../../common/dao/redis/lib/redisManager');
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import langsrv = require('../../../services/common/langsrv');
import hallConst = require('../../../consts/hallConst');
import MailService = require('../../../services/MailService');
import { getLogger } from 'pinus-logger'
const log4js = require("log4js");
import { Player } from "../../../common/dao/mysql/entity/Player.entity";
import sessionService = require('../../../services/sessionService');
export default function (app: Application) {
    return new userHandler(app);
}

export class userHandler {
    logger: Logger;
    cashLogger: any;
    constructor(private app: Application) {
        this.logger = getLogger('server_out', __filename);
        this.cashLogger = log4js.getLogger('tixian_money_record');
    }





    /**
     * 用户更换头像
     * @route: hall.userHandler.changeHeadurl
     */
    changeHeadurl = async ({ headurl }, session: BackendSession) => {
        let lockRef = null;
        let language = null;
        try {
            const uid = session.uid;
            // @ts-ignore
            const player: Player = await PlayerManagerDao.findOne({ uid }, false);
            if (!player) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_3) }
            }
            language = player.language;
            if (Utils.isVoid(headurl)) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_20) }
            }
            await PlayerManagerDao.updateOne({ uid: player.uid }, { headurl });
            return { code: 200, msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_96) }
        } catch (error) {
            this.logger.error(`hall.userHandler.changeHeadurl==>${error}`);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_97) }
        } finally {
            !!lockRef && await RedisManager.unlock(lockRef);
        }

    };


    /**
     * 改变语言
     * hall.userHandler.changeLanguage
     */
    changeLanguage = async ({ language }, session: BackendSession) => {
        const uid = session.uid;
        let language1 = null;
        try {
            if (!Object.values(hallConst.LANGUAGE).includes(language)) {
                return { code: 500, error: langsrv.getlanguage(language1, langsrv.Net_Message.id_97) };
            }
            // @ts-ignore
            const player: Player = await PlayerManagerDao.findOne({ uid }, false);
            if (!player) {
                return { code: 500, error: langsrv.getlanguage(null, langsrv.Net_Message.id_3) };
            }
            // language =  player.language ;
            //保存玩家信息修改
            await PlayerManagerDao.updateOne({ uid: player.uid }, { language });
            await sessionService.sessionSet(session, { "language": language });
            return { code: 200, msg: langsrv.getlanguage(language, langsrv.Net_Message.id_96) }
        } catch (error) {
            this.logger.error(`hall.userHandler.changeLanguage==>${error}`);
            return { code: 200, msg: langsrv.getlanguage(language1, langsrv.Net_Message.id_96) };
        }

    };


    /**
     * 获取玩家的公告以及有几封未读
     * @param: {ip}，
     * @return:
     * @route: hall.userHandler.getSystemNoticAndMails
     * */
    async getSystemNoticAndMails({ }, session: BackendSession) {
        const { uid } = session;
        try {
            const count = await MailService.playerNotReadMails(uid);
            return { code: 200, systemNoticeList: [], emailCount: count };
        } catch (e) {
            this.logger.error(`${pinus.app.getServerId()} | 获取玩家的公告以及有几封未读 | 出错:${e.stack}`);
            return { code: 500, msg: e };
        }
    };




}

