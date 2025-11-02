'use strict';
import payUtil = require('../../utils/payUtil');
import hallConst = require('../../consts/hallConst');
const payConfig = require('../../../config/pay/payConfig');
import MongoManager = require('../../common/dao/mongoDB/lib/mongoManager');
import { getLogger } from 'pinus-logger';
const PayLogger = getLogger('pay_info', __filename);


//验签
function encryption(signSource) {
    signSource['paySecret'] = payConfig.paySecret;
    signSource = payUtil.parameterSort(signSource);//参数排序
    signSource = JSON.stringify(signSource);
    let signs = payUtil.signature(signSource, false, false);//参数签名
    return signs;
}

//订单验证签名和订单合法性验证
async function orderVerify(data, isSignVerify) {
    try {
        PayLogger.info('订单验证签名和订单合法性验证', data);
        const signs_ = data.signs;
        delete data.signs;
        const signs = encryption(data);

        PayLogger.info('内购签名前端', signs_);
        PayLogger.info('内购签名服务器', signs);
        //验证签名
        if (isSignVerify && signs_ !== signs) {
            return Promise.reject('内购验签失败');
        }
        const { orderNumber } = data;
        //查询支付订单是否存在
        const pay_order = MongoManager.pay_order;
        const orderData = await pay_order.find({ orderNumber: orderNumber, status: 0 }, null, { lean: true });
        if (!orderData.length) {
            return Promise.reject('没有找到订单号');
        }
        return Promise.resolve(orderData);
    } catch (error) {
        PayLogger.info(`支付内购验证失败==>${error}`);
        return Promise.reject('内购验证失败');
    }
}

//谷歌支付接口验证请求
async function getPayRes(data, access_token) {
    try {
        //请求验证接口
        let url = 'https://www.googleapis.com/androidpublisher/v3/applications/';
        url += data.packageName + '/purchases/products/' + data.productId + '/tokens/' + data.purchaseToken;
        url += '?access_token=' + access_token;
        PayLogger.info(`谷歌内购验证地址${url}`);
        const resPay = await payUtil.sendHttpsGet(url);
        PayLogger.info('验证结果', resPay, resPay.toString());
    } catch (error) {
        PayLogger.info(`getPayRes==>${error}`);
        return Promise.reject('google验证支付失败');
    }

}


//谷歌网络接口验证
async function googlePay(data) {
    try {
        PayLogger.info('谷歌网络接口验证参数', data);
        const client_id = hallConst.CLIENT_ID;
        const client_secret = hallConst.CLIENT_SECRET;
        const refresh_token = hallConst.REFRESH_TOKEN;

        //使用刷新令牌更新获取访问令牌
        let new_access_token: any = await payUtil.sendHttpPostHttps({
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
            //接口验证
            await getPayRes(data, new_access_token.access_token);

            //记录访问令牌到缓存
        }
    } catch (error) {
        PayLogger.info(`googlePay==>${error}`);
        return Promise.reject('google网络接口验证失败');
    }

}

//iso网络接口验证
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
        }

        let reqData: any = await verifyIos(data_, 'buy.itunes.apple.com');
        PayLogger.info(`ios支付验证请求结果正式环境${reqData}`);
        reqData = JSON.parse(reqData);
        //如果是测试环境的收据 使用测试环境验证
        if (reqData.status === 21007) {
            reqData = await verifyIos(data_, 'sandbox.itunes.apple.com');
            PayLogger.info(`ios支付验证请求结果测试环境${reqData}`);
            reqData = JSON.parse(reqData);
        }
        if (!reqData || (reqData && reqData.status !== 0)) {
            return Promise.reject(`ios网络接口验证失败reqData:${reqData}`);
        }

    } catch (error) {
        PayLogger.info(`iosPay==>${error}`);
        return Promise.reject('ios网络接口验证失败');
    }
}

// let cc = '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'
// iosPay({"receipt-data": cc});
//谷歌支付验证（内购）
export const googlePayVerify = async function (data) {
    try {
        //签名验证
        const orderData = await orderVerify(data, false);
        //网络验证接口，可能不可用
        try {
            //网络接口验证
            await googlePay(data);
        } catch (error) {
            PayLogger.info(`googlePayVerify==>${error}`);
        }
        return Promise.resolve(orderData);
    } catch (error) {
        PayLogger.info(`谷歌支付内购验证失败==>${error}`);
        return Promise.reject('谷歌内购验证失败');
    }

}

//ios支付验证（内购）
export const iosPayVerify = async function (data) {
    try {
        //签名验证
        const orderData = await orderVerify(data, false);
        //网络接口验证
        await iosPay(data);
        return Promise.resolve(orderData);
    } catch (error) {
        PayLogger.info(`ios支付内购验证失败==>${error}`);
        return Promise.reject('ios内购验证失败');
    }

}
