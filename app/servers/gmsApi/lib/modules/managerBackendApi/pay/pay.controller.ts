import {Controller, Post, Body, Ip, Logger, UseGuards} from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { PayService } from "./pay.service";
import { CustomerPayToPlayerDTO } from "./dto/customerPayToPlayer.dto";
import { ApiResult } from "../../../../../../common/pojo/ApiResult";
import { HttpCode } from "../../../support/code/HttpCode.enum";
import { UidMatchNickNameDTO } from "./dto/uidMatchNickName.dto";
import { GetPayInfoDTO } from "./dto/getPayInfo.dto";
import { GetPayTypeDTO } from "./dto/getPayType.dto";
import { CreatePayType } from "./dto/createPayType.dto";
import { ChangePayTypeDTO } from "./dto/changePayType.dto";
import { ReducePlayerGoldDTO } from "./dto/reducePlayerGold.dto";
import { GetPayOfPlatformDTO } from "./dto/getPayOfPlatform.dto";
import {TokenGuard} from "../../main/token.guard";

/**
 * 管理后台
 */
@ApiTags("支付相关")
@Controller('managerPay')
@UseGuards(TokenGuard)
export class PayController {

    constructor(
        private readonly payService: PayService
    ) { }

    @Post('customerPayToPlayer')
    @ApiOperation({ summary: "会员充值" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "充值成功" })
    @ApiResponse({ status: HttpCode.FAIL, description: "充值出错" })
    @ApiResponse({ status: HttpCode.Not_Find_ManagerInfo, description: "未查询到后台管理员信息" })
    @ApiResponse({ status: HttpCode.Recharge_Failure, description: "充值失败" })
    async customerPayToPlayer(
        @Body() { manager, uid, orderPrice, bonus, chips, beSendEmail, remark, emailContent }: CustomerPayToPlayerDTO,
        @Ip() ip: string
    ): Promise<ApiResult> {
        try {
            Logger.log(`后台管理 | 会员相关 | 会员充值接口 | 管理员: ${manager} 为玩家: ${uid} 充值 ${orderPrice} 元充，码量: ${chips}，彩金: ${bonus}。${beSendEmail ? "发" : "不发"}邮件通知。备注:${remark}`);
            const beSuccess = await this.payService.customerPayToPlayer(uid, orderPrice, bonus, chips, remark, ip, manager, beSendEmail, emailContent);

            if (beSuccess instanceof ApiResult) {
                return beSuccess;
            }

            return ApiResult.SUCCESS(null, "充值出错");
        } catch (error) {
            Logger.error(`会员充值 :${error}`);
            return ApiResult.ERROR(null, "充值出错");
        }

    }

    @Post('uidMatchNickName')
    @ApiOperation({ summary: "根据uid来查询玩家的昵称" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "查询成功" })
    @ApiResponse({ status: HttpCode.FAIL, description: "查询出错" })
    @ApiResponse({ status: HttpCode.Not_Find_PlayerInfo, description: "未查询到玩家信息" })
    async uidMatchNickName(@Body() { uid }: UidMatchNickNameDTO): Promise<ApiResult> {
        Logger.log(`后台管理 | 会员相关 | 查询昵称 | 查询玩家:${uid} 的昵称`);
        try {
            // const nickname = await this.payService.uidMatchNickName(uid);

            // if (nickname instanceof ApiResult) {
            //     return nickname;
            // }

            // return ApiResult.SUCCESS({ nickname }, "查询昵称成功");
            return ApiResult.SUCCESS({ }, "查询昵称成功")
        } catch (e) {
            Logger.error(`后台管理 | 会员相关 | 查询昵称 | 查询玩家:${uid} 的昵称出错:${e.stack}`);
            return ApiResult.ERROR(null, "查询昵称出错");
        }

    }

    @Post('getPayInfo')
    @ApiOperation({ summary: "获取玩家的充值记录" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "查询成功" })
    @ApiResponse({ status: HttpCode.FAIL, description: "查询出错" })
    async getPayInfo(@Body() { uid, page, pageSize, startTime, endTime, remark }: GetPayInfoDTO): Promise<any> {
        Logger.log(`后台管理 | 会员相关 | 充值记录 | 查询玩家:${uid} 的充值记录`);
        try {
            const info = await this.payService.getPayInfo(page, uid, startTime, endTime, remark, pageSize);

            if (info instanceof ApiResult) {
                return info;
            }

            return ApiResult.SUCCESS(info, "查询充值记录成功");
        } catch (e) {
            console.error(`后台管理 | 会员相关 | 充值记录 | 查询玩家:${uid} 的充值记录出错: ${e.stack}`);
            return ApiResult.ERROR(null, "查询充值记录出错");
        }

    }


    /**
     *  金币更新详情列表
     */
    @Post('getPayType')
    @ApiOperation({ summary: "金币更新详情列表" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "查询成功" })
    @ApiResponse({ status: HttpCode.FAIL, description: "查询出错" })
    async getPayType(@Body() { page, pageSize }: GetPayTypeDTO): Promise<ApiResult> {
        Logger.log(`后台管理 | 会员相关 | 金币更新详情列表 | 查询`);

        try {
            const result = await this.payService.getPayType(page, pageSize);

            return ApiResult.SUCCESS(result)
        } catch (error) {
            Logger.error(`后台管理 | 会员相关 | 金币更新详情列表 | 查询出错: ${error}`);

            return ApiResult.ERROR(null, "查询金币更新详情列表表出错");
        }
    }

    /**
     *  支付订单详情列表
     */
     @Post('getPayOrder')
     @ApiOperation({ summary: "支付订单详情列表" })
     @ApiResponse({ status: HttpCode.SUCCESS, description: "查询成功" })
     @ApiResponse({ status: HttpCode.FAIL, description: "查询出错" })
     async getPayOrder(@Body() { page, pageSize }: GetPayTypeDTO): Promise<ApiResult> {
         Logger.log(`后台管理 | 会员相关 | 支付订单详情列表 | 查询`);
 
         try {
             const result = await this.payService.getPayOrder(page, pageSize);
 
             return ApiResult.SUCCESS(result)
         } catch (error) {
             Logger.error(`后台管理 | 会员相关 | 支付订单详情列表 | 查询出错: ${error}`);
 
             return ApiResult.ERROR(null, "查询支付订单详情列表出错");
         }
     }

    /**
     *  新增支付列表
     */
    @Post('createPayType')
    @ApiOperation({ summary: "新增支付类型" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "查询成功" })
    @ApiResponse({ status: HttpCode.FAIL, description: "查询出错" })
    async createPayType(
        @Body() { name, isOpen, shanghu, rate, url, callBackDelay, remark, icon, sort }: CreatePayType
    ): Promise<ApiResult> {
        Logger.log(`后台管理 | 会员相关 | 支付类型列表 | 新增支付类型 name: ${name} , shanghu: ${shanghu} , rate: ${rate}`);
        try {
            await this.payService.createPayType(name, isOpen, shanghu, rate, url, callBackDelay, remark, icon, sort);

            return ApiResult.SUCCESS(null, "新增成功");
        } catch (error) {
            Logger.log(`后台管理 | 会员相关 | 支付类型列表 | 新增支付类型 name: ${name} , shanghu: ${shanghu} , rate: ${rate} | 出错${error}`);
            return ApiResult.ERROR(null, "新增出错");
        }
    }


    /**
     *  改变支付列表
     * @param str
     * @param session
     * @param request
     */
    @Post('changePayType')
    @ApiOperation({ summary: "修改支付类型" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "查询成功" })
    @ApiResponse({ status: HttpCode.FAIL, description: "查询出错" })
    @ApiResponse({ status: HttpCode.PayType_Not_Find, description: "未查询到支付信息" })
    async changePayType(
        @Body() { _id, name, isOpen, shanghu, rate, url, callBackDelay, remark, icon, sort }: ChangePayTypeDTO
    ): Promise<ApiResult> {
        Logger.log(`后台管理 | 会员相关 | 支付类型列表 | 修改支付类型 name: ${name} , shanghu: ${shanghu} , rate: ${rate}`);
        try {
            const result = await this.payService.changePayType(_id, name, isOpen, shanghu, rate, url, callBackDelay, remark, icon, sort);

            if (result instanceof ApiResult) {
                return result;
            }

            return ApiResult.SUCCESS(result, "修改成功");
        } catch (error) {
            Logger.error(`支付列表 :${error}`);
            return ApiResult.ERROR(null, "修改出错");
        }
    }
    /**
     *  客服扣款
     */
    @Post('reducePlayerGold')
    @ApiOperation({ summary: "客服扣款" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "扣款成功" })
    @ApiResponse({ status: HttpCode.FAIL, description: "扣款出错" })
    @ApiResponse({ status: HttpCode.Not_Find_ManagerInfo, description: "未找到管理员信息" })
    @ApiResponse({ status: HttpCode.Not_Find_PlayerInfo, description: "未查询到玩家信息" })
    @ApiResponse({ status: HttpCode.Player_Is_Gaming, description: "正在对局无法扣款" })
    @ApiResponse({ status: HttpCode.Player_Gold_Not_Enough, description: "玩家金币不足" })
    @ApiResponse({ status: HttpCode.Player_WalletGold_Not_Enough, description: "玩家钱包金币不足" })
    async reducePlayerGold(
        @Body() { orderPrice, walletGold, uid, emailContent, beSendEmail, manager }): Promise<ApiResult> {
        let userName = manager;
        Logger.log(`后台管理 | 会员相关 | 会员扣款接口 | 管理员: ${userName} 为玩家: ${uid} 扣款 ${orderPrice} 元充,钱包金币:${walletGold} `);

        try {
            const result = await this.payService.reducePlayerGold(uid, walletGold, orderPrice, emailContent, beSendEmail, userName);

            if (result instanceof ApiResult) {
                return result;
            }

            return ApiResult.SUCCESS(result, "扣款成功");
        } catch (error) {

            Logger.error(`后台管理 | 会员相关 | 会员扣款接口 | 扣款出错: ${error.stack || error}`);
            return ApiResult.ERROR(null, "扣款出错");
        }
    }

    /**
     *  通道统计
     */
    @Post('getPayOfPlatform')
    @ApiOperation({ summary: "通道统计" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "扣款成功" })
    @ApiResponse({ status: HttpCode.FAIL, description: "扣款出错" })
    @ApiResponse({ status: HttpCode.No_More_Than_30_Days, description: "查询区间不应超过30天" })
    async getPayOfPlatform(@Body() { startTime, endTime }: GetPayOfPlatformDTO): Promise<any> {
        Logger.log(`后台管理 | 会员相关 | 通道统计 | 查询`);
        try {
            const result = await this.payService.getPayOfPlatform(startTime, endTime);

            return ApiResult.SUCCESS(result, "查询成功");
        } catch (error) {
            Logger.log(`后台管理 | 会员相关 | 通道统计 | 查询出错: ${error}`);
            return ApiResult.ERROR(null, "查询出错");
        }
    }

}