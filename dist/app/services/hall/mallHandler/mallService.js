"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const serverConfig = require("../../../services/payService/serverConfig");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const MongoManager = require("../../../common/dao/mongoDB/lib/mongoManager");
const pinus_1 = require("pinus");
const vipCustomerInfoDao = MongoManager.vip_customer_info;
class MallService {
    constructor() {
        this.env = pinus_1.pinus.app.get(pinus_1.RESERVED.ENV) || "development";
        this.serverUrl = this.env === "development" ? "http://192.168.191.5:9999" : `${serverConfig.payServer.domainName}`;
    }
    async getPaymentAndGoods() {
        try {
            const parameter = {
                serverName: "ydapp"
            };
            const { status, data } = await axios_1.default.post(`${this.serverUrl}/api/mall/getUserablePayInfo`, parameter);
            if (status !== 200)
                return false;
            return data;
        }
        catch (e) {
            logger.error(`商城 | service | 获取支付通道和商品信息出错:${e.stack}`);
            return false;
        }
    }
    async getVIPCustomerList() {
        const list = await vipCustomerInfoDao.find({ isOpen: true });
        let l = list.filter((info) => info.sort <= 0);
        for (const ele of list.filter(info => info.sort > 0).sort((a, b) => a.sort - b.sort)) {
            l.splice(ele.sort - 1, 0, ele);
        }
        return l.reduce((result, info) => {
            const { _id: id, name: title, qq_id: QQNum, wechat_id: weixinNum, other_id: otherUrl, } = info;
            result.push({ id, title, QQNum, weixinNum, otherUrl });
            return result;
        }, []);
    }
    async getPayWebAndOrderNumber(uid, goodsId, payMethodId, amount, osType) {
        try {
            const parameter = {
                uid,
                serverName: "ydapp",
                goodsId,
                payMethodId,
                amount,
                osType
            };
            const { status, data } = await axios_1.default.post(`${this.serverUrl}/api/mall/getPayUrl`, parameter);
            if (status !== 200)
                return false;
            return data;
        }
        catch (e) {
            logger.error(`商城 | service | 获取支付页面出错 :${e.stack}`);
            return false;
        }
    }
    async getPayForCashOrder(params) {
        try {
            const { uid, cardHolderName, accountName, cardNumber, betFlowMag, amount, requestAmount, type } = params;
            const parameter = {
                serverName: "ydapp",
                uid,
                cardHolderName,
                accountName,
                cardNumber,
                betFlowMag: betFlowMag || 0,
                amount,
                requestAmount,
                bankCode: "SBIN",
                type: type || 0
            };
            const { status, data } = await axios_1.default.post(`${this.serverUrl}/api/mall/getCashOrder`, parameter);
            if (status !== 200)
                return false;
            return data;
        }
        catch (e) {
            logger.error(`商城 | service | 代付出错 :${e.stack}`);
            return false;
        }
    }
}
exports.default = MallService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFsbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvaGFsbC9tYWxsSGFuZGxlci9tYWxsU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUEwQjtBQUUxQiwwRUFBMkU7QUFDM0UsK0NBQXlDO0FBQ3pDLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbkQsNkVBQThFO0FBQzlFLGlDQUF3QztBQUN4QyxNQUFNLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQztBQU8xRCxNQUFxQixXQUFXO0lBRzVCO1FBQ0ksSUFBSSxDQUFDLEdBQUcsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLGFBQWEsQ0FBQztRQUN4RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3ZILENBQUM7SUFLRCxLQUFLLENBQUMsa0JBQWtCO1FBRXBCLElBQUk7WUFHQSxNQUFNLFNBQVMsR0FBRztnQkFDZCxVQUFVLEVBQUUsT0FBTzthQUN0QixDQUFDO1lBR0YsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLGVBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyw4QkFBOEIsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUV0RyxJQUFJLE1BQU0sS0FBSyxHQUFHO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBRWpDLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLENB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