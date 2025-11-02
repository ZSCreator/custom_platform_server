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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pay_service_1 = require("./pay.service");
const customerPayToPlayer_dto_1 = require("./dto/customerPayToPlayer.dto");
const ApiResult_1 = require("../../../../../../common/pojo/ApiResult");
const HttpCode_enum_1 = require("../../../support/code/HttpCode.enum");
const uidMatchNickName_dto_1 = require("./dto/uidMatchNickName.dto");
const getPayInfo_dto_1 = require("./dto/getPayInfo.dto");
const getPayType_dto_1 = require("./dto/getPayType.dto");
const createPayType_dto_1 = require("./dto/createPayType.dto");
const changePayType_dto_1 = require("./dto/changePayType.dto");
const getPayOfPlatform_dto_1 = require("./dto/getPayOfPlatform.dto");
const token_guard_1 = require("../../main/token.guard");
let PayController = class PayController {
    constructor(payService) {
        this.payService = payService;
    }
    async customerPayToPlayer({ manager, uid, orderPrice, bonus, chips, beSendEmail, remark, emailContent }, ip) {
        try {
            common_1.Logger.log(`后台管理 | 会员相关 | 会员充值接口 | 管理员: ${manager} 为玩家: ${uid} 充值 ${orderPrice} 元充，码量: ${chips}，彩金: ${bonus}。${beSendEmail ? "发" : "不发"}邮件通知。备注:${remark}`);
            const beSuccess = await this.payService.customerPayToPlayer(uid, orderPrice, bonus, chips, remark, ip, manager, beSendEmail, emailContent);
            if (beSuccess instanceof ApiResult_1.ApiResult) {
                return beSuccess;
            }
            return ApiResult_1.ApiResult.SUCCESS(null, "充值出错");
        }
        catch (error) {
            common_1.Logger.error(`会员充值 :${error}`);
            return ApiResult_1.ApiResult.ERROR(null, "充值出错");
        }
    }
    async uidMatchNickName({ uid }) {
        common_1.Logger.log(`后台管理 | 会员相关 | 查询昵称 | 查询玩家:${uid} 的昵称`);
        try {
            return ApiResult_1.ApiResult.SUCCESS({}, "查询昵称成功");
        }
        catch (e) {
            common_1.Logger.error(`后台管理 | 会员相关 | 查询昵称 | 查询玩家:${uid} 的昵称出错:${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, "查询昵称出错");
        }
    }
    async getPayInfo({ uid, page, pageSize, startTime, endTime, remark }) {
        common_1.Logger.log(`后台管理 | 会员相关 | 充值记录 | 查询玩家:${uid} 的充值记录`);
        try {
            const info = await this.payService.getPayInfo(page, uid, startTime, endTime, remark, pageSize);
            if (info instanceof ApiResult_1.ApiResult) {
                return info;
            }
            return ApiResult_1.ApiResult.SUCCESS(info, "查询充值记录成功");
        }
        catch (e) {
            console.error(`后台管理 | 会员相关 | 充值记录 | 查询玩家:${uid} 的充值记录出错: ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, "查询充值记录出错");
        }
    }
    async getPayType({ page, pageSize }) {
        common_1.Logger.log(`后台管理 | 会员相关 | 金币更新详情列表 | 查询`);
        try {
            const result = await this.payService.getPayType(page, pageSize);
            return ApiResult_1.ApiResult.SUCCESS(result);
        }
        catch (error) {
            common_1.Logger.error(`后台管理 | 会员相关 | 金币更新详情列表 | 查询出错: ${error}`);
            return ApiResult_1.ApiResult.ERROR(null, "查询金币更新详情列表表出错");
        }
    }
    async getPayOrder({ page, pageSize }) {
        common_1.Logger.log(`后台管理 | 会员相关 | 支付订单详情列表 | 查询`);
        try {
            const result = await this.payService.getPayOrder(page, pageSize);
            return ApiResult_1.ApiResult.SUCCESS(result);
        }
        catch (error) {
            common_1.Logger.error(`后台管理 | 会员相关 | 支付订单详情列表 | 查询出错: ${error}`);
            return ApiResult_1.ApiResult.ERROR(null, "查询支付订单详情列表出错");
        }
    }
    async createPayType({ name, isOpen, shanghu, rate, url, callBackDelay, remark, icon, sort }) {
        common_1.Logger.log(`后台管理 | 会员相关 | 支付类型列表 | 新增支付类型 name: ${name} , shanghu: ${shanghu} , rate: ${rate}`);
        try {
            await this.payService.createPayType(name, isOpen, shanghu, rate, url, callBackDelay, remark, icon, sort);
            return ApiResult_1.ApiResult.SUCCESS(null, "新增成功");
        }
        catch (error) {
            common_1.Logger.log(`后台管理 | 会员相关 | 支付类型列表 | 新增支付类型 name: ${name} , shanghu: ${shanghu} , rate: ${rate} | 出错${error}`);
            return ApiResult_1.ApiResult.ERROR(null, "新增出错");
        }
    }
    async changePayType({ _id, name, isOpen, shanghu, rate, url, callBackDelay, remark, icon, sort }) {
        common_1.Logger.log(`后台管理 | 会员相关 | 支付类型列表 | 修改支付类型 name: ${name} , shanghu: ${shanghu} , rate: ${rate}`);
        try {
            const result = await this.payService.changePayType(_id, name, isOpen, shanghu, rate, url, callBackDelay, remark, icon, sort);
            if (result instanceof ApiResult_1.ApiResult) {
                return result;
            }
            return ApiResult_1.ApiResult.SUCCESS(result, "修改成功");
        }
        catch (error) {
            common_1.Logger.error(`支付列表 :${error}`);
            return ApiResult_1.ApiResult.ERROR(null, "修改出错");
        }
    }
    async reducePlayerGold({ orderPrice, walletGold, uid, emailContent, beSendEmail, manager }) {
        let userName = manager;
        common_1.Logger.log(`后台管理 | 会员相关 | 会员扣款接口 | 管理员: ${userName} 为玩家: ${uid} 扣款 ${orderPrice} 元充,钱包金币:${walletGold} `);
        try {
            const result = await this.payService.reducePlayerGold(uid, walletGold, orderPrice, emailContent, beSendEmail, userName);
            if (result instanceof ApiResult_1.ApiResult) {
                return result;
            }
            return ApiResult_1.ApiResult.SUCCESS(result, "扣款成功");
        }
        catch (error) {
            common_1.Logger.error(`后台管理 | 会员相关 | 会员扣款接口 | 扣款出错: ${error.stack || error}`);
            return ApiResult_1.ApiResult.ERROR(null, "扣款出错");
        }
    }
    async getPayOfPlatform({ startTime, endTime }) {
        common_1.Logger.log(`后台管理 | 会员相关 | 通道统计 | 查询`);
        try {
            const result = await this.payService.getPayOfPlatform(startTime, endTime);
            return ApiResult_1.ApiResult.SUCCESS(result, "查询成功");
        }
        catch (error) {
            common_1.Logger.log(`后台管理 | 会员相关 | 通道统计 | 查询出错: ${error}`);
            return ApiResult_1.ApiResult.ERROR(null, "查询出错");
        }
    }
};
__decorate([
    (0, common_1.Post)('customerPayToPlayer'),
    (0, swagger_1.ApiOperation)({ summary: "会员充值" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "充值成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "充值出错" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.Not_Find_ManagerInfo, description: "未查询到后台管理员信息" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.Recharge_Failure, description: "充值失败" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customerPayToPlayer_dto_1.CustomerPayToPlayerDTO, String]),
    __metadata("design:returntype", Promise)
], PayController.prototype, "customerPayToPlayer", null);
__decorate([
    (0, common_1.Post)('uidMatchNickName'),
    (0, swagger_1.ApiOperation)({ summary: "根据uid来查询玩家的昵称" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "查询成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "查询出错" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.Not_Find_PlayerInfo, description: "未查询到玩家信息" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [uidMatchNickName_dto_1.UidMatchNickNameDTO]),
    __metadata("design:returntype", Promise)
], PayController.prototype, "uidMatchNickName", null);
__decorate([
    (0, common_1.Post)('getPayInfo'),
    (0, swagger_1.ApiOperation)({ summary: "获取玩家的充值记录" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "查询成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "查询出错" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getPayInfo_dto_1.GetPayInfoDTO]),
    __metadata("design:returntype", Promise)
], PayController.prototype, "getPayInfo", null);
__decorate([
    (0, common_1.Post)('getPayType'),
    (0, swagger_1.ApiOperation)({ summary: "金币更新详情列表" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "查询成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "查询出错" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getPayType_dto_1.GetPayTypeDTO]),
    __metadata("design:returntype", Promise)
], PayController.prototype, "getPayType", null);
__decorate([
    (0, common_1.Post)('getPayOrder'),
    (0, swagger_1.ApiOperation)({ summary: "支付订单详情列表" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "查询成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "查询出错" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getPayType_dto_1.GetPayTypeDTO]),
    __metadata("design:returntype", Promise)
], PayController.prototype, "getPayOrder", null);
__decorate([
    (0, common_1.Post)('createPayType'),
    (0, swagger_1.ApiOperation)({ summary: "新增支付类型" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "查询成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "查询出错" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createPayType_dto_1.CreatePayType]),
    __metadata("design:returntype", Promise)
], PayController.prototype, "createPayType", null);
__decorate([
    (0, common_1.Post)('changePayType'),
    (0, swagger_1.ApiOperation)({ summary: "修改支付类型" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "查询成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "查询出错" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.PayType_Not_Find, description: "未查询到支付信息" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [changePayType_dto_1.ChangePayTypeDTO]),
    __metadata("design:returntype", Promise)
], PayController.prototype, "changePayType", null);
__decorate([
    (0, common_1.Post)('reducePlayerGold'),
    (0, swagger_1.ApiOperation)({ summary: "客服扣款" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "扣款成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "扣款出错" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.Not_Find_ManagerInfo, description: "未找到管理员信息" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.Not_Find_PlayerInfo, description: "未查询到玩家信息" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.Player_Is_Gaming, description: "正在对局无法扣款" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.Player_Gold_Not_Enough, description: "玩家金币不足" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.Player_WalletGold_Not_Enough, description: "玩家钱包金币不足" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayController.prototype, "reducePlayerGold", null);
__decorate([
    (0, common_1.Post)('getPayOfPlatform'),
    (0, swagger_1.ApiOperation)({ summary: "通道统计" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "扣款成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "扣款出错" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.No_More_Than_30_Days, description: "查询区间不应超过30天" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getPayOfPlatform_dto_1.GetPayOfPlatformDTO]),
    __metadata("design:returntype", Promise)
], PayController.prototype, "getPayOfPlatform", null);
PayController = __decorate([
    (0, swagger_1.ApiTags)("支付相关"),
    (0, common_1.Controller)('managerPay'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __metadata("design:paramtypes", [pay_service_1.PayService])
], PayController);
exports.PayController = PayController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5LmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvcGF5L3BheS5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUE2RTtBQUM3RSw2Q0FBcUU7QUFDckUsK0NBQTJDO0FBQzNDLDJFQUF1RTtBQUN2RSx1RUFBb0U7QUFDcEUsdUVBQStEO0FBQy9ELHFFQUFpRTtBQUNqRSx5REFBcUQ7QUFDckQseURBQXFEO0FBQ3JELCtEQUF3RDtBQUN4RCwrREFBMkQ7QUFFM0QscUVBQWlFO0FBQ2pFLHdEQUFrRDtBQVFsRCxJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFhO0lBRXRCLFlBQ3FCLFVBQXNCO1FBQXRCLGVBQVUsR0FBVixVQUFVLENBQVk7SUFDdkMsQ0FBQztJQVFMLEtBQUssQ0FBQyxtQkFBbUIsQ0FDYixFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQTBCLEVBQ3ZHLEVBQVU7UUFFaEIsSUFBSTtZQUNBLGVBQU0sQ0FBQyxHQUFHLENBQUMsK0JBQStCLE9BQU8sU0FBUyxHQUFHLE9BQU8sVUFBVSxXQUFXLEtBQUssUUFBUSxLQUFLLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzVKLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lB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