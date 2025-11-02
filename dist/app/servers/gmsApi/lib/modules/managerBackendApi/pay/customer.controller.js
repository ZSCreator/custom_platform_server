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
exports.CustomerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const TelegramCustomer_mysql_dao_1 = require("../../../../../../common/dao/mysql/TelegramCustomer.mysql.dao");
const ApiResult_1 = require("../../../../../../common/pojo/ApiResult");
const HttpCode_enum_1 = require("../../../support/code/HttpCode.enum");
const token_guard_1 = require("../../main/token.guard");
const addOneTelegram_customer_dto_1 = require("./dto/addOneTelegram.customer.dto");
const deleteOneTelegramCustomer_dto_1 = require("./dto/deleteOneTelegramCustomer.dto");
const findListTelegram_customer_dto_1 = require("./dto/findListTelegram.customer.dto");
const updateOneTelegramCustomer_dto_1 = require("./dto/updateOneTelegramCustomer.dto");
let CustomerController = class CustomerController {
    async findListForTelegramCustomer({ page, pageSize }) {
        common_1.Logger.log(`后台管理 | telegram 客服管理 | 客服列表 | 查询`);
        try {
            const result = await TelegramCustomer_mysql_dao_1.default.findListToLimit(page, pageSize);
            if (!result) {
                return { list: [], count: 0 };
            }
            return ApiResult_1.ApiResult.SUCCESS(result);
        }
        catch (error) {
            common_1.Logger.error(`后台管理 | telegram 客服管理 | 客服列表 | 查询出错: ${error}`);
            return ApiResult_1.ApiResult.ERROR(null, "查询telegram客服列表出错");
        }
    }
    async addOneForTelegramCustomer(params) {
        try {
            await TelegramCustomer_mysql_dao_1.default.insertOne(params);
            return ApiResult_1.ApiResult.SUCCESS();
        }
        catch (e) {
            common_1.Logger.error(`后台管理 | telegram 客服管理 | 客服列表 | 新增客服出错: ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, "查询telegram客服列表出错");
        }
    }
    async updateOneForTelegramCustomer(params) {
        try {
            const { id, nickname, per, status, url } = params;
            const res = await TelegramCustomer_mysql_dao_1.default.updateOne({ id }, { nickname, per, status, url });
            if (!res) {
                return ApiResult_1.ApiResult.ERROR(null, "修改telegram客服列表出错");
            }
            return ApiResult_1.ApiResult.SUCCESS();
        }
        catch (e) {
            common_1.Logger.error(`后台管理 | telegram 客服管理 | 客服列表 | 修改客服出错: ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, "修改telegram客服列表出错");
        }
    }
    async deleteOneForTelegramCustomer(params) {
        try {
            const { id } = params;
            await TelegramCustomer_mysql_dao_1.default.delete({ id });
            return ApiResult_1.ApiResult.SUCCESS();
        }
        catch (e) {
            common_1.Logger.error(`后台管理 | telegram 客服管理 | 客服列表 | 删除客服出错: ${e.stack}`);
            return ApiResult_1.ApiResult.ERROR(null, "查询telegram客服列表出错");
        }
    }
};
__decorate([
    (0, common_1.Post)('telegram/findList'),
    (0, swagger_1.ApiOperation)({ summary: "查询所有纸飞机客服信息列表" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "查询成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "查询出错" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [findListTelegram_customer_dto_1.findListTelegramCustomerDTO]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findListForTelegramCustomer", null);
__decorate([
    (0, common_1.Post)('telegram/addOne'),
    (0, swagger_1.ApiOperation)({ summary: "新增纸飞机客服信息列表" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "新增成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "新增出错" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addOneTelegram_customer_dto_1.addOneTelegramCustomerDTO]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "addOneForTelegramCustomer", null);
__decorate([
    (0, common_1.Post)('telegram/updateOne'),
    (0, swagger_1.ApiOperation)({ summary: "修改纸飞机客服信息列表" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "修改成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "修改出错" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateOneTelegramCustomer_dto_1.UpdateOneTelegramCustomerDTO]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateOneForTelegramCustomer", null);
__decorate([
    (0, common_1.Post)('telegram/deleteOne'),
    (0, swagger_1.ApiOperation)({ summary: "删除纸飞机客服信息列表" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [deleteOneTelegramCustomer_dto_1.DeleteOneTelegramCustomerDTO]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "deleteOneForTelegramCustomer", null);
CustomerController = __decorate([
    (0, swagger_1.ApiTags)("客服相关"),
    (0, common_1.Controller)('customer'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard)
], CustomerController);
exports.CustomerController = CustomerController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tZXIuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9tYW5hZ2VyQmFja2VuZEFwaS9wYXkvY3VzdG9tZXIuY29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBMkU7QUFDM0UsNkNBQXNFO0FBQ3RFLDhHQUFxRztBQUNyRyx1RUFBb0U7QUFDcEUsdUVBQStEO0FBQy9ELHdEQUFvRDtBQUNwRCxtRkFBOEU7QUFDOUUsdUZBQW1GO0FBQ25GLHVGQUFrRjtBQUNsRix1RkFBbUY7QUFLbkYsSUFBYSxrQkFBa0IsR0FBL0IsTUFBYSxrQkFBa0I7SUFRM0IsS0FBSyxDQUFDLDJCQUEyQixDQUNyQixFQUFFLElBQUksRUFBRSxRQUFRLEVBQStCO1FBRXZELGVBQU0sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUMvQyxJQUFJO1lBRUEsTUFBTSxNQUFNLEdBQUcsTUFBTSxvQ0FBd0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1lBRTdFLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1QsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ2pDO1lBRUQsT0FBTyxxQkFBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUNuQztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osZUFBTSxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUU3RCxPQUFPLHFCQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1NBQ3BEO0lBQ0wsQ0FBQztJQU1ELEtBQUssQ0FBQyx5QkFBeUIsQ0FBUyxNQUFpQztRQUNyRSxJQUFJO1lBQ0Es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