'use strict';

import utils = require('../../utils');
import msgService = require('../../services/MessageService');
import PayInfoMysqlDao from '../../common/dao/mysql/PayInfo.mysql.dao';
import PayOrderMysqlDao from '../../common/dao/mysql/PayOrder.mysql.dao';
import PlayerManagerDao from '../../common/dao/daoManager/Player.manager';
import { Player } from '../../common/dao/mysql/entity/Player.entity';
//日志文件
import { getLogger } from 'pinus-logger';
import { getConnection, getRepository, QueryRunner } from 'typeorm';
import PlayerRedisDao from '../../common/dao/redis/Player.redis.dao';
import ConnectionManager from "../../common/dao/mysql/lib/connectionManager";
import { sendRedisGoldMessage } from '../../common/event/redisGoldEvent';
import { checkVipLevelAndBouns } from '../activity/vipSystemService';
import { LANGUAGE } from '../../consts/hallConst';
const globalErrorLogger = getLogger('global_error_log', __filename);

let orderNumber = [];
let payOrder: any = {
    timer: null,
    payPlayers: []
};


//数据库模型



//记录充值订单
export const intoOrderNumber = async function (orderNum_) {
    const currOrder = orderNumber.find(m => m.orderId === orderNum_);
    const currTime = Date.now();
    //删除订单缓存（订单超过30秒的）
    orderNumber = orderNumber.filter(m => m && ((Date.now() - m.time) <= 30 * 1000));
    //如果没有订单
    if (!currOrder) {
        orderNumber.push({
            orderId: orderNum_,
            time: Date.now()
        });
        return true
    }
    //如果同一订单请求时间间隔小于5秒
    if ((currTime - currOrder.time) <= 8 * 1000) {
        return false
    }
    return true
}

//更新需要通知的玩家
export const updateNeedPayPlayer = async function (uid: string) {
    utils.remove(payOrder.payPlayers, 'uid', uid);

    // payOrder.payPlayers.remove('uid', uid);
    return null;
}


/**
 * 
 * @param {string} field1       原组合参
 * @param {string} orderNumber  订单编号
 * @param {number} orderPrice   金额
 * @param {string} platform     支付方式名称
 * @param {number} orderTime    订单时间
 * @param {string} customerName 客服名称
 * @param {string} customerId   客服编号
 * @param {string} customerIp   客服IP
 * @param {string} remark       支付备注
 */
export async function mallCallback({ field1, orderNumber, orderPrice, platform = null, orderTime, customerName = '', customerId, customerIp, remark = '' }) {
    let _lock = null;
    const [attach, uid] = field1.split('-');
    try {
        /** Step 1: 确认"充值记录表"是否重复 -  表: pay_info */
        const payInfoList = await PayInfoMysqlDao.findOne({ id: orderNumber });
        if (payInfoList) {
            globalErrorLogger.info(`支付回传 | pay_info 订单号: ${orderNumber} 重复 `);
            return { code: 500, error: '订单号重复' };
        }
        //
        /** Step 2: 判断预充值记录表是否含有记录 */
        const order = await PayOrderMysqlDao.findOne({ orderNumber });
        // 含有记录 & 锁
        if (order && order.isLock) {
            globalErrorLogger.info(`支付回传 | pay_order 订单号: ${orderNumber} 订单已经锁定 `);
            return { code: 500, error: '订单已经锁定' };
        }
        //
        // /**
        //  * Step 3: 更新记录
        //  * @description 1 redis      player   :  addRmb & addDayRmb 玩家信息
        //  * @description 2 mongoDB - pay_info  :  插入新记录
        //  * @description 3 mongoDB - pay_order :  更新状态
        //  */
        // const { player, lock } = await PlayerManager.getPlayer({ uid }, true);
        // _lock = lock;
        //
        // if (!player) {
        //     globalErrorLogger.info(`支付回传 | 更新记录 订单号: ${orderNumber} |玩家 ${uid} 不存在 `);
        //     return { code: 500, error: '玩家不存在' }
        // }
        // const { nickname, gold: playerGold, sid } = player;
        // // 3.1
        // const playerUpdateAttrs = ['addRmb', 'addDayRmb'];
        // orderPrice = Number(orderPrice) * 100;
        // player.addRmb += orderPrice;
        // player.addDayRmb = player.addDayRmb ? player.addDayRmb + orderPrice : orderPrice;
        //
        // await PlayerManager.updateOnePlayer(player, playerUpdateAttrs, lock);
        //
        // // 3.2
        // // const systemConfig = await GetDataService.getSystemConfig();
        // // const { goldToMoney } = systemConfig;
        // const payInfoParameter = {
        //     id: orderNumber,
        //     time: Date.now(),
        //     time_end: orderTime,
        //     attach,
        //     bank_type: '',
        //     fee_type: '',
        //     customerName,
        //     customerId,
        //     customerIp,
        //     total_fee: orderPrice,
        //     openid: '',
        //     remark: order ? order.platform : remark,
        //     uid,
        //     nickname,
        //     addgold: Math.ceil(orderPrice),// 获得金豆uid
        //     isUpdateGold: false,                // 前端收到通知是否更新
        //     gold: utils.sum(playerGold, true),
        //     lastGold: 0,                        //最后玩家身上的金币
        //     agencylink: '',                     // 代理地址
        //     aisleId: order ? order.aisleId : -1 //支付通道id
        // };
        // await payInfoDao.create(payInfoParameter);
        //
        // // 3.3
        // await payOrderDao.updateOne({ orderNumber }, { $set: { status: 1 } })

        /**
         * Step 4: 首充赠礼
         */
        // const { isOpenPayGivingGold } = systemConfig;
        // if (isOpenPayGivingGold) {
        //     const dayPay = await payInfoDao.find({ uid, time: { '$gt': utils.zerotime() } });
        //     // 当前用户今天充值过就不发送邮件
        //     if (dayPay.length === 1) {
        //         const givingGold = JsonMgr.get('pay_giving_gold').datas.find(({ minPay, maxPay }) => minPay <= orderPrice / 100 && orderPrice / 100 < maxPay);
        //         if (givingGold) {
        //             const { givingGold: sendGold } = givingGold;
        //             const opts = {
        //                 name: '首充彩金',
        //                 content: '恭喜您首次充值金额达标，在此赠送您' + utils.changeMoneyToGold(givingGold.givingGold) + ' 金币，祝您游戏愉快。',
        //                 attachment: { gold: sendGold }
        //             }
        //             await MailService.generatorMail(opts, uid);
        //         }
        //     }
        // }

        /**
         * Step 5: 通知游戏前端
         * @description 原调用逻辑暂不重构,只重构逻辑顺序
         * @date 2019年11月27日
         * @author Andy
         */
        // const msgUserIds = { uid, sid, orderId: orderNumber };
        // // 标记 含有充值记录的玩家
        // if (!payOrder.payPlayers.find(m => m && m.orderId === orderNumber)) {
        //     payOrder.payPlayers.push(msgUserIds);
        // }
        // // 轮询通知游戏前端
        // if (!payOrder.timer) {
        //     //每5秒通知前端充值到账
        //     payOrder.timer = setInterval(() => {
        //         payOrder.payPlayers.map(async ({ uid, orderId, sid }) => {
        //
        //             const payInfoList = await payInfoDao.find({ id: orderId });
        //
        //             if (payInfoList[0].isUpdateGold) {
        //                 utils.remove(payOrder.payPlayers, 'uid', uid);
        //                 return;
        //             }
        //
        //             if (payOrder.payPlayers.length === 0) {
        //                 clearInterval(payOrder.timer);
        //                 payOrder.timer = null;
        //                 return;
        //             }
        //
        //             //如果没有sid不是在线玩家
        //             // const currSid = await GetDataService.getSid(uid);
        //             // if (!currSid) {
        //             //     // payOrder.payPlayers.remove('uid', m.uid);
        //             //     utils.remove(payOrder.payPlayers, 'uid', uid);
        //             //     return;
        //             // }
        //             console.warn(`通知金币更新 | 订单号 :${orderId}`)
        //             // sid = currSid;
        //             // console.warn(`通知前端更新金币|订单号:${orderNum}`);
        //             msgService.pushMessageByUids('requestOrder', { orderId }, { uid, sid });
        //
        //         });
        //     }, 5000);
        // }
        return { code: 200 };
    } catch (e) {
        globalErrorLogger.error(`支付回传 | 玩家 : ${uid} 订单:${orderNumber} 出错 :${e.stack ? e.stack : e}`);
        return { code: 500, error: e };
    } finally {
    }
}

/**
 * 
 * @param param0 
 * @description 针对客服充值调用
 */
export async function mallCallbackFromHttp({ field1, orderNumber, orderPrice, orderTime, remark = '' }, bonus: number = 0) {
    const [attach, uid] = field1.split('-');
    try {
        /** Step 1: 确认"充值记录表"是否重复 -  表: pay_info */
        const payInfoList = await PayInfoMysqlDao.findOne({ orderNumber: orderNumber });
        if (payInfoList) {
            globalErrorLogger.info(`支付回传 | pay_info 订单号: ${orderNumber} 重复 `);
            return { code: 500, error: '订单号重复' };
        }

        /** Step 2: 判断预充值记录表是否含有记录 */
        const order = await PayOrderMysqlDao.findOne({ orderNumber });
        // // 含有记录 & 锁
        if (order && order.isLock) {
            globalErrorLogger.info(`支付回传 | pay_order 订单号: ${orderNumber} 订单已经锁定 `);
            return { code: 500, error: '订单已经锁定' };
        }


        /**
         * Step 3: 更新记录
         * @description 1 redis      player   :  addRmb & addDayRmb 玩家信息
         * @description 2 mongoDB - pay_info  :  插入新记录
         * @description 3 mongoDB - pay_order :  更新状态
         */
        // @ts-ignore
        const player: Player = await PlayerManagerDao.findOne({ uid }, true);

        if (!player) {
            globalErrorLogger.info(`支付回传 | 更新记录 订单号: ${orderNumber} |玩家 ${uid} 不存在 `);
            return { code: 500, error: '玩家不存在' }
        }
        const { gold: playerGold, sid } = player;
        // 3.1
        player.addRmb += orderPrice;
        player.addDayRmb = player.addDayRmb ? player.addDayRmb + orderPrice : orderPrice;
        orderPrice = Number(orderPrice) / 100;
        // 检测vip等级和奖励
        const level = await checkVipLevelAndBouns(uid, player.level, player.addDayRmb);

        let withdrawalChips = 0;
        if (player.language === LANGUAGE.Portugal) {
            if (player.withdrawalChips > 0) {
                withdrawalChips = player.withdrawalChips + (orderPrice * 100);
            } else {
                // 小于或等于0，提现变不可提；首充，结果一致；
                withdrawalChips = orderPrice * 100;
            }
        }

        await PlayerManagerDao.updateOne({ uid }, { addRmb: player.addRmb, addDayRmb: player.addDayRmb, level, withdrawalChips });
        // 3.2
        const payInfoParameter = {
            orderNumber: orderNumber,
            attach,
            total_fee: orderPrice,
            remark: remark,
            uid,
            addgold: Math.ceil(orderPrice) + (bonus ? bonus * 100 : 0),         // 获得金豆uid
            isUpdateGold: false,                    // 前端收到通知是否更新
            gold: playerGold,
            lastGold: 0,                            // 最后玩家身上的金币
            bonus: bonus * 100
        };
        await PayInfoMysqlDao.insertOne(payInfoParameter);
        // 3.3
        if (order) {
            await PayOrderMysqlDao.updateOne({ orderNumber }, { status: 1 });
        }
        // 通知前端
        await sendRedisGoldMessage({ uid });
        /**
         * Step 4: 首充赠礼
         */
        // const { isOpenPayGivingGold } = systemConfig;
        // if (isOpenPayGivingGold) {
        //     const dayPay = await payInfoDao.find({ uid, time: { '$gt': utils.zerotime() } });
        //     // 当前用户今天充值过就不发送邮件
        //     if (dayPay.length === 1) {
        //         const givingGold = JsonMgr.get('pay_giving_gold').datas.find(({ minPay, maxPay }) => minPay <= orderPrice / 100 && orderPrice / 100 < maxPay);
        //         if (givingGold) {
        //             const { givingGold: sendGold } = givingGold;
        //             const opts = {
        //                 name: '首充彩金',
        //                 content: '恭喜您首次充值金额达标，在此赠送您' + utils.changeMoneyToGold(givingGold.givingGold) + ' 金币，祝您游戏愉快。',
        //                 attachment: { gold: sendGold }
        //             }
        //             await MailService.generatorMail(opts, uid);
        //         }
        //     }
        // }

        /**
         * Step 5: 通知游戏前端
         * @description 原调用逻辑暂不重构,只重构逻辑顺序
         * @date 2019年11月27日
         * @author Andy
         */
        // const msgUserIds = { uid, sid, orderId: orderNumber };
        // 标记 含有充值记录的玩家
        // if (!payOrder.payPlayers.find(m => m && m.orderId === orderNumber)) {
        // payOrder.payPlayers.push(msgUserIds);
        // }
        // 轮询通知游戏前端
        // if (!payOrder.timer) {
        //每5秒通知前端充值到账
        // payOrder.timer = setInterval(() => {
        // payOrder.payPlayers.map(async ({ uid, orderId, sid }) => {
        // const payInfoList = await PayInfoMysqlDao.findOne({ orderNumber: orderId });

        // if (payInfoList && payInfoList.isUpdateGold) {
        // utils.remove(payOrder.payPlayers, 'uid', uid);
        // return;
        // }

        // if (payOrder.payPlayers.length === 0) {
        // clearInterval(payOrder.timer);
        // payOrder.timer = null;
        // return;
        // }

        //如果没有sid不是在线玩家
        // const currSid = await GetDataService.getSid(uid);
        // if (!currSid) {
        //     // payOrder.payPlayers.remove('uid', m.uid);
        //     utils.remove(payOrder.payPlayers, 'uid', uid);
        //     return;
        // }
        // console.warn(`通知金币更新 | 订单号 :${orderId}`)
        // sid = currSid;
        // console.warn(`通知前端更新金币|订单号:${orderNum}`);
        // msgService.pushMessageByUids('requestOrder', { orderId }, { uid, sid });

        // });
        // }, 5000);
        // }
        return { code: 200 };
    } catch (e) {
        globalErrorLogger.error(`支付回传 | 玩家 : ${uid} 订单:${orderNumber} 出错 :${e.stack ? e.stack : e}`);
        return { code: 500, error: e };
    }
}

export async function mallCallbackFromHttpForTran({ field1, orderNumber, orderPrice, orderTime, customerName = '', customerId, customerIp, remark = '' }, bonus: number = 0) {
    const [attach, uid] = field1.split('-');

    let queryRunner: null | QueryRunner;

    try {
        /** Step 1: 确认"充值记录表"是否重复 -  表: pay_info */
        const payInfoList = await PayInfoMysqlDao.findOne({ orderNumber: orderNumber });
        if (payInfoList) {
            globalErrorLogger.info(`支付回传 | pay_info 订单号: ${orderNumber} 重复 `);
            return { code: 500, error: '订单号重复' };
        }

        /**
         * Step 2: 更新记录
         * @description 1.redis Player:addRomb & addDayRmb 玩家信息
         * @description 2.Mysql - PayInfo    : 插入新记录
         * @description 3.mongodb - PayOrder : 状态
         */
        queryRunner = ConnectionManager.getConnection().createQueryRunner();

        await queryRunner.startTransaction("SERIALIZABLE");

        const playerList = await queryRunner.query(`
            SELECT
                gold,
                sid,
                addRmb,
                addDayRmb
            FROM Sp_Player
            WHERE pk_uid = ${this.uid} FOR UPDATE
            `);

        if (playerList.length === 0) {
            globalErrorLogger.info(`支付回传 | 更新记录 订单号: ${orderNumber} |玩家 ${uid} 不存在 `);
            return { code: 500, error: '玩家不存在' };
        }

        const playerRep = ConnectionManager.getRepository(Player);

        ///@ts-ignore
        const player: Player = playerRep.create(playerList[0]);

        const { gold: playerGold, sid } = player;
        // 2.1 玩家信息
        orderPrice = Number(orderPrice) * 100;
        player.addRmb += orderPrice;
        player.addDayRmb = player.addDayRmb ? player.addDayRmb + orderPrice : orderPrice;

        // 更新玩家信息
        await queryRunner.manager.update(Player, { uid: this.uid }, player);

        // 提交事务
        await queryRunner.commitTransaction();
        // 2.2 PayInfo
        const payInfoParameter = {
            orderNumber: orderNumber,
            attach,
            customerId,
            total_fee: orderPrice,
            remark: remark,
            uid,
            addgold: Math.ceil(orderPrice) + (bonus ? bonus * 100 : 0),         // 获得金豆uid
            isUpdateGold: false,                    // 前端收到通知是否更新
            gold: playerGold,
            lastGold: 0,                            // 最后玩家身上的金币
            bonus: bonus * 100,
            groupRemark: player.groupRemark ? player.groupRemark : null
        };

        await PayInfoMysqlDao.insertOne(payInfoParameter);
        /**
         * Step 3: 通知前端
         */
        const msgUserIds = { uid, sid, orderId: orderNumber };
        // 标记 含有充值记录的玩家
        if (!payOrder.payPlayers.find(m => m && m.orderId === orderNumber)) {
            payOrder.payPlayers.push(msgUserIds);
        }
        // 轮询通知游戏前端
        // if (!payOrder.timer) {
        //     //每5秒通知前端充值到账
        //     payOrder.timer = setInterval(() => {
        //         payOrder.payPlayers.map(async ({ uid, orderId, sid }) => {
        //             const payInfoList = await PayInfoMysqlDao.findOne({ orderNumber: orderId });
        //
        //             if (payInfoList && payInfoList.isUpdateGold) {
        //                 utils.remove(payOrder.payPlayers, 'uid', uid);
        //                 return;
        //             }
        //
        //             if (payOrder.payPlayers.length === 0) {
        //                 clearInterval(payOrder.timer);
        //                 payOrder.timer = null;
        //                 return;
        //             }
        //
        //             //如果没有sid不是在线玩家
        //             // const currSid = await GetDataService.getSid(uid);
        //             // if (!currSid) {
        //             //     // payOrder.payPlayers.remove('uid', m.uid);
        //             //     utils.remove(payOrder.payPlayers, 'uid', uid);
        //             //     return;
        //             // }
        //             console.warn(`通知金币更新 | 订单号 :${orderId}`)
        //             // sid = currSid;
        //             // console.warn(`通知前端更新金币|订单号:${orderNum}`);
        //             msgService.pushMessageByUids('requestOrder', { orderId }, { uid, sid });
        //
        //         });
        //     }, 5000);
        // }
        await queryRunner.commitTransaction();
        return { code: 200 };
    } catch (e) {
        await queryRunner.rollbackTransaction();
        globalErrorLogger.error(`支付回传 | 玩家 : ${uid} 订单:${orderNumber} 出错 :${e.stack ? e.stack : e}`);
        return { code: 500, error: e };
    }
}