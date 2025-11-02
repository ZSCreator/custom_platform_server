"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashService = void 0;
const common_1 = require("@nestjs/common");
const pinus_logger_1 = require("pinus-logger");
const Player_manager_1 = require("../../../../../../common/dao/daoManager/Player.manager");
const mallService_1 = require("../../../../../../services/hall/mallHandler/mallService");
const OnlinePlayer_redis_dao_1 = require("../../../../../../common/dao/redis/OnlinePlayer.redis.dao");
const PlayerCashRecord_mysql_dao_1 = require("../../../../../../common/dao/mysql/PlayerCashRecord.mysql.dao");
const ManagerErrorLogger = (0, pinus_logger_1.getLogger)('http', __filename);
const msgService = require("../../../../../../services/MessageService");
let CashService = class CashService {
    constructor() {
        this.mallService = new mallService_1.default();
    }
    async getPlayerCashRecord(uid, orderStatus, manager, startTime, endTime, page = 1, pageSize = 20) {
        try {
            let where = null;
            if (startTime && endTime) {
                where = `Sp_PlayerCashRecord.createDate > "${startTime}"  AND Sp_PlayerCashRecord.createDate <= "${endTime}"`;
            }
            if (orderStatus == 10 && manager) {
                if (where) {
                    where = where + ` AND Sp_PlayerCashRecord.orderStatus = ${orderStatus} AND Sp_PlayerCashRecord.checkName = "${manager}"`;
                }
                else {
                    where = `Sp_PlayerCashRecord.orderStatus = ${orderStatus} AND Sp_PlayerCashRecord.checkName = "${manager}"`;
                }
            }
            if (orderStatus) {
                if (where) {
                    where = where + ` AND Sp_PlayerCashRecord.orderStatus = ${orderStatus}`;
                }
                else {
                    where = `Sp_PlayerCashRecord.orderStatus = ${orderStatus}`;
                }
            }
            if (!where) {
                where = `Sp_PlayerCashRecord.orderStatus = 0`;
            }
            const { list, count } = await PlayerCashRecord_mysql_dao_1.default.selectWhere(where, page, pageSize);
            return { list, count };
        }
        catch (e) {
            ManagerErrorLogger.error(`获取玩家未审核的提现记录: ${e.stack | e}`);
            return { list: [], count: 0 };
        }
    }
    ;
    async setCashRecordForCheck(manager, id, orderStatus, content) {
        try {
            const record = await PlayerCashRecord_mysql_dao_1.default.findOne({ id: id });
            if (!record) {
                return Promise.reject("订单不存在");
            }
            if (record.checkName && record.orderStatus == 10) {
                if (record.checkName !== manager) {
                    return Promise.reject("订单正在被审核");
                }
            }
            if (!manager) {
                return Promise.reject("审核人员信息不存在,请重新登陆后台");
            }
            if (orderStatus == 2) {
                let gold = record.money;
                await PlayerCashRecord_mysql_dao_1.default.updateOne({ id }, { orderStatus, checkName: manager, content });
                let player = await Player_manager_1.default.findOne({ uid: record.uid }, false);
                if (!player) {
                    return;
                }
                let addTixian = player.addTixian - gold;
                if (addTixian < 0) {
                    addTixian = 0;
                }
                await Player_manager_1.default.updateOneCash(record.uid, { gold: gold, addTixian });
                const onlinePlayer = await OnlinePlayer_redis_dao_1.default.findOne({ uid: record.uid });
                if (onlinePlayer) {
                    let msgUserIds = { uid: player.uid, sid: player.sid };
                    msgService.pushMessageByUids('updateGold', {
                        gold: Math.floor(player.gold + gold),
                        walletGold: Math.floor(player.walletGold),
                    }, [msgUserIds]);
                }
            }
            else {
                await PlayerCashRecord_mysql_dao_1.default.updateOne({ id }, { orderStatus, checkName: manager });
            }
            return true;
        }
        catch (e) {
            ManagerErrorLogger.error(`审核订单 : ${e}`);
            return { code: 500, error: "审核失败" };
        }
    }
    ;
    async getPlayerIsCheckPass(manager, uid, cashStatus, page = 1, pageSize = 20, startTime, endTime) {
        try {
            let where = `Sp_PlayerCashRecord.orderStatus = 1`;
            if (startTime && endTime) {
                where = where + ` AND Sp_PlayerCashRecord.createDate > "${startTime}"  AND Sp_PlayerCashRecord.createDate <= "${endTime}"`;
            }
            if (cashStatus && cashStatus == 10) {
                where = where + ` AND Sp_PlayerCashRecord.cashStatus = ${cashStatus}  AND Sp_PlayerCashRecord.remittance = "${manager}"`;
            }
            else if (cashStatus && cashStatus !== 10) {
                where = where + ` AND Sp_PlayerCashRecord.cashStatus = ${cashStatus}`;
            }
            else {
                where = where + ` AND Sp_PlayerCashRecord.cashStatus = 0`;
            }
            const { list, count } = await PlayerCashRecord_mysql_dao_1.default.selectWhere(where, page, pageSize);
            return { list, count };
        }
        catch (e) {
            ManagerErrorLogger.error(`审核订单通过，然后进行汇款 : ${e.stack | e}`);
            return { list: [], count: 0 };
        }
    }
    ;
    async setCashRecordForCash(manager, id, cashStatus) {
        try {
            const record = await PlayerCashRecord_mysql_dao_1.default.findOne({ id: id });
            if (!record) {
                return Promise.reject("订单不存在");
            }
            if (record.cashStatus == 1) {
                return Promise.reject("订单已经汇款完成");
            }
            if (record.remittance && record.cashStatus == 10) {
                if (record.remittance !== manager) {
                    return Promise.reject("订单正在汇款当中");
                }
            }
            if (!manager) {
                return Promise.reject("汇款人员信息不存在,请重新登陆后台");
            }
            await PlayerCashRecord_mysql_dao_1.default.updateOne({ id }, { cashStatus, remittance: manager });
            return true;
        }
        catch (e) {
            ManagerErrorLogger.error(`审核订单 : ${e.stack | e}`);
            return false;
        }
    }
    ;
    async setCashRecordForCash_DaiFu(manager, id, cashStatus) {
        try {
            const record = await PlayerCashRecord_mysql_dao_1.default.findOne({ id: id });
            if (!record) {
                return Promise.reject("订单不存在");
            }
            if (record.cashStatus == 1) {
                return Promise.reject("订单已经汇款完成");
            }
            if (record.remittance && record.cashStatus == 10) {
                if (record.checkName !== manager) {
                    return Promise.reject("订单正在汇款当中");
                }
            }
            if (!manager) {
                return Promise.reject("汇款人员信息不存在,请重新登陆后台");
            }
            let money = Math.floor(record.money / 100);
            let result = await this.mallService.getPayForCashOrder({ uid: record.uid, cardHolderName: record.bankUserName,
                accountName: record.bankUserName, cardNumber: record.bankCardNo, betFlowMag: 0, amount: money, requestAmount: money, type: 0, bankCodeType: record.type });
            if (result && result.code == 200) {
                await PlayerCashRecord_mysql_dao_1.default.updateOne({ id }, { cashStatus, remittance: manager });
                return true;
            }
            else {
                return Promise.reject("代付功能失败，请联系相关技术人员");
            }
        }
        catch (e) {
            ManagerErrorLogger.error(`审核订单 : ${e.stack | e}`);
            return false;
        }
    }
    ;
    async getAllCashRecord(uid, orderStatus, cashStatus, page = 1, pageSize = 20, startTime, endTime, orderNo) {
        try {
            let where = null;
            if (startTime && endTime) {
                where = `Sp_PlayerCashRecord.createDate > "${startTime}"  AND Sp_PlayerCashRecord.createDate <= "${endTime}"`;
            }
            if (uid) {
                if (where) {
                    where = where + ` AND Sp_PlayerCashRecord.uid = "${uid}"`;
                }
                else {
                    where = `Sp_PlayerCashRecord.uid = "${uid}"`;
                }
            }
            if (orderNo) {
                if (where) {
                    where = where + ` AND Sp_PlayerCashRecord.orderNo = "${orderNo}"`;
                }
                else {
                    where = `Sp_PlayerCashRecord.orderNo = "${orderNo}"`;
                }
            }
            if (orderStatus) {
                if (where) {
                    where = where + ` AND Sp_PlayerCashRecord.orderStatus = ${orderStatus}`;
                }
                else {
                    where = `Sp_PlayerCashRecord.orderStatus = ${orderStatus}`;
                }
            }
            if (cashStatus) {
                if (where) {
                    where = where + ` AND Sp_PlayerCashRecord.cashStatus = ${cashStatus}`;
                }
                else {
                    where = `Sp_PlayerCashRecord.cashStatus = ${cashStatus}`;
                }
            }
            if (!where) {
                where = `Sp_PlayerCashRecord.cashStatus = 1`;
            }
            const { list, count } = await PlayerCashRecord_mysql_dao_1.default.selectWhere(where, page, pageSize);
            return { list, count };
        }
        catch (e) {
            ManagerErrorLogger.error(`获取玩家获取所有成功和拒绝的提现订单 : ${e.stack | e}`);
            return { list: [], count: 0 };
        }
    }
    ;
    async getPlayerBankForUid(uid) {
        try {
            return true;
        }
        catch (e) {
            ManagerErrorLogger.error(`审核订单 : ${e.stack | e}`);
            return { list: [], count: 0 };
        }
    }
    ;
};
CashService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CashService);
exports.CashService = CashService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FzaC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ21zQXBpL2xpYi9tb2R1bGVzL21hbmFnZXJCYWNrZW5kQXBpL3BheS9jYXNoLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTZDO0FBQzdDLCtDQUF5QztBQUN6QywyRkFBc0Y7QUFDdEYseUZBQWtGO0FBQ2xGLHNHQUE2RjtBQUM3Riw4R0FBcUc7QUFDckcsTUFBTSxrQkFBa0IsR0FBRyxJQUFBLHdCQUFTLEVBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3pELHdFQUF3RTtBQVF4RSxJQUFhLFdBQVcsR0FBeEIsTUFBYSxXQUFXO0lBR3BCO1FBQ0ksSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLHFCQUFXLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBT0QsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEdBQVcsRUFBRSxXQUFrQixFQUFHLE9BQWdCLEVBQUUsU0FBZ0IsRUFBRyxPQUFlLEVBQUUsT0FBZ0IsQ0FBQyxFQUFHLFdBQW9CLEVBQUU7UUFDeEosSUFBSTtZQUNBLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLFNBQVMsSUFBSSxPQUFPLEVBQUU7Z0JBQ3RCLEtBQUssR0FBRyxxQ0FBcUMsU0FBUyw2Q0FBNkMsT0FBTyxHQUFHLENBQUM7YUFDakg7WUFRRCxJQUFHLFdBQVcsSUFBSSxFQUFFLElBQUksT0FBTyxFQUFDO2dCQUM1QixJQUFHLEtBQUssRUFBQztvQkFDTCxLQUFLLEdBQUcsS0FBSyxHQUFHLDBDQUEwQyxXQUFXLHlDQUF5QyxPQUFPLEdBQUcsQ0FBQztpQkFDNUg7cUJBQUk7b0JBQ0QsS0FBSyxHQUFJLHFDQUFxQyxXQUFXLHlDQUF5QyxPQUFPLEdBQUcsQ0FBQztpQkFDaEg7YUFDSjtZQUVELElBQUcsV0FBVyxFQUFDO2dC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