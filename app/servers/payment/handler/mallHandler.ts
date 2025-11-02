import { Application, BackendSession, Logger } from 'pinus';
import { getLogger } from 'pinus-logger';
import PlayerManager from '../../../common/dao/daoManager/Player.manager';
import MallService from "../../../services/hall/mallHandler/mallService";
import * as langsrv from "../../../services/common/langsrv";
import PayOrderMysqlDao from '../../../common/dao/mysql/PayOrder.mysql.dao';
import * as moment from "moment";
import LogTelegramCustomerRecordMysqlDao from '../../../common/dao/mysql/LogTelegramCustomerRecord.mysql.dao';
import TelegramCustomerMysqlDao from '../../../common/dao/mysql/TelegramCustomer.mysql.dao';

export default function (app: Application) {
    return new mallHandler(app);
}
/**
 * 原生充值自动匹配充值通道
 * @description 商城支付改版
 * @date 2019年10月23日
 */
export class mallHandler {

    logger: Logger;
    preLoggerStr: String;

    mallService: MallService;

    constructor(private app: Application) {
        this.app = app;
        this.preLoggerStr = `商城 | handler | `;
        this.logger = getLogger('server_out', __filename);
        this.mallService = new MallService();
    }

    /**
     * 获取所有的支付方式
     * @return <Object<{code:number,data:Array|Object,msg:string,}>>
     * @description 屏左侧“支付方式”和右侧“金额”商品
     */
    async getAllPayMethodAndGoldItemInfo(_, session: BackendSession) {
        const { uid } = session;
        const player = await PlayerManager.findOne({ uid }, false);
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
                const {
                    itemInfo,
                    payMethodId,
                    channelId,
                    methodName_en
                } = info;

                // 商品信息
                itemInfo.forEach(i => {
                    const { goodsId } = i;
                    if (!res.goodsList.find(goodInfo => goodInfo.goodsId === goodsId)) {
                        res.goodsList.push(i);
                    }
                });

                // 支付信息
                if (!res.paymentList.find(paymentInfo => paymentInfo.payMethodId === payMethodId)) {
                    res.paymentList.push({ payMethodId, methodName_en, channelId });
                }

                return res;
            }, { goodsList: [], paymentList: [] })

            //获取客服充值
            // const { isOpenCustomerPay: isOpenVIPPay, customerText } = await GetDataService.getSystemConfig();

            // let VIPPayList = [];
            // if (isOpenVIPPay) {
            //     VIPPayList = await this.mallService.getVIPCustomerList();
            /*
            const customerPayInfo = await GetDataService.getCustomerPayInfo();
            console.log(`获取客服信息`);
            console.log(`${JSON.stringify(customerPayInfo, null, 2)}`);
            if (customerPayInfo.length !== 0) {
                customerPayInfoList = customerPayInfo.filter(x => x.isOpen == true);
                customerPayInfoList.sort((a, b) => a.NumOrder - b.NumOrder);
            }
            */
            // }
            this.logger.info(`${this.preLoggerStr} 用户:${uid} | 获取支付方式和商品信息正常 | ${data.length} 条支付方式 `);

            const telegramCustomer: any = { name: "Contate-Nos" };

            const { total } = await LogTelegramCustomerRecordMysqlDao.getCountTotal();

            if (total > 0) {
                const list = await LogTelegramCustomerRecordMysqlDao.getCountForEveryCustomer();
                if (list.length > 0) {
                    const l = list.map(info => {
                        const { count, ...rest } = info;
                        // 总占比
                        const totalPercentage = count / total;
                        return { totalPercentage, ...rest };
                    }).sort((x, y) => x.totalPercentage - y.totalPercentage);

                    const {
                        id,
                        nickname,
                        url,
                    } = l[0];

                    telegramCustomer.phone = nickname;
                    telegramCustomer.url = url;
                    telegramCustomer.customerId = id;
                }
            }
            /**
             * 情况：1 首次，没有客服记录；
             * 情况：2 有客服记录，但是旧客服status=0，选用新的；
             */
            if (!telegramCustomer.hasOwnProperty("phone")) {
                const customer = await TelegramCustomerMysqlDao.findOne({ status: 1 });
                if (customer) {
                    const {
                        id,
                        nickname,
                        url,
                    } = customer;

                    telegramCustomer.phone = nickname;
                    telegramCustomer.url = url;
                    telegramCustomer.customerId = id;

                }
            }

            return {
                code: 200,
                data: {
                    customerPayInfo: [telegramCustomer],
                    ...result
                },

                // data: {
                // VIPPay: {
                //     isOpenVIPPay,
                //     customerText,
                //     VIPPayList,
                // },
                // isOpenCustomerPay,
                // customerText,
                // customerPayInfo: customerPayInfoList,
                //     paymentList: data
                // },
                msg: 'SUCCESS'
            };
        } catch (e) {
            this.logger.error(`${this.preLoggerStr} 用户:${uid} | 向支付服务器获取支付方式和商品信息失败`);
            return { code: 500, data: [], error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_106) };
        }

    }

    async chooseCustomer(customerType: number = 1, customerId: number, session: BackendSession) {
        if (customerType === 1) {
            await LogTelegramCustomerRecordMysqlDao.insertOne({ fk_telegramCustomer_id: customerId });
        }

        return {
            code: 200,
            data: null,
            msg: 'SUCCESS'
        };
    }

    /**
     * 选择商品并打开支付页面
     * @param {string|null} goodsId 商品编号
     * @param {string} payMethodId 支付方式编号
     * @param {string} amount 金额(元)
     * @param {'phone'|'PC'} osType client类型
     * @description
     */
    async chooseGoldItemAndForwardPayWeb({ goodsId = null, payMethodId, amount, osType }, session: BackendSession) {
        const { uid } = session;
        const player = await PlayerManager.findOne({ uid }, false);
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
                // return resultData;
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
                    platform: accountName,// 支付通道名称
                    payType: payTypeName,
                    status: 0,
                    field1: `gold-${uid}`,
                    shopId: `${goodsId}`
                }

                await PayOrderMysqlDao.insertOne(orderData);

                // await payOrderDao.create(orderData);
            }

            return {
                code: 200,
                data,
                msg: '操作成功'
            };
        } catch (e) {
            this.logger.info(`${this.preLoggerStr} 获取支付页面| 用户:${uid} 金额:${amount} 客户端类型:${osType} | 出错 | ${e.stack}  `);
            return {
                code: 500,
                data: [],
                msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_107)
            };
        }

        // Step 1:商品定额支付 或是 判断自定义金额支付
        // switch (payMethod) {
        //     case 1:// 商品定额支付
        //         const payTypeId = await this.mallService.findOnePayMethodFromMallDailyGoldOrderByParams(payMethodId);

        //         if (payTypeId < 0) return { code: 200, data: [] };

        //         break;
        //     case 2:// 自定义金额
        //         // 判断金额区间
        //         break;
        //     default:
        //         return { code: 500, msg: '参数错误，payMethod应为number类型' };
        // }
        // Step 2:向支付服务申请支付地址
        // await this.mallService.checkOrder(1);
        // Step 3:用户自定义金额支付
        // Step 3.1:判断金额区间是否匹配
        // return {};
    }

    /**
     * 
     * @param pageSize 
     * @param session 
     */
    async paymentOrderList({ startPage }, session: BackendSession) {
        const { uid } = session;
        const player = await PlayerManager.findOne({ uid });
        try {

            const { list } = await PayOrderMysqlDao.findListToLimitByUid(uid, startPage, 10);

            const data = list.reduce((res, info) => {
                const {
                    orderNumber,
                    money,
                    status,
                    createDate
                } = info;

                res.push({
                    orderNumber,
                    amount: money,
                    status,
                    dataTime: moment(createDate).format("YYYY-MM-DD hh:mm:ss")
                })

                return res;
            }, [])

            return {
                code: 200,
                data,
                msg: '操作成功'
            };
        } catch (e) {
            return {
                code: 500,
                data: [],
                msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_107)
            };
        }
    }
}
