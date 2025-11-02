'use strict';
/**
 *  代理返佣的时候出现bug，停止了进行返佣，然后将需要返佣的数据存储
 */
import MongoManager = require('../../common/dao/mongoDB/lib/mongoManager');
import Utils = require('../../utils');
const HttpErrorLog = require('pinus-logger').getLogger('server_out', __filename);
const DayNotPlayerProfits = MongoManager.day_not_player_profits;
/**
 * 对产生返佣错误的BUG进行记录统计
 * @param uid
 * @param nickname
 * @param input
 * @param nid
 * @param gameOrder
 * @param gameType
 * @param gameName
 */

export const addNotPlayerProfitsRecord = async (uid, nickname, input, nid, gameOrder, gameType, gameName, numLevel, nextUid, superior, error) => {
    HttpErrorLog.info('addNotPlayerProfitsRecord', uid, nickname, input, nid, gameOrder, gameType, gameName, numLevel, nextUid, superior);
    try {
        const info = {
            id: Utils.id(),
            createTime: Date.now(), //创建时间
            uid: uid,  //玩家的uid
            nickname: nickname,  //玩家的昵称
            numLevel, //属于几级
            input: input, //返佣金额
            nid: nid,  //哪款游戏进行的返点
            nextUid,  //那个uid返利的
            superior,  //返给上级的是谁
            gameName, //游戏昵称
            gameOrder, //游戏的订单号
            gameType, //游戏类型
            error, //报错的原因
            status: 0,  //返利的状态
        }
        await DayNotPlayerProfits.create(info);
        return Promise.resolve();
    } catch (error) {
        HttpErrorLog.error("addNotPlayerProfitsRecord ==>:", error);
        return Promise.resolve(error);
    }
}
