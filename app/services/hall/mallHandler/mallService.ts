import axios from "axios";
import JsonMgr = require('../../../../config/data/JsonMgr');
import serverConfig = require('../../../services/payService/serverConfig');
import { getLogger } from 'pinus-logger';
const logger = getLogger('server_out', __filename);
import MongoManager = require('../../../common/dao/mongoDB/lib/mongoManager');
import { pinus, RESERVED } from "pinus";
const vipCustomerInfoDao = MongoManager.vip_customer_info;
// const env = pinus.app.get(RESERVED.ENV) || "development";
// const serverUrl = env === "development" ? "http://192.168.191.5:9999" : `${serverConfig.payServer.domainName}`;
// const serverUrl = `${serverConfig.payServer.domainName}`;
/**
 * 原生充值自动匹配充值通道 业务层
 */
export default class MallService {
    env: string;
    serverUrl: string;
    constructor() {
        this.env = pinus.app.get(RESERVED.ENV) || "development";
        this.serverUrl = this.env === "development" ? "http://192.168.191.5:9999" : `${serverConfig.payServer.domainName}`;
    }

    /**
     * 获取支付通道和商品信息
     */
    async getPaymentAndGoods() {

        try {
            // const { serverName } = JsonMgr.get('noteTemplate').datas.find(serverConfig => serverConfig.status);

            const parameter = {
                serverName: "ydapp"
            };


            const { status, data } = await axios.post(`${this.serverUrl}/api/mall/getUserablePayInfo`, parameter);

            if (status !== 200) return false;

            return data;
        } catch (e) {
            logger.error(`商城 | service | 获取支付通道和商品信息出错:${e.stack}`);
            return false;
        }


    }

    async getVIPCustomerList() {

        const list = await vipCustomerInfoDao.find({ isOpen: true });

        let l = list.filter((info) => info.sort <= 0)

        for (const ele of list.filter(info => info.sort > 0).sort((a, b) => a.sort - b.sort)) {
            l.splice(ele.sort - 1, 0, ele);
        }

        return l.reduce((result, info) => {
            const {
                _id: id,
                name: title,
                qq_id: QQNum,
                wechat_id: weixinNum,
                other_id: otherUrl,
            } = info;

            result.push({ id, title, QQNum, weixinNum, otherUrl })

            return result;
        }, []);
    }

    /**
     * 获取支付页面地址和订单编号
     * @param {string }      uid         用户编号
     * @param {string|null}  goodsId     商品编号
     * @param {string}       payMethodId 支付方式编号
     * @param {number}       amount      金额(元)
     * @param {'phone'|'PC'} osType      client类型
     */
    async getPayWebAndOrderNumber(uid, goodsId, payMethodId, amount, osType) {
        try {
            // const { serverName } = JsonMgr.get('noteTemplate').datas.find(serverConfig => serverConfig.status);

            const parameter = {
                uid,
                serverName: "ydapp",
                goodsId,
                payMethodId,
                amount,
                osType
            };

            const { status, data } = await axios.post(`${this.serverUrl}/api/mall/getPayUrl`, parameter);

            if (status !== 200) return false;

            return data;
        } catch (e) {
            logger.error(`商城 | service | 获取支付页面出错 :${e.stack}`);
            return false;
        }
    }

    /** 
     * app
     * @description 2022年
     */
    /* async getGoodsList() {
        try {
            const parameter = {
                serverName: null
            };

            const { status, data } = await axios.post(`http://${serverConfig.payServer.domainName}/api/mall/getUserablePayInfo`, parameter);

            if (status !== 200) return false;

            return data;

        } catch (e) {
            logger.error(`商城 | service | 获取支付通道和商品信息出错:${e.stack}`);
            return false;
        }
    } */

    /**
     * 代付接口
     */
    async getPayForCashOrder(params: any) {
        try {
            const {
                uid,
                // 银行卡拥有者名字
                cardHolderName,
                accountName,
                // 银行卡号
                cardNumber,
                betFlowMag,
                // 代付金额
                amount,
                //用户请求原金额; = amount + 手续费
                requestAmount,
                //游戏服务端代付转储值：0:为检测是否是流水通过 1:强制提现
                type
            } = params;

            const parameter = {
                serverName: "ydapp",
                uid,
                cardHolderName,
                accountName,
                cardNumber,
                betFlowMag: betFlowMag || 0,
                amount,
                requestAmount,
                // 印度-钱多多专用值
                bankCode: "SBIN",
                type: type || 0
            }
            const { status, data } = await axios.post(`${this.serverUrl}/api/mall/getCashOrder`, parameter);

            if (status !== 200) return false;

            return data;
        } catch (e) {

            logger.error(`商城 | service | 代付出错 :${e.stack}`);
            return false;
        }
    }

}
