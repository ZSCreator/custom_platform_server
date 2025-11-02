import { Injectable, Logger } from '@nestjs/common';
import { getLogger } from "pinus-logger";
import PlayerManagerDao from "../../../../../../common/dao/daoManager/Player.manager";
import PayInfoMysqlDao from "../../../../../../common/dao/mysql/PayInfo.mysql.dao";
import OnlinePlayerRedisDao from "../../../../../../common/dao/redis/OnlinePlayer.redis.dao";
import DeductMoneyMysqlDao from "../../../../../../common/dao/mysql/DeductMoney.mysql.dao";
import * as Utils from "../../../../../../utils/index";
import order_info = require('../../../../../../pojo/order_gold/order');
import { MailTypeEnum } from "../../../../../../common/constant/hall/MailEnum";
import * as MailService from "../../../../../../services/MailService";
import { PositionEnum } from "../../../../../../common/constant/player/PositionEnum";
import * as utils from "../../../../../../utils";
import * as msgService from "../../../../../../services/MessageService";
import { HttpCode } from '../../../support/code/HttpCode.enum';
import { ApiResult } from '../../../../../../common/pojo/ApiResult';
import * as moment from "moment";
import PayOrderMysqlDao from '../../../../../../common/dao/mysql/PayOrder.mysql.dao';

const ManagerErrorLogger = getLogger('http', __filename);

@Injectable()
export class PayService {
    /**
     * 会员充值
     */
    async customerPayToPlayer(uid: string, orderPrice: number, bonus: number, chips: number, remark: string, ip: string, userName: string, beSendEmail: boolean, emailContent: string): Promise<ApiResult | boolean> {
        try {

            // const manager = await manager_info.findOne({ userName });
            if (!userName) {
                Logger.warn(`后台管理 | 会员相关 | 会员充值接口 | 未查询到管理员: ${userName} 的信息`);
                return new ApiResult(HttpCode.Not_Find_ManagerInfo, null, "未查询到管理员信息");
            }

            /**
             * 新增彩金 bonus
             * 码量 chips
             */
            // if (bonus >= 0 && chips >= 0) {
            //     const { player, lock } = await PlayerManager.getPlayer({ uid }, true);
            //     // player.totalBonus = (player.totalBonus ? player.totalBonus : 0) + bonus;
            //     /**
            //      * 补充逻辑
            //      * 客服充值，防止刷钱；在去掉充值金额为0限制的同时；补充打码量小于彩金，则强制为3倍彩金码量
            //      */
            //     // player.lastChips = (player.lastChips ? player.lastChips : 0) + (data.orderPrice === 0 && chips < bonus ? bonus * 3 : chips);
            //
            //     await PlayerManager.updateOnePlayer(player, ["totalBonus", "lastChips"], lock);
            // }

            /** 新增END */
            let list: order_info.Customer_recharge = {};
            list.orderPrice = orderPrice;  //充值金额
            list.field1 = `gold-${uid}`;
            list.remark = '客服充值' + '---' + remark;  //充值方式
            list.customerId = userName;  //客服ID
            list.customerIp = ip;  //客服ip
            list.orderNumber = Utils.id();

            /**
             * 是否发送邮件通知
             */
            // if (beSendEmail) {
            //     const opts = {
            //         name: `客服充值`,
            //         content: emailContent,
            //         sender: `客服`,
            //         type: MailTypeEnum.customer
            //
            //     };
            //
            //     await MailService.generatorMail(opts, uid);
            // }
            // let { code, error } = await PayBackService.mallCallbackFromHttp((list as any), bonus ? bonus : 0);
            // if (code !== 200) {
            //     Logger.warn(`后台管理 | 会员相关 | 会员充值接口 | 充值失败`);
            //     return new ApiResult(HttpCode.Recharge_Failure, null, "充值失败");
            // }
            const player = await PlayerManagerDao.findOne({ uid });
            if (!player) {
                return ApiResult.ERROR(null, "玩家不存在");
            }
            let gold = orderPrice * 100;
            let withdrawalChips = 0;
            if (player.withdrawalChips >= 0) {
                withdrawalChips = Math.floor(player.withdrawalChips + gold);
            } else if (player.withdrawalChips < 0) {
                withdrawalChips = Math.floor(gold);
            }

            await PlayerManagerDao.updateOneForaddPlayerMoney(player.uid, {
                gold: gold,
                withdrawalChips: withdrawalChips,
                oneAddRmb: Math.floor(player.oneAddRmb + gold),
                addRmb: Math.floor(player.addRmb + gold),
                addDayRmb: Math.floor(player.addDayRmb + gold)

            });
            const payInfoParameter = {
                orderNumber: Utils.id(),
                attach: 'gold',
                customerId: userName,
                total_fee: Math.ceil(orderPrice * 100),
                remark: remark,
                uid,
                addgold: Math.ceil(orderPrice * 100) + (bonus ? bonus * 100 : 0),         // 获得金豆uid
                isUpdateGold: true,                    // 前端收到通知是否更新
                gold: player.gold,
                lastGold: Math.ceil(player.gold + gold),                            // 最后玩家身上的金币
                bonus: bonus * 100
            };

            await PayInfoMysqlDao.insertOne(payInfoParameter);
            /**
             * 给前端发送通知
             */
            const online = await OnlinePlayerRedisDao.findOne({ uid: player.uid });
            if (!online) {
                return;
            }
            let msgUserIds = { uid: player.uid, sid: player.sid };
            msgService.pushMessageByUids('updateGold', { //充值成功过后，对玩家的金币进行增加
                gold: Math.floor(player.gold + gold), //显示的金币
                walletGold: Math.floor(player.walletGold), //钱包金币
            }, [msgUserIds]);

            return true;
        } catch (error) {
            Logger.warn(`后台管理 | 会员相关 | 会员充值接口 | 充值出错: ${error.stack || error}`);
            return ApiResult.ERROR(null, "充值出错");
        }
    }



    /**
     * 充值记录
     */
    async getPayInfo(page: number, uid: string, startTime: string = moment().format("YYYY-MM-01 00:00:00"), endTime: string = moment().format("YYYY-MM-DD 23:59:59"), remark: string, pageSize: number): Promise<any> {
        try {
            console.warn(uid);
            console.warn(startTime);
            console.warn(endTime);
            //充值列表的结果集
            let resultList = [];
            let countRes = 0
            if (uid) {
                const { list, count } = await PayInfoMysqlDao.findListToLimitByUid(uid, page, pageSize, startTime, endTime);
                countRes = count;
                if (list.length > 0)
                    for (let item of list) {
                        const info = {
                            customerId: item.customerId,
                            gold: item.gold,
                            id: item.id,
                            isUpdateGold: item.isUpdateGold,
                            lastGold: item.lastGold,
                            nickname: item.nickname,
                            remark: item.remark,
                            time: item.time,
                            total_fee: item.total_fee,
                            uid: item.uid,
                            updateTime: item.updateTime,
                            superior: '',
                            priceToGold: item.addgold - (item.bonus ? item.bonus : 0),
                            bonus: item.bonus ? item.bonus : 0,
                            addgold: item.addgold,
                            createDate: item.createDate,
                            orderNumber: item.orderNumber
                        };
                        resultList.push(info);
                    }
            } else {
                const { list, count } = await PayInfoMysqlDao.findListToLimit(page, pageSize, startTime, endTime);
                countRes = count;
                if (list.length > 0)
                    for (let item of list) {
                        const info = {
                            customerId: item.customerId,
                            gold: item.gold,
                            id: item.id,
                            isUpdateGold: item.isUpdateGold,
                            lastGold: item.lastGold,
                            nickname: item.nickname,
                            remark: item.remark,
                            time: item.time,
                            total_fee: item.total_fee,
                            uid: item.uid,
                            updateTime: item.updateTime,
                            superior: '',
                            priceToGold: item.addgold - (item.bonus ? item.bonus : 0),
                            bonus: item.bonus ? item.bonus : 0,
                            addgold: item.addgold,
                            createDate: item.createDate,
                            orderNumber: item.orderNumber
                        };
                        resultList.push(info);
                    }
            }

            return { pays: resultList, allPaysLength: countRes, allPayMoneys: 0 }

        } catch (e) {
            console.error(`后台管理 | 会员相关 | 充值记录 | 查询玩家:${uid} 的充值记录出错: ${e.stack || e}`);

            return ApiResult.ERROR(null, "查询充值记录出错");
        }
    }

    /**
     * 支付类型列表
     */
    async getPayType(page: number, pageSize: number): Promise<any> {
        try {

            let start = 0, count = pageSize;

            if (page) {
                start = count * (page - 1);
            }
            // const [list, length] = await Promise.all([
            //     payType.find({}).sort({ sort: 1 }).skip(start).limit(count),
            //     payType.countDocuments(),
            // ])
            return { list: [], length: 0 };
        } catch (error) {
            Logger.error(`后台管理 | 会员相关 | 支付类型列表 | 查询出错: ${error.stack || error}`);

            return Promise.reject("获取失败");
        }
    }

    /**
     * 支付订单详情列表
     */
    async getPayOrder(page: number, pageSize: number): Promise<any> {
        try {

            const { list, count: c } = await PayOrderMysqlDao.findListToLimit(page, pageSize);

            return { list, length: c };
        } catch (error) {
            Logger.error(`后台管理 | 会员相关 | 支付订单详情列表 | 查询出错: ${error.stack || error}`);

            return Promise.reject("获取失败");
        }
    }

    /**
     * 添加支付列表
     * @param money   支付列表
     */
    async createPayType(name: string, isOpen: Boolean, shanghu: string, rate: number, url: string, callBackDelay: number, remark: string, icon: string, sort: number): Promise<any> {
        try {
            const info = {
                name: name,
                isOpen: isOpen,
                shanghu: shanghu,
                rate: rate,
                callBackDelay: callBackDelay,
                url: url,
                remark: remark,
                icon: icon,
                sort: sort,
            };
            // await payType.create(info);
            return true;
        } catch (error) {
            Logger.log(`后台管理 | 会员相关 | 支付类型列表 | 新增支付类型 name: ${name} , shanghu: ${shanghu} , rate: ${rate} | 出错${error.stack || error}`);

            return Promise.reject("添加支付");
        }
    }

    /**
     * 改变支付列表
     * @param money   支付列表
     */
    async changePayType(_id: string, name: string, isOpen: Boolean, shanghu: string, rate: number, url: string, callBackDelay: number, remark: string, icon: string, sort: number): Promise<ApiResult | boolean> {
        try {
            // const pay_ = payType.findOne({ _id });

            // if (!pay_) {
            //     Logger.warn(`后台管理 | 会员相关 | 支付类型列表 | 修改 ${name} 支付类型异常: 该支付信息不存在`);
            //     return new ApiResult(HttpCode.PayType_Not_Find, null, "该支付信息不存在");
            // }

            const filed = {
                name: name,
                isOpen: isOpen,
                shanghu: shanghu,
                rate: rate,
                callBackDelay: callBackDelay,
                url: url,
                remark: remark,
                icon: icon,
                sort: sort,
            };

            // await payType.updateOne({ _id }, { $set: filed });

            return true;
        } catch (e) {
            Logger.log(`后台管理 | 会员相关 | 支付类型列表 | 修改 ${name} 支付类型出错: ${e.stack || e} `);
            return ApiResult.ERROR(null, "修改出错");
        }
    }

    /**
     * 客服扣款
     * @param money   支付列表
     */
    async reducePlayerGold(uid: string, walletGold: number, orderPrice: number, emailContent: string, beSendEmail: boolean, userName: string): Promise<ApiResult | boolean> {
        try {
            if (!userName) {
                Logger.warn(`后台管理 | 会员相关 | 会员扣款接口 | 扣款失败: 该管理员不存在: ${userName}`);
                return new ApiResult(HttpCode.Not_Find_ManagerInfo, null, "该管理员不存在");
            }
            const player = await PlayerManagerDao.findOne({ uid });
            if (!player) {
                Logger.warn(`后台管理 | 会员相关 | 会员扣款接口 | 扣款失败: 未查询到玩家信息: ${uid}`);
                return new ApiResult(HttpCode.Not_Find_PlayerInfo, null, "未查询到玩家信息");
            }

            if (player.position === PositionEnum.GAME) {
                return new ApiResult(HttpCode.Player_Is_Gaming, null, "正在对局中不能扣款");
            }

            const gold = orderPrice * 100;
            const walletGoldToGold = walletGold * 100;
            if (player.walletGold + walletGoldToGold < 0) {
                Logger.warn(`后台管理 | 会员相关 | 会员扣款接口 | 扣款失败: 玩家的钱包金币不足`);
                return new ApiResult(HttpCode.Player_WalletGold_Not_Enough, null, "玩家的钱包金币不足");
            }

            if (player.gold < Math.abs(gold)) {
                Logger.warn(`后台管理 | 会员相关 | 会员扣款接口 | 扣款失败: 玩家的持有金币金币不足`);
                return new ApiResult(HttpCode.Player_Gold_Not_Enough, null, "玩家的持有金币金币不足");
            }
            /**
             * 发送邮件
             */
            if (beSendEmail) {
                const opts = {
                    name: `客服${userName ? `:${userName}` : ``}扣值`,
                    content: emailContent,
                    sender: `客服`,
                    type: MailTypeEnum.customer

                };
                await MailService.generatorMail(opts, uid);
            }

            const info = {
                total_fee: gold, // 持有金额
                walletGoldToGold: walletGoldToGold, // 钱包金额
                remark: "客服扣款", //支付类型
                customerId: userName,
                uid: uid, // 玩家UID
                addgold: gold,// 获得金豆uid
                gold: player.gold, // 当前金币
                lastGold: player.gold + gold, //最后玩家身上的金币
                lastWalletGold: player.walletGold + walletGoldToGold, //最后玩家钱包的金币
            };
            player.gold -= Math.abs(gold);
            // player.walletGold = walletGoldToGold;
            //给充值玩家发送弹窗
            try {
                let sid = player.sid;
                let msgUserIds = { uid: player.uid, sid: sid };
                msgService.pushMessageByUids('updateGold', { //充值成功过后，对玩家的金币进行增加
                    gold: player.gold,//充值的金币
                    walletGold: player.walletGold, //钱包金币
                }, [msgUserIds]);
            } catch (error) {
                console.log('testAddGold', error);
            }

            // const info1 = {
            //     uid: uid,
            //     nickname: player.nickname,  //玩家昵称
            //     nid: hallConst.GAME_RECORD_TYPE.CUNSOTMER_TIXIAN,
            //     gname: '客服扣款',    //游戏名称
            //     createTime: Date.now(),  //时间错
            //     input: 0,    //押注金额
            //     win: 0,        //中奖金额
            //     multiple: 0,
            //     profit: gold,     //利润
            //     gold: utils.sum(player.gold, true),
            //     playStatus: 1,
            // };
            // await recordManager.addGameRecord(info1);
            //保存玩家信息修改18791063lastGold
            await PlayerManagerDao.updateOne({ uid }, { gold: player.gold, walletGold: player.walletGold });
            await DeductMoneyMysqlDao.insertOne(info);
            return true;
        } catch (error) {
            Logger.error(`后台管理 | 会员相关 | 会员扣款接口 | 扣款出错: ${error.stack || error}`);
            return ApiResult.ERROR(null, "扣款出错");
        }
    }

    /**
     * 通道统计
     * @param money   通道统计
     */
    async getPayOfPlatform(startTime: number, endTime: number): Promise<any> {
        try {
            // const num = Math.ceil((endTime - startTime) / TimeEnum.MailTypeEnum.ONE_DAY);
            // if (num > 30) {
            //     Logger.log(`后台管理 | 会员相关 | 通道统计 | 查询异常: 不应超过30天 | 条件 startTime:${startTime}, endTime:${endTime} `);
            //     return new ApiResult(HttpCode.No_More_Than_30_Days, null, "不能超过30天");
            // }
            // const payOrderRecords = await pay_order.find({ time: { '$gt': startTime, '$lt': endTime } }, '-_id');
            let list = [];
            // for (let item of payOrderRecords) {
            //     let info = {
            //         platform: '',
            //         money: 0,
            //         effectiveNum: 0,
            //         allPay: 0,
            //         allNum: 0,
            //     };
            //     let remark = item.platform + '-' + item.payType;
            //     let ss = list.find(x => x.platform == remark);
            //     if (ss) {
            //         if (item.status == 1) {
            //             ss.money += item.money;
            //             ss.effectiveNum += 1;
            //             ss.allPay += item.money;
            //             ss.allNum += 1;
            //         } else {
            //             ss.allPay += item.money;
            //             ss.allNum += 1;
            //         }
            //         const index = list.findIndex(x => x.platform == remark);
            //         list[index] = ss;
            //     } else {
            //         if (item.status == 1) {
            //             info.money += item.money;
            //             info.effectiveNum += 1;
            //             info.allPay += item.money;
            //             info.allNum += 1;
            //         } else {
            //             info.allPay += item.money;
            //             info.allNum += 1;
            //         }
            //         info.platform = remark;
            //         list.push(info);
            //     }
            // }
            return true;
        } catch (error) {
            ManagerErrorLogger.error(`支付列表 :${error.stack || error}`);
            return ApiResult.ERROR(null, "查询出错");
        }
    }
}

