import { Controller, Post, Body, Logger, UseGuards } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation, } from "@nestjs/swagger";
import TelegramCustomerMysqlDao from "../../../../../../common/dao/mysql/TelegramCustomer.mysql.dao";
import { ApiResult } from "../../../../../../common/pojo/ApiResult";
import { HttpCode } from "../../../support/code/HttpCode.enum";
import { TokenGuard } from "../../main/token.guard";
import { addOneTelegramCustomerDTO } from "./dto/addOneTelegram.customer.dto";
import { DeleteOneTelegramCustomerDTO } from "./dto/deleteOneTelegramCustomer.dto";
import { findListTelegramCustomerDTO } from "./dto/findListTelegram.customer.dto";
import { UpdateOneTelegramCustomerDTO } from "./dto/updateOneTelegramCustomer.dto";

@ApiTags("客服相关")
@Controller('customer')
@UseGuards(TokenGuard)
export class CustomerController {

    // constructor(private readonly customerService: CustomerService) { }

    @Post('telegram/findList')
    @ApiOperation({ summary: "查询所有纸飞机客服信息列表" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "查询成功" })
    @ApiResponse({ status: HttpCode.FAIL, description: "查询出错" })
    async findListForTelegramCustomer(
        @Body() { page, pageSize }: findListTelegramCustomerDTO
    ) {
        Logger.log(`后台管理 | telegram 客服管理 | 客服列表 | 查询`);
        try {
            // const result = await this.customerService.findListForTelegramCustomer(page, pageSize);
            const result = await TelegramCustomerMysqlDao.findListToLimit(page, pageSize)

            if (!result) {
                return { list: [], count: 0 };
            }

            return ApiResult.SUCCESS(result)
        } catch (error) {
            Logger.error(`后台管理 | telegram 客服管理 | 客服列表 | 查询出错: ${error}`);

            return ApiResult.ERROR(null, "查询telegram客服列表出错");
        }
    }

    @Post('telegram/addOne')
    @ApiOperation({ summary: "新增纸飞机客服信息列表" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "新增成功" })
    @ApiResponse({ status: HttpCode.FAIL, description: "新增出错" })
    async addOneForTelegramCustomer(@Body() params: addOneTelegramCustomerDTO) {
        try {
            await TelegramCustomerMysqlDao.insertOne(params);
            return ApiResult.SUCCESS();
        } catch (e) {
            Logger.error(`后台管理 | telegram 客服管理 | 客服列表 | 新增客服出错: ${e.stack}`);
            return ApiResult.ERROR(null, "查询telegram客服列表出错");
        }
    }

    @Post('telegram/updateOne')
    @ApiOperation({ summary: "修改纸飞机客服信息列表" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "修改成功" })
    @ApiResponse({ status: HttpCode.FAIL, description: "修改出错" })
    async updateOneForTelegramCustomer(@Body() params: UpdateOneTelegramCustomerDTO) {
        try {
            const { id, nickname, per, status, url } = params;

            const res = await TelegramCustomerMysqlDao.updateOne({ id }, { nickname, per, status, url });
            if (!res) {
                return ApiResult.ERROR(null, "修改telegram客服列表出错");
            }
            return ApiResult.SUCCESS();
        } catch (e) {

            Logger.error(`后台管理 | telegram 客服管理 | 客服列表 | 修改客服出错: ${e.stack}`);
            return ApiResult.ERROR(null, "修改telegram客服列表出错");
        }
    }

    @Post('telegram/deleteOne')
    @ApiOperation({ summary: "删除纸飞机客服信息列表" })
    async deleteOneForTelegramCustomer(@Body() params: DeleteOneTelegramCustomerDTO) {
        try {
            const { id } = params;

            await TelegramCustomerMysqlDao.delete({ id });

            return ApiResult.SUCCESS();
        } catch (e) {

            Logger.error(`后台管理 | telegram 客服管理 | 客服列表 | 删除客服出错: ${e.stack}`);
            return ApiResult.ERROR(null, "查询telegram客服列表出错");
        }
    }
}
