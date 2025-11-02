"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayService = void 0;
const common_1 = require("@nestjs/common");
const pinus_logger_1 = require("pinus-logger");
const Player_manager_1 = require("../../../../../../common/dao/daoManager/Player.manager");
const PayInfo_mysql_dao_1 = require("../../../../../../common/dao/mysql/PayInfo.mysql.dao");
const OnlinePlayer_redis_dao_1 = require("../../../../../../common/dao/redis/OnlinePlayer.redis.dao");
const DeductMoney_mysql_dao_1 = require("../../../../../../common/dao/mysql/DeductMoney.mysql.dao");
const Utils = require("../../../../../../utils/index");
const MailEnum_1 = require("../../../../../../common/constant/hall/MailEnum");
const MailService = require("../../../../../../services/MailService");
const PositionEnum_1 = require("../../../../../../common/constant/player/PositionEnum");
const msgService = require("../../../../../../services/MessageService");
const HttpCode_enum_1 = require("../../../support/code/HttpCode.enum");
const ApiResult_1 = require("../../../../../../common/pojo/ApiResult");
const moment = require("moment");
const PayOrder_mysql_dao_1 = require("../../../../../../common/dao/mysql/PayOrder.mysql.dao");
const ManagerErrorLogger = (0, pinus_logger_1.getLogger)('http', __filename);
let PayService = class PayService {
    async customerPayToPlayer(uid, orderPrice, bonus, chips, remark, ip, userName, beSendEmail, emailContent) {
        try {
            if (!userName) {
                common_1.Logger.warn(`后台管理 | 会员相关 | 会员充值接口 | 未查询到管理员: ${userName} 的信息`);
                return new ApiResult_1.ApiResult(HttpCode_enum_1.HttpCode.Not_Find_ManagerInfo, null, "未查询到管理员信息");
            }
            let list = {};
            list.orderPrice = orderPrice;
            list.field1 = `gold-${uid}`;
            list.remark = '客服充值' + '---' + remark;
            list.customerId = userName;
            list.customerIp = ip;
            list.orderNumber = Utils.id();
            const player = await Player_manager_1.default.findOne({ uid });
            if (!player) {
                return ApiResult_1.ApiResult.ERROR(null, "玩家不存在");
            }
            let gold = orderPrice * 100;
            let withdrawalChips = 0;
            if (player.withdrawalChips >= 0) {
                withdrawalChips = Math.floor(player.withdrawalChips + gold);
            }
            else if (player.withdrawalChips < 0) {
                withdrawalChips = Math.floor(gold);
            }
            await Player_manager_1.default.updateOneForaddPlayerMoney(player.uid, {
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
                addgold: Math.ceil(orderPrice * 100) + (bonus ? bonus * 100 : 0),
                isUpdateGold: true,
                gold: player.gold,
                lastGold: Math.ceil(player.gold + gold),
                bonus: bonus * 100
            };
            await PayInfo_mysql_dao_1.default.insertOne(payInfoParameter);
            const online = await OnlinePlayer_redis_dao_1.default.findOne({ uid: player.uid });
            if (!online) {
                return;
            }
            let msgUserIds = { uid: player.uid, sid: player.sid };
            msgService.pushMessageByUids('updateGold', {
                gold: Math.floor(player.gold + gold),
                walletGold: Math.floor(player.walletGold),
            }, [msgUserIds]);
            return true;
        }
        catch (error) {
            common_1.Logger.warn(`后台管理 | 会员相关 | 会员充值接口 | 充值出错: ${error.stack || error}`);
            return ApiResult_1.ApiResult.ERROR(null, "充值出错");
        }
    }
    async getPayInfo(page, uid, startTime = moment().format("YYYY-MM-01 00:00:00"), endTime = moment().format("YYYY-MM-DD 23:59:59"), remark, pageSize) {
        try {
            console.warn(uid);
            console.warn(startTime);
            console.warn(endTime);
            let resultList = [];
            let countRes = 0;
            if (uid) {
                const { list, count } = await PayInfo_mysql_dao_1.default.findListToLimitByUid(uid, page, pageSize, startTime, endTime);
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
            else {
                const { list, count } = await PayInfo_mysql_dao_1.default.findListToLimit(page, pageSize, startTime, endTime);
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
            return { pays: resultList, allPaysLength: countRes, allPayMoneys: 0 };
        }
        catch (e) {
            console.error(`后台管理 | 会员相关 | 充值记录 | 查询玩家:${uid} 的充值记录出错: ${e.stack || e}`);
            return ApiResult_1.ApiResult.ERROR(null, "查询充值记录出错");
        }
    }
    async getPayType(page, pageSize) {
        try {
            let start = 0, count = pageSize;
            if (page) {
                start = count * (page - 1);
            }
            return { list: [], length: 0 };
        }
        catch (error) {
            common_1.Logger.error(`后台管理 | 会员相关 | 支付类型列表 | 查询出错: ${error.stack || error}`);
            return Promise.reject("获取失败");
        }
    }
    async getPayOrder(page, pageSize) {
        try {
            const { list, count: c } = await PayOrder_mysql_dao_1.default.findListToLimit(page, pageSize);
            return { list, length: c };
        }
        catch (error) {
            common_1.Logger.error(`后台管理 | 会员相关 | 支付订单详情列表 | 查询出错: ${error.stack || error}`);
            return Promise.reject("获取失败");
        }
    }
    async createPayType(name, isOpen, shanghu, rate, url, callBackDelay, remark, icon, sort) {
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
            return true;
        }
        catch (error) {
            common_1.Logger.log(`后台管理 | 会员相关 | 支付类型列表 | 新增支付类型 name: ${name} , shanghu: ${shanghu} , rate: ${rate} | 出错${error.stack || error}`);
            return Promise.reject("添加支付");
        }
    }
    async changePayType(_id, name, isOpen, shanghu, rate, url, callBackDelay, remark, icon, sort) {
        try {
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
            return true;
        }
        catch (e) {
            common_1.Logger.log(`后台管理 | 会员相关 | 支付类型列表 | 修改 ${name} 支付类型出错: ${e.stack || e} `);
            return ApiResult_1.ApiResult.ERROR(null, "修改出错");
        }
    }
    async reducePlayerGold(uid, walletGold, orderPrice, emailContent, beSendEmail, userName) {
        try {
            if (!userName) {
                common_1.Logger.warn(`后台管理 | 会员相关 | 会员扣款接口 | 扣款失败: 该管理员不存在: ${userName}`);
                return new ApiResult_1.ApiResult(HttpCode_enum_1.HttpCode.Not_Find_ManagerInfo, null, "该管理员不存在");
            }
            const player = await Player_manager_1.default.findOne({ uid });
            if (!player) {
                common_1.Logger.warn(`后台管理 | 会员相关 | 会员扣款接口 | 扣款失败: 未查询到玩家信息: ${uid}`);
                return new ApiResult_1.ApiResult(HttpCode_enum_1.HttpCode.Not_Find_PlayerInfo, null, "未查询到玩家信息");
            }
            if (player.position === PositionEnum_1.PositionEnum.GAME) {
                return new ApiResult_1.ApiResult(HttpCode_enum_1.HttpCode.Player_Is_Gaming, null, "正在对局中不能扣款");
            }
            const gold = orderPrice * 100;
            const walletGoldToGold = walletGold * 100;
            if (player.walletGold + walletGoldToGold < 0) {
                common_1.Logger.warn(`后台管理 | 会员相关 | 会员扣款接口 | 扣款失败: 玩家的钱包金币不足`);
                return new ApiResult_1.ApiResult(HttpCode_enum_1.HttpCode.Player_WalletGold_Not_Enough, null, "玩家的钱包金币不足");
            }
            if (player.gold < Math.abs(gold)) {
                common_1.Logger.warn(`后台管理 | 会员相关 | 会员扣款接口 | 扣款失败: 玩家的持有金币金币不足`);
                return new ApiResult_1.ApiResult(HttpCode_enum_1.HttpCode.Player_Gold_Not_Enough, null, "玩家的持有金币金币不足");
            }
            if (beSendEmail) {
                const opts = {
                    name: `客服${userName ? `:${userName}` : ``}扣值`,
                    content: emailContent,
                    sender: `客服`,
                    type: MailEnum_1.MailTypeEnum.customer
                };
                await MailService.generatorMail(opts, uid);
            }
            const info = {
                total_fee: gold,
                walletGoldToGold: walletGoldToGold,
                remark: "客服扣款",
                customerId: userName,
                uid: uid,
                addgold: gold,
                gold: player.gold,
                lastGold: player.gold + gold,
                lastWalletGold: player.walletGold + walletGoldToGold,
            };
            player.gold -= Math.abs(gold);
            try {
                let sid = player.sid;
                let msgUserIds = { uid: player.uid, sid: sid };
                msgService.pushMessageByUids('updateGold', {
                    gold: player.gold,
                    walletGold: player.walletGold,
                }, [msgUserIds]);
            }
            catch (error) {
                console.log('testAddGold', error);
            }
            await Player_manager_1.default.updateOne({ uid }, { gold: player.gold, walletGold: player.walletGold });
            await DeductMoney_mysql_dao_1.default.insertOne(info);
            return true;
        }
        catch (error) {
            common_1.Logger.error(`后台管理 | 会员相关 | 会员扣款接口 | 扣款出错: ${error.stack || error}`);
            return ApiResult_1.ApiResult.ERROR(null, "扣款出错");
        }
    }
    async getPayOfPlatform(startTime, endTime) {
        try {
            let list = [];
            return true;
        }
        catch (error) {
            ManagerErrorLogger.error(`支付列表 :${error.stack || error}`);
            return ApiResult_1.ApiResult.ERROR(null, "查询出错");
        }
    }
};
PayService = __decorate([
    (0, common_1.Injectable)()
], PayService);
exports.PayService = PayService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvcGF5L3BheS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDJDQUFvRDtBQUNwRCwrQ0FBeUM7QUFDekMsMkZBQXNGO0FBQ3RGLDRGQUFtRjtBQUNuRixzR0FBNkY7QUFDN0Ysb0dBQTJGO0FBQzNGLHVEQUF1RDtBQUV2RCw4RUFBK0U7QUFDL0Usc0VBQXNFO0FBQ3RFLHdGQUFxRjtBQUVyRix3RUFBd0U7QUFDeEUsdUVBQStEO0FBQy9ELHVFQUFvRTtBQUNwRSxpQ0FBaUM7QUFDakMsOEZBQXFGO0FBRXJGLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSx3QkFBUyxFQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztBQUd6RCxJQUFhLFVBQVUsR0FBdkIsTUFBYSxVQUFVO0lBSW5CLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxHQUFXLEVBQUUsVUFBa0IsRUFBRSxLQUFhLEVBQUUsS0FBYSxFQUFFLE1BQWMsRUFBRSxFQUFVLEVBQUUsUUFBZ0IsRUFBRSxXQUFvQixFQUFFLFlBQW9CO1FBQzdLLElBQUk7WUFHQSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNYLGVBQU0sQ0FBQyxJQUFJLENBQUMsbUNBQW1DLFFBQVEsTUFBTSxDQUFDLENBQUM7Z0JBQy9ELE9BQU8sSUFBSSxxQkFBUyxDQUFDLHdCQUFRLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQzFFO1lBbUJELElBQUksSUFBSSxHQUFpQyxFQUFFLENBQUM7WUFDNUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxN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