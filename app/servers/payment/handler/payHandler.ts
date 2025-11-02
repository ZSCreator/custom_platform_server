'use strict';
import { Application, BackendSession, pinus } from 'pinus';
import gutils = require('../../../domain/games/util');
import  PayInfoMysqlDao from '../../../common/dao/mysql/PayInfo.mysql.dao';
import  PlayerManagerDao from '../../../common/dao/daoManager/Player.manager';
import  GameRecordMysqlDao from '../../../common/dao/mysql/GameRecord.mysql.dao';
import langsrv = require('../../../services/common/langsrv');
import GameRechargeService = require('../../../servers/hall/service/gameRechargeService');
import { betAstrict } from '../../../../config/data/gamesBetAstrict';
import { getLogger, Logger } from 'pinus-logger';
import * as msgService from "../../../services/MessageService";
const PayInfoLogger = getLogger('server_out', __filename);


export default function (app: Application) {
    return new payHandler(app);
}

export class payHandler {
    constructor(private app: Application) {
    }

    /**
     * 发起支付请求
     * @route payment.payHandler.payRequest
     * {type,price,payType,osType}
     */
    async payRequest(msg: { shopId: string, currencyType: string, type: string, payType, id: number, price: number, osType: string, sceneType: string, cardID }, session: BackendSession) {
        try {
            // const { uid } = gutils.sessionInfo(session);
            // const uid = session.uid; // 2019-05-14 网站支付不能传入完整的session
            // let language = null;
            // //验证支付类型是否可用
            // let payPlatform = JsonMgr.get('payType').datas.find(m => m.id == msg.id);
            // if (!payPlatform) {
            //     PayInfoLogger.warn(`支付类型错误id:${msg.id}`);
            //     payPlatform = JsonMgr.get('payType').datas.find(m => m.type == msg.type && m.buyId == payType);
            //     // return {code: 500, error: '支付类型错误'});
            // }
            //
            // //在数据库验证支付是否打开
            // const pay_type = MongoManager.pay_type;
            // const curr_pay = await pay_type.findOne({ id: payPlatform.id });
            // if (!curr_pay) {
            //     PayInfoLogger.warn(`支付方式未开放curr_pay:${curr_pay}payPlatform:${JSON.stringify(payPlatform)}`);
            //     return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_108)};
            // }
            //
            // if (!curr_pay.isOpen) {
            //     return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_109)};
            // }
            //
            // //获取商品信息
            // const system_shop_gold = MongoManager.system_shop_gold;
            // const shop = await system_shop_gold.findOne({ id: msg.shopId });
            // if (!shop) {
            //     return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_14)};
            // }
            //
            // const price = shop.price || msg.price;//支付金额
            // const type = payPlatform.type || msg.type;//支付类型
            // const payType = payPlatform.buyId || msg.payType;//支付方式
            // // const shanghu = payPlatform.shanghu || '未知商户';
            // const selfName = payPlatform.selfName || '未知方式';
            //
            // //支付基本参数
            // let data = {
            //     payPrice: price,//付款金额(基本参数)
            //     payType: payType,//扫码类型(基本参数)
            //     type: type,//支付类型(基本参数)
            //     shanghu: curr_pay.shanghu,//商户类型(基本参数)
            //     selfName: selfName,//支付类型(基本参数)
            //     aisleId: msg.id,//通道id
            //     serverName: JsonMgr.get('noteTemplate').datas.find(serverConfig => serverConfig.status).serverName,
            //     field1: null,
            //     sceneType: null,
            //     osType: null,
            //     productName: null,
            //     path: null,
            //     uuid: null,
            //     accNo: null
            // }
            //
            // let httpData: any = {
            //     parameter: data,//http请求参数
            //     domainName: serverConfig.payServer.domainName,//http请求域名
            //     port: serverConfig.payServer.port,//htt请求端口
            //     path: null,
            //     isJson: null
            // }
            //
            // switch (type) {
            //     //重庆菜豆网络快一付支付渠道
            //     case 'SCAN_CODE'://扫码支付
            //     case 'H5'://微信H5
            //     case 'NEWH5'://支付宝H5
            //     case 'QRCODE':// 支付宝扫码 银联扫码
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[1];
            //         data.sceneType = msg.sceneType;//场景类型
            //         data.osType = msg.osType;//设备类型
            //         data.productName = msg.currencyType;//商品描述信息
            //         httpData.path = serverConfig.payServer.path[1];
            //         break;
            //     //烜洋平台
            //     case 'XYSHWEB':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[2];
            //         httpData.path = serverConfig.payServer.path[2];
            //         break;
            //     //天明
            //     case 'JX_wx':
            //     case 'JX_zfb':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[3];
            //         httpData.path = serverConfig.payServer.path[3];
            //         break;
            //     //星闪付
            //     case 'shanfto_ALIWAPPAY'://支付宝H5:ALIWAPPAY
            //     case 'shanfto_WXWAPPAY'://微信H5:WXWAPPAY
            //     case 'shanfto_ALIPAY'://支付宝扫码:ALIPAY
            //     case 'shanfto_WXPAY'://微信扫码:WXPAY
            //     case 'shanfto_CPPAY'://云闪付:CPPAY
            //     case 'shanfto_WXWAPPAYSMALL': //WXWAPPAYSMALL 微信小额H5
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[4];
            //         httpData.path = serverConfig.payServer.path[4];
            //         break;
            //     //北京
            //     case 'BEIJIN':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[5];
            //         httpData.path = serverConfig.payServer.path[5];
            //         break;
            //
            //     //天明2
            //     case 'TIANMING2_QQ':
            //     case 'TIANMING2_WEIXIN':
            //     case 'TIANMING2_JD':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[6];
            //         httpData.path = serverConfig.payServer.path[6];
            //         break;
            //
            //     //MOL充值卡
            //     case 'CASH_CARD_12CALL':
            //     case 'CASH_CARD_TRUEMONEY':
            //     case 'CASH_CARD_MOLPOINTS':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[7];
            //         httpData.path = serverConfig.payServer.path[7];
            //         break;
            //
            //     //电子钱包
            //     case 'E_WALLET_MPAY':
            //     case 'E_WALLET_LINEPAY':
            //     case 'E_WALLET_TRUEWALLET':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[7];
            //         httpData.path = serverConfig.payServer.path[7];
            //         break;
            //
            //     //斯克莱德
            //     case 'SKLD':
            //         const user = await userManager.findOneUser({ uid }, '-_id uuid');
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[8];
            //         data.uuid = user.uuid;
            //         httpData.path = serverConfig.payServer.path[8];
            //         if (!data.uuid) {
            //             return { code: 500, error: 'uuid不存在' };
            //         }
            //         break;
            //
            //     //hec钱包
            //     case 'HEC':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[9];
            //         httpData.path = serverConfig.payServer.path[9];
            //         break;
            //
            //     //柬埔寨自营（谭谭）
            //     case 'JPZZY':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[10];
            //         httpData.path = serverConfig.payServer.path[10];
            //         break;
            //
            //     //柬埔寨自营（paysApi）
            //     case 'JPZZYXZF':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[11];
            //         httpData.path = serverConfig.payServer.path[11];
            //         break;
            //
            //     //bluePay支付
            //     case 'BLUEPAY':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[12];
            //         httpData.path = serverConfig.payServer.path[12];
            //         break;
            //
            //     //MW支付(银联快捷)
            //     case 'QKAWNO':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[13];
            //         data.accNo = msg.cardID;//银联银行卡号
            //         httpData.path = serverConfig.payServer.path[13];
            //         break;
            //
            //     //多牛支付
            //     case 'DUONIU':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[14];
            //         httpData.path = serverConfig.payServer.path[14];
            //         break;
            //
            //     //bufPay支付
            //     case 'BUFPAY':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[15];
            //         httpData.path = serverConfig.payServer.path[15];
            //         break;
            //
            //     //AAA支付
            //     case 'AAA':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[17];
            //         httpData.path = serverConfig.payServer.path[17];
            //         break;
            //
            //     //棋牌支付
            //     case 'QPZF':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[18];
            //         httpData.path = serverConfig.payServer.path[18];
            //         break;
            //
            //     //宝付支付
            //     case 'BFZF':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[19];
            //         httpData.path = serverConfig.payServer.path[19];
            //         break;
            //
            //     //福会通支付支付
            //     case 'FHTZF':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[20];
            //         httpData.path = serverConfig.payServer.path[20];
            //         break;
            //
            //     //锋胜支付
            //     case 'FENGSHENG':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[22];
            //         httpData.path = serverConfig.payServer.path[22];
            //         break;
            //     case 'XUANYANG':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[23];
            //         httpData.path = serverConfig.payServer.path[23];
            //         break;
            //     case 'XINGRAN':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[24];
            //         httpData.path = serverConfig.payServer.path[24];
            //         break;
            //     case 'CAIFU':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[25];
            //         httpData.path = serverConfig.payServer.path[25];
            //         break;
            //     case 'YIYOU':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[27];
            //         httpData.path = serverConfig.payServer.path[27];
            //         break;
            //     case 'YUNFU':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[28];
            //         httpData.path = serverConfig.payServer.path[28];
            //         break;
            //     case 'SYB':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[29];
            //         httpData.path = serverConfig.payServer.path[29];
            //         break;
            //     case 'HUAFU':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[30];
            //         httpData.path = serverConfig.payServer.path[30];
            //         break;
            //     case 'HAITIAN':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[31];
            //         httpData.path = serverConfig.payServer.path[31];
            //         break;
            //     case 'GUAGUA':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[33];
            //         httpData.path = serverConfig.payServer.path[33];
            //         break;
            //     case 'YUFUBAO':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[34];
            //         httpData.path = serverConfig.payServer.path[34];
            //         break;
            //     case 'SFT':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[35];
            //         httpData.path = serverConfig.payServer.path[35];
            //         break;
            //     case 'YUNWEI':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[36];
            //         httpData.path = serverConfig.payServer.path[36];
            //         break;
            //     case 'YOUXUAN':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[37];
            //         httpData.path = serverConfig.payServer.path[37];
            //         break;
            //     case 'BAOFUALiPAY':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[38];
            //         httpData.path = serverConfig.payServer.path[38];
            //         break;
            //     case 'JUBAOFU':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[39];
            //         httpData.path = serverConfig.payServer.path[39];
            //         break;
            //     case 'DIANYUANTONG':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[40];
            //         httpData.path = serverConfig.payServer.path[40];
            //         break;
            //     case 'QUANSU':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[41];
            //         httpData.path = serverConfig.payServer.path[41];
            //         break;
            //     case 'JUHUI':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[42];
            //         httpData.path = serverConfig.payServer.path[42];
            //         break;
            //     case 'YIXIN':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[43];
            //         httpData.path = serverConfig.payServer.path[43];
            //         break;
            //     case 'JIEFUTONG':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[44];
            //         httpData.path = serverConfig.payServer.path[44];
            //         break;
            //     case 'TIANCHENG':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[45];
            //         httpData.path = serverConfig.payServer.path[45];
            //         break;
            //     case 'MANGGUO':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[46];
            //         httpData.path = serverConfig.payServer.path[46];
            //         break;
            //     case 'SCAN_FAST':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[47];
            //         httpData.path = serverConfig.payServer.path[47];
            //         break;
            //     case 'LUFUBAO':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[48];
            //         httpData.path = serverConfig.payServer.path[48];
            //         break;
            //     case 'XINSU':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[49];
            //         httpData.path = serverConfig.payServer.path[49];
            //         break;
            //     case 'HJ666':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[50];
            //         httpData.path = serverConfig.payServer.path[50];
            //         break;
            //     case 'BJYZF':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[51];
            //         httpData.path = serverConfig.payServer.path[51];
            //         break;
            //     case 'DSJF':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[52];
            //         httpData.path = serverConfig.payServer.path[52];
            //         break;
            //     case 'ZYZF':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[53];
            //         httpData.path = serverConfig.payServer.path[53];
            //         break;
            //     case 'otc_alipay':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[54];
            //         httpData.path = serverConfig.payServer.path[54];
            //         break;
            //     case 'otc_wechat':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[55];
            //         httpData.path = serverConfig.payServer.path[55];
            //         break;
            //     case 'sands_dyt_alipay':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[56];
            //         httpData.path = serverConfig.payServer.path[56];
            //         break;
            //     case 'sands_dyt_unionpay':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[57];
            //         httpData.path = serverConfig.payServer.path[57];
            //         break;
            //     case 'sands_cheng_unionpay':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[58];
            //         httpData.path = serverConfig.payServer.path[58];
            //         break;
            //     case 'sands_cheng_alipay':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[59];
            //         httpData.path = serverConfig.payServer.path[59];
            //         break;
            //     case 'sands_ylf_alipay':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[60];
            //         httpData.path = serverConfig.payServer.path[60];
            //         break;
            //     case 'sands_ylf_wechat':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[60];
            //         httpData.path = serverConfig.payServer.path[60];
            //         break;
            //     case 'sands_ylf_unionpay':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[60];
            //         httpData.path = serverConfig.payServer.path[61];
            //         break;
            //     case "sands_hkf_alipay":
            //     case "sands_hkf_wechat":
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[62];
            //         httpData.path = serverConfig.payServer.path[62];
            //         break;
            //     case "sands_aj_alipay":
            //     case "sands_aj_wechat":
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[63];
            //         httpData.path = serverConfig.payServer.path[63];
            //         break;
            //     case "sands_thb_wechat":
            //     case "sands_thb_alipay":
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[64];
            //         httpData.path = serverConfig.payServer.path[64];
            //         break;
            //     case "sands_xlz_alipay":
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[65];
            //         httpData.path = serverConfig.payServer.path[65];
            //         break;
            //     case "sands_Spark_wechat":
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[66];
            //         httpData.path = serverConfig.payServer.path[66];
            //         break;
            //     case "sands_Itzoon_alipay":
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[67];
            //         httpData.path = serverConfig.payServer.path[67];
            //         break;
            //     case "sands_xlz_alipay":
            //     case "sands_xlz_wechat":
            //     case "sands_xlz_bank":
            //     case "sands_xlz_bankH5":
            //     case "sands_xlz_bankScan":
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[68];
            //         httpData.path = serverConfig.payServer.path[68];
            //         break;
            //     case 'common_y':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[69];
            //         httpData.path = serverConfig.payServer.path[69];
            //         break;
            //     case 'common_jf':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[70];
            //         httpData.path = serverConfig.payServer.path[70];
            //         break;
            //     case 'common_xk':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[71];
            //         httpData.path = serverConfig.payServer.path[71];
            //         break;
            //     case 'payment_js_alipay':
            //     case 'payment_js_wechatpay':
            //     case 'payment_js_cloudqr':
            //         data.field1 = msg.currencyType + '-' + uid + '-' + serverConfig.payServer.path[72];
            //         httpData.path = serverConfig.payServer.path[72];
            //         break;
            //     default:
            //         return { code: 500, error: `支付方式错误${type}` };
            // }
            // PayInfoLogger.info('发起支付请求', httpData);
            // // 发送支付请求
            // let res = await payUtil.httpPostSendJson(httpData);
            // const { code, data: resultData, msg: resultMsg } = res;
            // if (code !== 200) {
            //     PayInfoLogger.warn(`发起支付请求|支付服务回馈信息异常|code:${code}|data:${resultData ? resultData : ''}|msg:${resultMsg}`);
            //     return { code: 500, error: '支付繁忙，稍后在试' };
            // }
            // // 插入订单
            // const pay_order = MongoManager.pay_order;
            // const { orderNumber } = resultData;
            // // util.id()
            // // utils.id()
            // if (orderNumber) {
            //     const orderData = {
            //         orderNumber,
            //         aisleId: msg.id,
            //         time: Date.now(),
            //         uid: uid,
            //         money: price,
            //         platform: selfName,
            //         payType: curr_pay.name,
            //         status: 0,
            //         field1: msg.currencyType + '-' + uid,
            //         shopId: msg.shopId
            //     }
            //     await pay_order.create(orderData);
            // }

            return {
                code: 200,
                payURL: '',
                downLoadURL:  '',
                orderNumber: null
            };
        } catch (error) {
            PayInfoLogger.error('hall.payHandler.payRequest==>', error);
            return { code: 500, error: '支付繁忙，稍后在试' };
        }
    }

    /**
     * 绑定或者修改银行卡和支付宝绑定
     * @param bankCardNo  银行卡号
     * @param bankCardName  哪个银行卡
     * @param bankName      卡号户名
     * @param bankAddress      卡号户名
     * @param  payment.payHandler.bingBankAndPayTreasure { bankCardNo, bankCardName, bankName ,bankAddress}
     * return { code: 200, bank: bank }
     * bank = {
             bankCardNo: bankCardNo,
            bankCardName: bankCardName,
            bankName: bankName,
     * }
     */
    bingBankAndPayTreasure = async function ({ bankCardNo, bankCardName, bankName, bankAddress }, session: BackendSession) {
        try {
            const uid = session.uid;
            // const bank = await TixianManagerService.bingBankAndPayTreasure(uid, bankCardNo, bankCardName, bankName, bankAddress);
            return { code: 200, bank: '' }
        } catch (error) {
            console.warn('hall.payHandler.bingBankAndPayTreasure', error);
            return { code: 500, error: error }
        }

    }

    /**
     *  提现请求
     * @param session
     * type == 0 为检测是否是流水通过  会返回501 ,如果要强制提现传type =1
     * type  == 1 则为流水不够是否需要强制提现
     * payment.payHandler.addTixianMoneyRecord {  type, getMoney }
     * return { code: 200  , msg , money ,gold }
     */
    addTixianMoneyRecord = async function ({ type, getMoney }, session: BackendSession) {
        try {
            const { uid } = session;
            // const { msg, money, gold }: any = await TixianManagerService.addTixianMoneyRecord(uid, type, getMoney);
            return { code: 200, msg:'', money:0, gold:0 };
        } catch (error) {
            if (error.code && error.code == 501) {
                return error;
            }
            return { code: 500, error }
        }
    }

    /**
     *  获取可以提现的金额 (单位 元)以及银行卡信息
     *  payment.payHandler.getPlayerTixianMoneyAndBank { }
     *  return { code: 200  ,bank , money }
     * @param session
     */
    async getPlayerTixianMoneyAndBank({ }, session: BackendSession) {
        try {
            const uid = session.uid;
            // const { player } = await PlayerManager.getPlayer({ uid }, false);
            // if (player && !player.cellPhone) {
            //     return { code: 501, error: '请绑定手机号在进行兑换' }
            // }
            // const { bank, money, targetChips, betFlow } = await TixianManagerService.getPlayerTixianMoneyAndBank(uid);
            return { code: 200, bank:'', money:0, targetChips:'', betFlow:0 }
        } catch (error) {
            console.error('hall.payHandler.getBankAndPayTreasure', error);
            return { code: 500, error }
        }
    }


    /**
     *  获取玩家最近20条的记录
     *  payment.payHandler.getPlayerTixianRecord { }
     *  return { }
     * @param session
     */
    async getPlayerTixianRecord({ }, session: BackendSession) {
        try {
            const uid = session.uid;
            // const list = await TixianManagerService.getPlayerTixianRecord(uid);
            return { code: 200, list :[] }
        } catch (error) {
            console.error('hall.payHandler.getBankAndPayTreasure', error);
            return { code: 500, error }
        }
    }


    //获取充值数据
    async getPayOrder({ orderId }, session: BackendSession) {
        try {
            // 获取当前用户uid
            const uid = session.uid;
            //
            const orderDataList = await PayInfoMysqlDao.findList({ uid: uid, isUpdateGold: false });
            //
            if (!orderId && !orderDataList.length) {
                return { code: 500, msg: '订单号不应该为空' };
            }
            // // 查询是否有未做更新的支付记录
            //
            if (!orderDataList.length)
                return { code: 200, surplusOrder: orderDataList.length };
            // /** 额外增添金币 测试函数 START */
            // if (orderId) {
            //
            //     const orderCheckFlag = await getObjectFromRedis(`payInfo:${orderId}`);
            //
            //     if (!orderCheckFlag) {
            //         await setObjectIntoRedisHasExpiration(`payInfo:${orderId}`, { orderId, updateFlag: false }, 30);
            //         return { code: 500, surplusOrder: 1 };
            //     }
            //
            //     const { updateFlag } = orderCheckFlag;
            //     if (updateFlag) {
            //         return { code: 500, surplusOrder: 0 };
            //     }
            //
            //     await setObjectIntoRedisHasExpiration(`payInfo:${orderId}`, { orderId, updateFlag: true }, 30)
            //
            // }
            // /** 额外增添金币 测试函数 END */
            // let allOrder = orderDataList.length;
            //
            // // 查出相同订单
            const orderData: any = orderDataList.reduce((orderData, orderInfo) => {
                if (!orderId) {
                    return orderInfo;
                }
                if (orderInfo.orderNumber === orderId) {
                    orderData = orderInfo;
                }
                return orderData;
            }, {});
            //
            // const orderNum: any = PayInfoMysqlDao.findOne({ orderNumber: orderData[0].orderNumber });
            // const isExist = await HallService.isExistOrder(orderData.id);
            // //如果时间间隔太短
            // if (!isExist) {
            //     PayInfoLogger.info(`请求充值订单异常${isExist}|order:${orderData[0].id}|uid:${uid}`);
            //     return { code: 500, error: '请求充值订单异常' }
            // }
            //
            if(!orderData){
                return;
            }
            //如果有订单获取玩家信息给玩家添加金币
            // const { player, lock } = await PlayerManagerDao.getPlayer({ uid }, true);
            const player = await PlayerManagerDao.findOne({uid});
            if(!player){
                return ;
            }
            let orderArr = await updateOrderGold([orderData], player);
            // await PlayerManager.updateOnePlayer(player, ['gold'], lock);
            await PlayerManagerDao.updateOne({uid:uid },{gold: player.gold })
            //
            // //金币改变流水
            // const info1 = {
            //     uid: player.uid,
            //     nickname: player.nickname,  //玩家昵称
            //     nid: HallConst.GAME_RECORD_TYPE.PAY,      //充值nid的标码
            //     winType: '充值', //中奖类型
            //     gname: '充值',    //游戏名称
            //     createTime: Date.now(),  //时间错
            //     input: 0,    //押注金额
            //     win: 0,        //中奖金额
            //     multiple: 0,
            //     profit: orderArr[0].gold,     //利润
            //     gold: utils.sum(player.gold, true),
            //     playStatus: 1,
            // };
            //
            // await GameRecord.create(info1);
            //
            //通知游戏内充值  以前的逻辑
            // await GameRechargeService.noticeGameRecharge(player.uid);
            /**
             * 添加金币
             */
            let sid = player.sid;
            let msgUserIds = { uid: player.uid, sid: sid };
            msgService.pushMessageByUids('updateGold', { //充值成功过后，对玩家的金币进行增加
                gold: player.gold, //显示的金币
                walletGold: player.walletGold, //钱包金币
            }, [msgUserIds]);
            // //更新需要通知的玩家状态
            return { code: 200, allOrder: [], gold: 0, surplusOrder: 0, isSuccess: true }
        } catch (error) {
            console.log('getPayOrder==>', error);
            return { code: 500, error: '获取充值数据失败' }
        }
    }

}

//跟新玩家金币
function updateOrderGold(orderData, player) {
    const orderArr = [];
    return new Promise((resolve, reject) => {
        Promise.all(orderData.map(async (order) => {
            try {
                const currGold = player.gold;
                PayInfoLogger.info(`充值前`, player.gold);
                player.gold += order.addgold;
                let remark = langsrv.getlanguage(player.language, langsrv.Net_Message.id_80, order.addgold / betAstrict.ratio);
                const orderData = {
                    gold: order.addgold,
                    rmb: order.total_fee, //充值的人名币
                    remark: remark,
                    orderNum: order.id
                };
                orderArr.push(orderData);
                PayInfoLogger.info(`充值后`, player.gold);
                //更新订单状态
                await PayInfoMysqlDao.updateOne({ id: order.id }, {
                        gold: currGold,
                        isUpdateGold: true,
                        lastGold: player.gold
                });
            } catch (error) {
                return reject(error);
            }
        })).then(data => {
            return resolve(orderArr);
        })

    });
}
