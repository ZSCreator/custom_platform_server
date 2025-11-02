'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.payHandler = void 0;
const PayInfo_mysql_dao_1 = require("../../../common/dao/mysql/PayInfo.mysql.dao");
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const langsrv = require("../../../services/common/langsrv");
const gamesBetAstrict_1 = require("../../../../config/data/gamesBetAstrict");
const pinus_logger_1 = require("pinus-logger");
const msgService = require("../../../services/MessageService");
const PayInfoLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function default_1(app) {
    return new payHandler(app);
}
exports.default = default_1;
class payHandler {
    constructor(app) {
        this.app = app;
        this.bingBankAndPayTreasure = async function ({ bankCardNo, bankCardName, bankName, bankAddress }, session) {
            try {
                const uid = session.uid;
                return { code: 200, bank: '' };
            }
            catch (error) {
                console.warn('hall.payHandler.bingBankAndPayTreasure', error);
                return { code: 500, error: error };
            }
        };
        this.addTixianMoneyRecord = async function ({ type, getMoney }, session) {
            try {
                const { uid } = session;
                return { code: 200, msg: '', money: 0, gold: 0 };
            }
            catch (error) {
                if (error.code && error.code == 501) {
                    return error;
                }
                return { code: 500, error };
            }
        };
    }
    async payRequest(msg, session) {
        try {
            return {
                code: 200,
                payURL: '',
                downLoadURL: '',
                orderNumber: null
            };
        }
        catch (error) {
            PayInfoLogger.error('hall.payHandler.payRequest==>', error);
            return { code: 500, error: '支付繁忙，稍后在试' };
        }
    }
    async getPlayerTixianMoneyAndBank({}, session) {
        try {
            const uid = session.uid;
            return { code: 200, bank: '', money: 0, targetChips: '', betFlow: 0 };
        }
        catch (error) {
            console.error('hall.payHandler.getBankAndPayTreasure', error);
            return { code: 500, error };
        }
    }
    async getPlayerTixianRecord({}, session) {
        try {
            const uid = session.uid;
            return { code: 200, list: [] };
        }
        catch (error) {
            console.error('hall.payHandler.getBankAndPayTreasure', error);
            return { code: 500, error };
        }
    }
    async getPayOrder({ orderId }, session) {
        try {
            const uid = session.uid;
            const orderDataList = await PayInfo_mysql_dao_1.default.findList({ uid: uid, isUpdateGold: false });
            if (!orderId && !orderDataList.length) {
                return { code: 500, msg: '订单号不应该为空' };
            }
            if (!orderDataList.length)
                return { code: 200, surplusOrder: orderDataList.length };
            const orderData = orderDataList.reduce((orderData, orderInfo) => {
                if (!orderId) {
                    return orderInfo;
                }
                if (orderInfo.orderNumber === orderId) {
                    orderData = orderInfo;
                }
                return orderData;
            }, {});
            if (!orderData) {
                return;
            }
            const player = await Player_manager_1.default.findOne({ uid });
            if (!player) {
                return;
            }
            let orderArr = await updateOrderGold([orderData], player);
            await Player_manager_1.default.updateOne({ uid: uid }, { gold: player.gold });
            let sid = player.sid;
            let msgUserIds = { uid: player.uid, sid: sid };
            msgService.pushMessageByUids('updateGold', {
                gold: player.gold,
                walletGold: player.walletGold,
            }, [msgUserIds]);
            return { code: 200, allOrder: [], gold: 0, surplusOrder: 0, isSuccess: true };
        }
        catch (error) {
            console.log('getPayOrder==>', error);
            return { code: 500, error: '获取充值数据失败' };
        }
    }
}
exports.payHandler = payHandler;
function updateOrderGold(orderData, player) {
    const orderArr = [];
    return new Promise((resolve, reject) => {
        Promise.all(orderData.map(async (order) => {
            try {
                const currGold = player.gold;
                PayInfoLogger.info(`充值前`, player.gold);
                player.gold += order.addgold;
                let remark = langsrv.getlanguage(player.language, langsrv.Net_Message.id_80, order.addgold / gamesBetAstrict_1.betAstrict.ratio);
                const orderData = {
                    gold: order.addgold,
                    rmb: order.total_fee,
                    remark: remark,
                    orderNum: order.id
                };
                orderArr.push(orderData);
                PayInfoLogger.info(`充值后`, player.gold);
                await PayInfo_mysql_dao_1.default.updateOne({ id: order.id }, {
                    gold: currGold,
                    isUpdateGold: true,
                    lastGold: player.gold
                });
            }
            catch (error) {
                return reject(error);
            }
        })).then(data => {
            return resolve(orderArr);
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5SGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3BheW1lbnQvaGFuZGxlci9wYXlIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBR2IsbUZBQTJFO0FBQzNFLGtGQUE4RTtBQUU5RSw0REFBNkQ7QUFFN0QsNkVBQXFFO0FBQ3JFLCtDQUFpRDtBQUNqRCwrREFBK0Q7QUFDL0QsTUFBTSxhQUFhLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUcxRCxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFhLFVBQVU7SUFDbkIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQWllcEMsMkJBQXNCLEdBQUcsS0FBSyxXQUFXLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEVBQUUsT0FBdUI7WUFDakgsSUFBSTtnQkFDQSxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUV4QixPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUE7YUFDakM7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDWixPQUFPLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM5RCxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUE7YUFDckM7UUFFTCxDQUFDLENBQUE7UUFVRCx5QkFBb0IsR0FBRyxLQUFLLFdBQVcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsT0FBdUI7WUFDOUUsSUFBSTtnQkFDQSxNQUFNLEVBQUUsR0FBRyxF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