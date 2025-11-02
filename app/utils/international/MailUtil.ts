'use strict';
/**
 * 皇家国际自动领取邮件金币
 */
// import * as MongoManager from '../../common/dao/mongoDB/lib/mongoManager';
// import MailHander from '../../servers/hall/handler/mailHandler';
// import EnvUtil from '../EnvUtil'
// import { getLogger } from 'pinus-logger';
// import { BackendSession } from 'pinus';
// const log = getLogger('server_out', __filename);
// const mailHandler = MailHander(null);

// export default class MailUtil {
//     constructor() {
//     }

    /**
     * 自动领取
     * @param uid 用户ID
     */
    // public static autoReceive(uid: string, isRobot: number = 0) {
    //     if (!uid) {
    //         log.error('邮件自动领取 uid=${uid}')
    //         return
    //     }
    //     // 只有皇家国际有这个要求
    //     if (EnvUtil.isRoyalInt() && isRobot !== 2) {
    //         log.info(`皇家国际自动领取用户奖励 => ${uid}`)
    //         let session = new BackendSession({
    //             uid: uid
    //         }, null);

    //         const mailDao = MongoManager.mails;
    //         setTimeout(async () => {
    //             // 查找未读未领取邮件
    //             const mailList = await mailDao.find({ receiverId: uid, isRead: false, isdelete: false, "attachment.gold": { $gt: 0 } }).sort({ time: -1 }).limit(5);
    //             for (let m in mailList) {
    //                 log.info(`拆开邮件 ${uid} ${mailList[m]._id}`);
    //                 // 领取标注未读
    //                 await mailHandler.removeMail({ _id: mailList[m]._id }, session);
    //                 await mailDao.findByIdAndUpdate({ _id: mailList[m]._id }, { isRead: false, isdelete: true }, { new: true });
    //             }
    //         }, 5000);
    //     }
    // }
// }