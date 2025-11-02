'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.iosPayVerify = exports.googlePayVerify = void 0;
const payUtil = require("../../utils/payUtil");
const hallConst = require("../../consts/hallConst");
const payConfig = require('../../../config/pay/payConfig');
const MongoManager = require("../../common/dao/mongoDB/lib/mongoManager");
const pinus_logger_1 = require("pinus-logger");
const PayLogger = (0, pinus_logger_1.getLogger)('pay_info', __filename);
function encryption(signSource) {
    signSource['paySecret'] = payConfig.paySecret;
    signSource = payUtil.parameterSort(signSource);
    signSource = JSON.stringify(signSource);
    let signs = payUtil.signature(signSource, false, false);
    return signs;
}
async function orderVerify(data, isSignVerify) {
    try {
        PayLogger.info('订单验证签名和订单合法性验证', data);
        const signs_ = data.signs;
        delete data.signs;
        const signs = encryption(data);
        PayLogger.info('内购签名前端', signs_);
        PayLogger.info('内购签名服务器', signs);
        if (isSignVerify && signs_ !== signs) {
            return Promise.reject('内购验签失败');
        }
        const { orderNumber } = data;
        const pay_order = MongoManager.pay_order;
        const orderData = await pay_order.find({ orderNumber: orderNumber, status: 0 }, null, { lean: true });
        if (!orderData.length) {
            return Promise.reject('没有找到订单号');
        }
        return Promise.resolve(orderData);
    }
    catch (error) {
        PayLogger.info(`支付内购验证失败==>${error}`);
        return Promise.reject('内购验证失败');
    }
}
async function getPayRes(data, access_token) {
    try {
        let url = 'https://www.googleapis.com/androidpublisher/v3/applications/';
        url += data.packageName + '/purchases/products/' + data.productId + '/tokens/' + data.purchaseToken;
        url += '?access_token=' + access_token;
        PayLogger.info(`谷歌内购验证地址${url}`);
        const resPay = await payUtil.sendHttpsGet(url);
        PayLogger.info('验证结果', resPay, resPay.toString());
    }
    catch (error) {
        PayLogger.info(`getPayRes==>${error}`);
        return Promise.reject('google验证支付失败');
    }
}
async function googlePay(data) {
    try {
        PayLogger.info('谷歌网络接口验证参数', data);
        const client_id = hallConst.CLIENT_ID;
        const client_secret = hallConst.CLIENT_SECRET;
        const refresh_token = hallConst.REFRESH_TOKEN;
        let new_access_token = await payUtil.sendHttpPostHttps({
            parameter: {
                grant_type: 'refresh_token',
                client_id: client_id,
                client_secret: client_secret,
                refresh_token: refresh_token,
            },
            domainName: 'accounts.google.com',
            path: 'o/oauth2/token',
            isJson: false
        });
        PayLogger.info('获取new_access_token', new_access_token);
        if (new_access_token) {
            new_access_token = JSON.parse(new_access_token);
            await getPayRes(data, new_access_token.access_token);
        }
    }
    catch (error) {
        PayLogger.info(`googlePay==>${error}`);
        return Promise.reject('google网络接口验证失败');
    }
}
async function iosPay(data) {
    async function verifyIos(data_, url) {
        const reqData = await payUtil.sendHttpPostHttps({
            parameter: data_,
            domainName: url,
            path: 'verifyReceipt',
            isJson: true
        });
        return reqData;
    }
    try {
        PayLogger.info('ios网络接口验证参数', data);
        const data_ = {
            "receipt-data": data['receipt-data'],
        };
        let reqData = await verifyIos(data_, 'buy.itunes.apple.com');
        PayLogger.info(`ios支付验证请求结果正式环境${reqData}`);
        reqData = JSON.parse(reqData);
        if (reqData.status === 21007) {
            reqData = await verifyIos(data_, 'sandbox.itunes.apple.com');
            PayLogger.info(`ios支付验证请求结果测试环境${reqData}`);
            reqData = JSON.parse(reqData);
        }
        if (!reqData || (reqData && reqData.status !== 0)) {
            return Promise.reject(`ios网络接口验证失败reqData:${reqData}`);
        }
    }
    catch (error) {
        PayLogger.info(`iosPay==>${error}`);
        return Promise.reject('ios网络接口验证失败');
    }
}
const googlePayVerify = async function (data) {
    try {
        const orderData = await orderVerify(data, false);
        try {
            await googlePay(data);
        }
        catch (error) {
            PayLogger.info(`googlePayVerify==>${error}`);
        }
        return Promise.resolve(orderData);
    }
    catch (error) {
        PayLogger.info(`谷歌支付内购验证失败==>${error}`);
        return Promise.reject('谷歌内购验证失败');
    }
};
exports.googlePayVerify = googlePayVerify;
const iosPayVerify = async function (data) {
    try {
        const orderData = await orderVerify(data, false);
        await iosPay(data);
        return Promise.resolve(orderData);
    }
    catch (error) {
        PayLogger.info(`ios支付内购验证失败==>${error}`);
        return Promise.reject('ios内购验证失败');
    }
};
exports.iosPayVerify = iosPayVerify;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9wYXlTZXJ2aWNlL3BheVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFDYiwrQ0FBZ0Q7QUFDaEQsb0RBQXFEO0FBQ3JELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQzNELDBFQUEyRTtBQUMzRSwrQ0FBeUM7QUFDekMsTUFBTSxTQUFTLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUlwRCxTQUFTLFVBQVUsQ0FBQyxVQUFVO0lBQzFCLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO0lBQzlDLFVBQVUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQy9DLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3hDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN4RCxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBR0QsS0FBSyxVQUFVLFdBQVcsQ0FBQyxJQUFJLEVBQUUsWUFBWTtJQUN6QyxJQUFJO1FBQ0EsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQzFCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNsQixNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFL0IsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDakMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFakMsSUFBSSxZQUFZLElBQUksTUFBTSxLQUFLLEtBQUssRUFBRTtZQUNsQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDbkM7UUFDRCxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRTdCLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUM7UUFDekMsTUFBTSxTQUFTLEdBQUcsTUFBTSxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdEcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDbkIsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ3BDO1FBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3JDO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN0QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDbkM7QUFDTCxDQUFDO0FBR0QsS0FBSyxVQUFVLFNBQVMsQ0FBQyxJQUFJLEVBQUUsWUFBWTtJQUN2QyxJQUFJO1FBRUEsSUFBSSxHQUFHLEdBQUcsOERBQThELENBQUM7UUFDekUsR0FBRyxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUNwRyxHQUFHLElBQUksZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO1FBQ3ZDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7S0FDckQ7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN6QztBQUVMLENBQUM7QUFJRCxLQUFLLFVBQVUsU0FBUyxDQUFDLElBQUk7SUFDekIsSUFBSTtRQUNBLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25DLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7UUFDdEMsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQztRQUM5QyxNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDO1FBRzlDLElBQUksZ0JBQWdCLEdBQVEsTUFBTSxPQUFPLENBQUMsaUJBQWlCLENBQUM7WUFDeEQsU0FBUyxFQUFFO2dCQUNQLFVBQVUsRUFBRSxlQUFlO2dCQUMzQixTQUFTLEVBQUUsU0FBUztnQkFDcEIsYUFBYSxFQUFFLGFBQWE7Z0JBQzVCLGFBQWEsRUFBRSxhQUFhO2FBQy9CO1lBQ0QsVUFBVSxFQUFFLHFCQUFxQjtZQUNqQyxJQUFJLEVBQUUsZ0JBQWdCO1lBQ3RCLE1BQU0sRUFBRSxLQUFLO1NBQ2hCLENBQUMsQ0FBQztRQUNILFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN2RCxJQUFJLGdCQUFnQixFQUFFO1lBQ2xCLGdCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUVoRCxNQUFNLFNBQVMsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7U0FHeEQ7S0FDSjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDdkMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDM0M7QUFFTCxDQUFDO0FBR0QsS0FBSyxVQUFVLE1BQU0sQ0FBQyxJQUFJO0lBQ3RCLEtBQUssVUFBVSxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUc7UUFDL0IsTUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsaUJBQWlCLENBQUM7WUFDNUMsU0FBUyxFQUFFLEtBQUs7WUFDaEIsVUFBVSxFQUFFLEdBQUc7WUFDZixJQUFJLEVBQUUsZUFBZTtZQUNyQixNQUFNLEVBQUUsSUFBSTtTQUNmLENBQUMsQ0FBQztRQUNILE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFFRCxJQUFJO1FBQ0EsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDcEMsTUFBTSxLQUFLLEdBQUc7WUFDVixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQztTQUN2QyxDQUFBO1FBRUQsSUFBSSxPQUFPLEdBQVEsTUFBTSxTQUFTLENBQUMsS0FBSyxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFDbEUsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUM1QyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU5QixJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssS0FBSyxFQUFFO1lBQzFCLE9BQU8sR0FBRyxNQUFNLFNBQVMsQ0FBQyxLQUFLLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztZQUM3RCxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQzVDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2pDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQy9DLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsT0FBTyxFQUFFLENBQUMsQ0FBQztTQUMxRDtLQUVKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNwQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDeEM7QUFDTCxDQUFDO0FBS00sTUFBTSxlQUFlLEdBQUcsS0FBSyxXQUFXLElBQUk7SUFDL0MsSUFBSTtRQUVBLE1BQU0sU0FBUyxHQUFHLE1BQU0sV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVqRCxJQUFJO1lBRUEsTUFBTSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDaEQ7UUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDckM7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDeEMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ3JDO0FBRUwsQ0FBQyxDQUFBO0FBakJZLFFBQUEsZUFBZSxtQkFpQjNCO0FBR00sTUFBTSxZQUFZLEdBQUcsS0FBSyxXQUFXLElBQUk7SUFDNUMsSUFBSTtRQUVBLE1BQU0sU0FBUyxHQUFHLE1BQU0sV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVqRCxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDckM7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDekMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ3RDO0FBRUwsQ0FBQyxDQUFBO0FBWlksUUFBQSxZQUFZLGdCQVl4QiJ9