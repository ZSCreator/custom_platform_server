// 邮件服务
import MailRecordMysqlDao from '../common/dao/mysql/MailRecord.mysql.dao';
import AnnouncementMysqlDao from '../common/dao/mysql/Announcement.mysql.dao';
import {MailRecord} from "../common/dao/mysql/entity/MailRecord.entity";
import { getLogger } from 'pinus-logger';
const Logger = getLogger('server_out', __filename);

/**
 * 生成邮件
 * @param:
 * opts:{img,name,reason,content,attachment}: 邮件信息
 * receiver: 接收者uid或数组
 */
export async function generatorMail(opts : any, uid: string  ) {
    try {
        opts.uid = uid;
        await MailRecordMysqlDao.insertOne(opts);
        return true;
    } catch (error) {
        Logger.error('MailService.generatorMail ==>', error);
        return Promise.reject(error);
    }
};

/**
 * 查询所有未删除邮件
 * @param:
 * opts 邮件信息
 * receiver: 接收者uid或数组
 */
export async function findAllMails (uid: string ) {
    try {
        const { list ,count }  =  await MailRecordMysqlDao.findListToLimitNoTime(uid);
        return { list ,count };
    } catch (error) {
        Logger.error('MailService.findMails==>', error);
        return { list : [] ,count : 0 };
    }
};


/**
 * 后台查询某一个玩家的所有邮件
 * @param:
 * opts 邮件信息
 * receiver: 接收者uid或数组
 */
export async function selectPlayerMails (uid: string , page : number) {
    try {
        const { list ,count } = await MailRecordMysqlDao.findListToLimit(uid,page,20 );
        return { list ,count };
    } catch (error) {
        Logger.error(`MailService.playerNotReadMails ==>`, error);
        return { list : [] ,count : 0 };
    }
};



/**
 * 查询所有未读的邮件
 * @param:
 * opts 邮件信息
 * receiver: 接收者uid或数组
 */
export async function playerNotReadMails (uid: string) {
    try {
        const count = await MailRecordMysqlDao.findListToLimitNoTimeForNoRead(uid );
        return count;
    } catch (error) {
        Logger.error(`MailService.playerNotReadMails ==>`, error);
        return { list : [] ,count : 0 };
    }
};

/**
 *  打开邮件
 * @param id
 */
export async function openMail(id:number): Promise<any> {
    try {
        const  mail : MailRecord = await MailRecordMysqlDao.findOne({id});
        if(mail){
            //打开了这个邮件过后需要更新已读字段
          await   MailRecordMysqlDao.updateOne({id},{isRead : true});
        }
        return mail;
    }catch (error) {
        Logger.error(`MailService.openMail ==>`, error);
        return false;
    }

};

/**
 * 删除邮件
 * @param id
 */

export const removeOneMail = async (id: number) => {
    try {
        // const mail = await MailRecordMysqlDao.findOne({id});
        // if(mail){
            //把删除字段更新 true
          await  MailRecordMysqlDao.delete({id});
        // }
        return true;
    } catch (error) {
        Logger.error(`MailService.updateOneMails ==>`, error);
        return false;
    }
};

/**
 * 删除所有已读邮件
 * @param id
 */

export const removeAllMail = async (uid) => {
    try {
        //把删除字段更新 true
        await MailRecordMysqlDao.updateOne({id : uid , isRead : true }, {isDelete : true});
        return true;
    } catch (error) {
        Logger.error(`MailService.updateOneMails ==>`, error);
        return false;
    }
};
/**
 * 查找公告
 * @param _id
 */

export const getAllSystemNotice = async () => {
    let errorMessage = 'MailService.findNotReadMails ==>';
    try {
        const { list ,count } = await AnnouncementMysqlDao.findListToLimit();
        return { list ,count };
    } catch (error) {
        Logger.error(errorMessage, error);
        return Promise.reject([]);
    }
};



