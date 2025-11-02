import { Controller, Post, Body, Ip, Logger, UseGuards } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { ApiResult } from "../../../../../common/pojo/ApiResult";
import { mallCallbackFromHttp } from "../../../../../services/payService/payBackService";
// import { ApiResult } from "../../../../../common/pojo/ApiResult";
// import { mallCallbackFromHttp } from "../../../../../services/payService/payBackService";

@ApiTags("支付服务")
@Controller('payServer')
export class PayServerController {

    @Post('callbackurl1')
    async payCallBack(@Body() { serverIp, field1, orderNumber, orderPrice, orderTime, platform }) {
        try {
            console.warn(field1, orderNumber, orderPrice, orderTime, platform);
            await mallCallbackFromHttp({ field1, orderNumber, orderPrice, orderTime })
            return ApiResult.SUCCESS(null, "充值成功");
        } catch (e) {

            return ApiResult.ERROR(null, "充值出错");
        }
    }

}
