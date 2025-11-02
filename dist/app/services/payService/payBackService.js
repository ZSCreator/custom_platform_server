'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mallCallbackFromHttpForTran = exports.mallCallbackFromHttp = exports.mallCallback = exports.updateNeedPayPlayer = exports.intoOrderNumber = void 0;
const utils = require("../../utils");
const PayInfo_mysql_dao_1 = require("../../common/dao/mysql/PayInfo.mysql.dao");
const PayOrder_mysql_dao_1 = require("../../common/dao/mysql/PayOrder.mysql.dao");
const Player_manager_1 = require("../../common/dao/daoManager/Player.manager");
const Player_entity_1 = require("../../common/dao/mysql/entity/Player.entity");
const pinus_logger_1 = require("pinus-logger");
const connectionManager_1 = require("../../common/dao/mysql/lib/connectionManager");
const redisGoldEvent_1 = require("../../common/event/redisGoldEvent");
const vipSystemService_1 = require("../activity/vipSystemService");
const hallConst_1 = require("../../consts/hallConst");
const globalErrorLogger = (0, pinus_logger_1.getLogger)('global_error_log', __filename);
let orderNumber = [];
let payOrder = {
    timer: null,
    payPlayers: []
};
const intoOrderNumber = async function (orderNum_) {
    const currOrder = orderNumber.find(m => m.orderId === orderNum_);
    const currTime = Date.now();
    orderNumber = orderNumber.filter(m => m && ((Date.now() - m.time) <= 30 * 1000));
    if (!currOrder) {
        orderNumber.push({
            orderId: orderNum_,
            time: Date.now()
        });
        return true;
    }
    if ((currTime - currOrder.time) <= 8 * 1000) {
        return false;
    }
    return true;
};
exports.intoOrderNumber = intoOrderNumber;
const updateNeedPayPlayer = async function (uid) {
    utils.remove(payOrder.payPlayers, 'uid', uid);
    return null;
};
exports.updateNeedPayPlayer = updateNeedPayPlayer;
async function mallCallback({ field1, orderNumber, orderPrice, platform = null, orderTime, customerName = '', customerId, customerIp, remark = '' }) {
    let _lock = null;
    const [attach, uid] = field1.split('-');
    try {
        const payInfoList = await PayInfo_mysql_dao_1.default.findOne({ id: orderNumber });
        if (payInfoList) {
            globalErrorLogger.info(`支付回传 | pay_info 订单号: ${orderNumber} 重复 `);
            return { code: 500, error: '订单号重复' };
        }
        const order = await PayOrder_mysql_dao_1.default.findOne({ orderNumber });
        if (order && order.isLock) {
            globalErrorLogger.info(`支付回传 | pay_order 订单号: ${orderNumber} 订单已经锁定 `);
            return { code: 500, error: '订单已经锁定' };
        }
        return { code: 200 };
    }
    catch (e) {
        globalErrorLogger.error(`支付回传 | 玩家 : ${uid} 订单:${orderNumber} 出错 :${e.stack ? e.stack : e}`);
        return { code: 500, error: e };
    }
    finally {
    }
}
exports.mallCallback = mallCallback;
async function mallCallbackFromHttp({ field1, orderNumber, orderPrice, orderTime, remark = '' }, bonus = 0) {
    const [attach, uid] = field1.split('-');
    try {
        const payInfoList = await PayInfo_mysql_dao_1.default.findOne({ orderNumber: orderNumber });
        if (payInfoList) {
            globalErrorLogger.info(`支付回传 | pay_info 订单号: ${orderNumber} 重复 `);
            return { code: 500, error: '订单号重复' };
        }
        const order = await PayOrder_mysql_dao_1.default.findOne({ orderNumber });
        if (order && order.isLock) {
            globalErrorLogger.info(`支付回传 | pay_order 订单号: ${orderNumber} 订单已经锁定 `);
            return { code: 500, error: '订单已经锁定' };
        }
        const player = await Player_manager_1.default.findOne({ uid }, true);
        if (!player) {
            globalErrorLogger.info(`支付回传 | 更新记录 订单号: ${orderNumber} |玩家 ${uid} 不存在 `);
            return { code: 500, error: '玩家不存在' };
        }
        const { gold: playerGold, sid } = player;
        player.addRmb += orderPrice;
        player.addDayRmb = player.addDayRmb ? player.addDayRmb + orderPrice : orderPrice;
        orderPrice = Number(orderPrice) / 100;
        const level = await (0, vipSystemService_1.checkVipLevelAndBouns)(uid, player.level, player.addDayRmb);
        let withdrawalChips = 0;
        if (player.language === hallConst_1.LANGUAGE.Portugal) {
            if (player.withdrawalChips > 0) {
                withdrawalChips = player.withdrawalChips + (orderPrice * 100);
            }
            else {
                withdrawalChips = orderPrice * 100;
            }
        }
        await Player_manager_1.default.updateOne({ uid }, { addRmb: player.addRmb, addDayRmb: player.addDayRmb, level, withdrawalChips });
        const payInfoParameter = {
            orderNumber: orderNumber,
            attach,
            total_fee: orderPrice,
            remark: remark,
            uid,
            addgold: Math.ceil(orderPrice) + (bonus ? bonus * 100 : 0),
            isUpdateGold: false,
            gold: playerGold,
            lastGold: 0,
            bonus: bonus * 100
        };
        await PayInfo_mysql_dao_1.default.insertOne(payInfoParameter);
        if (order) {
            await PayOrder_mysql_dao_1.default.updateOne({ orderNumber }, { status: 1 });
        }
        await (0, redisGoldEvent_1.sendRedisGoldMessage)({ uid });
        return { code: 200 };
    }
    catch (e) {
        globalErrorLogger.error(`支付回传 | 玩家 : ${uid} 订单:${orderNumber} 出错 :${e.stack ? e.stack : e}`);
        return { code: 500, error: e };
    }
}
exports.mallCallbackFromHttp = mallCallbackFromHttp;
async function mallCallbackFromHttpForTran({ field1, orderNumber, orderPrice, orderTime, customerName = '', customerId, customerIp, remark = '' }, bonus = 0) {
    const [attach, uid] = field1.split('-');
    let queryRunner;
    try {
        const payInfoList = await PayInfo_mysql_dao_1.default.findOne({ orderNumber: orderNumber });
        if (payInfoList) {
            globalErrorLogger.info(`支付回传 | pay_info 订单号: ${orderNumber} 重复 `);
            return { code: 500, error: '订单号重复' };
        }
        queryRunner = connectionManager_1.default.getConnection().createQueryRunner();
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
        const playerRep = connectionManager_1.default.getRepository(Player_entity_1.Player);
        const player = playerRep.create(playerList[0]);
        const { gold: playerGold, sid } = player;
        orderPrice = Number(orderPrice) * 100;
        player.addRmb += orderPrice;
        player.addDayRmb = player.addDayRmb ? player.addDayRmb + orderPrice : orderPrice;
        await queryRunner.manager.update(Player_entity_1.Player, { uid: this.uid }, player);
        await queryRunner.commitTransaction();
        const payInfoParameter = {
            orderNumber: orderNumber,
            attach,
            customerId,
            total_fee: orderPrice,
            remark: remark,
            uid,
            addgold: Math.ceil(orderPrice) + (bonus ? bonus * 100 : 0),
            isUpdateGold: false,
            gold: playerGold,
            lastGold: 0,
            bonus: bonus * 100,
            groupRemark: player.groupRemark ? player.groupRemark : null
        };
        await PayInfo_mysql_dao_1.default.insertOne(payInfoParameter);
        const msgUserIds = { uid, sid, orderId: orderNumber };
        if (!payOrder.payPlayers.find(m => m && m.orderId === orderNumber)) {
            payOrder.payPlayers.push(msgUserIds);
        }
        await queryRunner.commitTransaction();
        return { code: 200 };
    }
    catch (e) {
        await queryRunner.rollbackTransaction();
        globalErrorLogger.error(`支付回传 | 玩家 : ${uid} 订单:${orderNumber} 出错 :${e.stack ? e.stack : e}`);
        return { code: 500, error: e };
    }
}
exports.mallCallbackFromHttpForTran = mallCallbackFromHttpForTran;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5QmFja1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvcGF5U2VydmljZS9wYXlCYWNrU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHFDQUFzQztBQUV0QyxnRkFBdUU7QUFDdkUsa0ZBQXlFO0FBQ3pFLCtFQUEwRTtBQUMxRSwrRUFBcUU7QUFFckUsK0NBQXlDO0FBR3pDLG9GQUE2RTtBQUM3RSxzRUFBeUU7QUFDekUsbUVBQXFFO0FBQ3JFLHNEQUFrRDtBQUNsRCxNQUFNLGlCQUFpQixHQUFHLElBQUEsd0JBQVMsRUFBQyxrQkFBa0IsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUVwRSxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDckIsSUFBSSxRQUFRLEdBQVE7SUFDaEIsS0FBSyxFQUFFLElBQUk7SUFDWCxVQUFVLEVBQUUsRUFBRTtDQUNqQixDQUFDO0FBUUssTUFBTSxlQUFlLEdBQUcsS0FBSyxXQUFXLFNBQVM7SUFDcEQsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDLENBQUM7SUFDakUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRTVCLFdBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBRWpGLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDWixXQUFXLENBQUMsSUFBSSxDQUFDO1lBQ2IsT0FBTyxFQUFFLFNBQVM7WUFDbEIsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEVB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