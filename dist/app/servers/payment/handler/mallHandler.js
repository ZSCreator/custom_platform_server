"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mallHandler = void 0;
const pinus_logger_1 = require("pinus-logger");
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const mallService_1 = require("../../../services/hall/mallHandler/mallService");
const langsrv = require("../../../services/common/langsrv");
const PayOrder_mysql_dao_1 = require("../../../common/dao/mysql/PayOrder.mysql.dao");
const moment = require("moment");
const LogTelegramCustomerRecord_mysql_dao_1 = require("../../../common/dao/mysql/LogTelegramCustomerRecord.mysql.dao");
const TelegramCustomer_mysql_dao_1 = require("../../../common/dao/mysql/TelegramCustomer.mysql.dao");
function default_1(app) {
    return new mallHandler(app);
}
exports.default = default_1;
class mallHandler {
    constructor(app) {
        this.app = app;
        this.app = app;
        this.preLoggerStr = `商城 | handler | `;
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
        this.mallService = new mallService_1.default();
    }
    async getAllPayMethodAndGoldItemInfo(_, session) {
        const { uid } = session;
        const player = await Player_manager_1.default.findOne({ uid }, false);
        try {
            this.logger.info(`${this.preLoggerStr}用户:${uid} | 获取可用的支付方式和商品信息`);
            const resultData = await this.mallService.getPaymentAndGoods();
            if (!resultData) {
                this.logger.error(`${this.preLoggerStr} 用户:${uid} | 向支付服务器获取支付方式和商品信息失败`);
                return { code: 500, data: [], error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_106) };
            }
            const { code, data } = resultData;
            if (code !== 200) {
                this.logger.warn(`${this.preLoggerStr} 用户:${uid} | 获取支付方式和商品信息异常: ${JSON.stringify(resultData, null, 2)}`);
                return resultData;
            }
            const result = data.reduce((res, info) => {
                const { itemInfo, payMethodId, channelId, methodName_en } = info;
                itemInfo.forEach(i => {
                    const { goodsId } = i;
                    if (!res.goodsList.find(goodInfo => goodInfo.goodsId === goodsId)) {
                        res.goodsList.push(i);
                    }
                });
                if (!res.paymentList.find(paymentInfo => paymentInfo.payMethodId === payMethodId)) {
                    res.paymentList.push({ payMethodId, methodName_en, channelId });
                }
                return res;
            }, { goodsList: [], paymentList: [] });
            this.logger.info(`${this.preLoggerStr} 用户:${uid} | 获取支付方式和商品信息正常 | ${data.length} 条支付方式 `);
            const telegramCustomer = { name: "Contate-Nos" };
            const { total } = await LogTelegramCustomerRecord_mysql_dao_1.default.getCountTotal();
            if (total > 0) {
                const list = await LogTelegramCustomerRecord_mysql_dao_1.default.getCountForEveryCustomer();
                if (list.length > 0) {
                    const l = list.map(info => {
                        const { count } = info, rest = __rest(info, ["count"]);
                        const totalPercentage = count / total;
                        return Object.assign({ totalPercentage }, rest);
                    }).sort((x, y) => x.totalPercentage - y.totalPercentage);
                    const { id, nickname, url, } = l[0];
                    telegramCustomer.phone = nickname;
                    telegramCustomer.url = url;
                    telegramCustomer.customerId = id;
                }
            }
            if (!telegramCustomer.hasOwnProperty("phone")) {
                const customer = await TelegramCustomer_mysql_dao_1.default.findOne({ status: 1 });
                if (customer) {
                    const { id, nickname, url, } = customer;
                    telegramCustomer.phone = nickname;
                    telegramCustomer.url = url;
                    telegramCustomer.customerId = id;
                }
            }
            return {
                code: 200,
                data: Object.assign({ customerPayInfo: [telegramCustomer] }, result),
                msg: 'SUCCESS'
            };
        }
        catch (e) {
            this.logger.error(`${this.preLoggerStr} 用户:${uid} | 向支付服务器获取支付方式和商品信息失败`);
            return { code: 500, data: [], error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_106) };
        }
    }
    async chooseCustomer(customerType = 1, customerId, session) {
        if (customerType === 1) {
            await LogTelegramCustomerRecord_mysql_dao_1.default.insertOne({ fk_telegramCustomer_id: customerId });
        }
        return {
            code: 200,
            data: null,
            msg: 'SUCCESS'
        };
    }
    async chooseGoldItemAndForwardPayWeb({ goodsId = null, payMethodId, amount, osType }, session) {
        const { uid } = session;
        const player = await Player_manager_1.default.findOne({ uid }, false);
        try {
            const _goodsId = !!goodsId ? Number(goodsId) : 0;
            const _payMethodId = Number(payMethodId);
            const resultData = await this.mallService.getPayWebAndOrderNumber(uid, _goodsId, _payMethodId, amount, osType);
            if (!resultData) {
                this.logger.error(`${this.preLoggerStr} 用户:${uid} | 向支付服务器获取支付页面失败`);
                return { code: 500, data: [], msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_107) };
            }
            const { code, data, msg } = resultData;
            if (code !== 200) {
                this.logger.warn(`${this.preLoggerStr} 用户:${uid} | 向支付服务器获取支付页面 异常: code:${code} msg:${msg}`);
                return { code: 500, data: [], msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_107) };
            }
            const { orderNumber, accountName } = data;
            if (orderNumber) {
                let payTypeName = ``;
                switch (_payMethodId) {
                    case 1:
                        payTypeName = `支付宝`;
                        break;
                    case 2:
                        payTypeName = `微信`;
                        break;
                    case 3:
                        payTypeName = `云闪付`;
                        break;
                    case 6:
                        payTypeName = `upi3`;
                        break;
                    case 7:
                        payTypeName = `paytm`;
                        break;
                    default:
                        break;
                }
                const orderData = {
                    orderNumber,
                    createDate: new Date(),
                    uid,
                    money: amount * 100,
                    platform: accountName,
                    payType: payTypeName,
                    status: 0,
                    field1: `gold-${uid}`,
                    shopId: `${goodsId}`
                };
                await PayOrder_mysql_dao_1.default.insertOne(orderData);
            }
            return {
                code: 200,
                data,
                msg: '操作成功'
            };
        }
        catch (e) {
            this.logger.info(`${this.preLoggerStr} 获取支付页面| 用户:${uid} 金额:${amount} 客户端类型:${osType} | 出错 | ${e.stack}  `);
            return {
                code: 500,
                data: [],
                msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_107)
            };
        }
    }
    async paymentOrderList({ startPage }, session) {
        const { uid } = session;
        const player = await Player_manager_1.default.findOne({ uid });
        try {
            const { list } = await PayOrder_mysql_dao_1.default.findListToLimitByUid(uid, startPage, 10);
            const data = list.reduce((res, info) => {
                const { orderNumber, money, status, createDate } = info;
                res.push({
                    orderNumber,
                    amount: money,
                    status,
                    dataTime: moment(createDate).format("YYYY-MM-DD hh:mm:ss")
                });
                return res;
            }, []);
            return {
                code: 200,
                data,
                msg: '操作成功'
            };
        }
        catch (e) {
            return {
                code: 500,
                data: [],
                msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_107)
            };
        }
    }
}
exports.mallHandler = mallHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFsbEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9wYXltZW50L2hhbmRsZXIvbWFsbEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFDQSwrQ0FBeUM7QUFDekMsa0ZBQTBFO0FBQzFFLGdGQUF5RTtBQUN6RSw0REFBNEQ7QUFDNUQscUZBQTRFO0FBQzVFLGlDQUFpQztBQUNqQyx1SEFBOEc7QUFDOUcscUdBQTRGO0FBRTVGLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQU1ELE1BQWEsV0FBVztJQU9wQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBQ2hDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLFlBQVksR0FBRyxpQkFBaUIsQ0FBQztRQUN0QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLHFCQUFXLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBT0QsS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUMsRUFBRSxPQUF1QjtRQUMzRCxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLE1BQU0sd0JBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzRCxJQUFJO1lBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxNQUFNLEdBQUcsbUJBQW1CLENBQUMsQ0FBQztZQUNuRSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxX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