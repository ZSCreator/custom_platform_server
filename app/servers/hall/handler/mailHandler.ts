'use strict';
import { Application, BackendSession, Logger } from 'pinus';

import MailService = require('../../../services/MailService');
import PlayerManagerDao  from '../../../common/dao/daoManager/Player.manager';
import LanguageService = require('../../../services/common/langsrv');
import { getLogger } from 'pinus-logger';

export default function (app: Application) {
    return new mailHandler(app);
}

export class mailHandler {
    logger: Logger;
    constructor(private app: Application) {
        this.logger = getLogger('server_out', __filename);
    }

    /**
     * 玩家请求所有邮件
     * @route hall.mailHandler.userMailBox { page }
     */
    async userMailBox({ }, session: BackendSession) {
        let language = null;
        try {
            const uid = session.uid;
            const  player  = await PlayerManagerDao.findOne({ uid }, false);
            if (!player) {
                return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_3) }
            }
            language = player.language;
            let result = await MailService.findAllMails(uid );
            let count  = result.count;
            let list  = result.list;
            return { code: 200, userMails: list , count };
        } catch (error) {
            this.logger.error(`hall.mailHandler.userMailBox,error:${error}`);
            return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_14) };
        }

    };

    /**
     * 玩家删除邮件
     * @route hall.mailHandler.removeMail
     */
    async removeMail({ id }, session: BackendSession) {
        let language = null;
        try {
            const uid = session.uid;
            const  player  = await PlayerManagerDao.findOne({ uid }, false);
            if (!player) {
                return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_3) }
            }
            language = player.language;
            await MailService.removeAllMail(uid);
            return { code: 200, msg: LanguageService.getlanguage(language, LanguageService.Net_Message.id_3) }
        } catch (error) {
            this.logger.error(`hall.mailHandler.userMailBox,error:${error}`);
            return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_104) };
        }

    };


    /**
     * 玩家删除单个邮件
     * @route hall.mailHandler.removeOneMail {id}
     */
    async removeOneMail({id}, session: BackendSession) {
        let language = null;
        try {
            const uid = session.uid;
            const  player  = await PlayerManagerDao.findOne({ uid }, false);
            if (!player) {
                return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_3) }
            }
            language = player.language;
            await MailService.removeOneMail(id);
            return { code: 200, msg: LanguageService.getlanguage(language, LanguageService.Net_Message.id_3) }
        } catch (error) {
            this.logger.error(`hall.mailHandler.userMailBox,error:${error}`);
            return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_104) };
        }

    };


    /**
     * 玩家打开指定的邮件
     * @route hall.mailHandler.openMail
     */
    async openMail({ id }, session: BackendSession) {
        let language = null;
        try {
            const uid = session.uid;
            const  player  = await PlayerManagerDao.findOne({ uid }, false);
            if (!player) {
                return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_3) }
            }
            language = player.language;
            if (!id) {
                return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_28) }
            }
            let mail = await MailService.openMail(id);
            return { code: 200, mail: mail }
        } catch (error) {
            this.logger.error(`玩家打开指定的邮件${id},error:${error}`);
            return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_28) }
        }

    };

    /**
     * 发送所有公告内容
     * @route hall.mailHandler.getAllSystemNotice
     */
    async getAllSystemNotice({}, session: BackendSession) {
        let language = null;
        try {
            const uid = session.uid;
            const  player  = await PlayerManagerDao.findOne({ uid }, false);
            if (!player) {
                return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_3) };
            }
            let { list } = await MailService.getAllSystemNotice();
            let resultList = [];
            for(let m of list){
                m.name = m.title;
                resultList.push(m);
            }
            return { code: 200, result: resultList }
        } catch (error) {
            this.logger.error(`发送所有公告内容,error:${error}`);
            return { code: 500, error: LanguageService.getlanguage(language, LanguageService.Net_Message.id_14) };
        }

    };

}