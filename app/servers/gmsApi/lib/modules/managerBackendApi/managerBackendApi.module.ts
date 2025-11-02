import { Module } from '@nestjs/common';
import { AgentController } from './agent/agent.controller';
import { AgentService } from './agent/agent.service';
import { LoginController } from './login/login.controller';
import { SystemMenuController } from './login/systemMenu.controller';
import { LoginService } from './login/login.service';
import { SystemMenuService } from './login/systemMenu.service';
import { PayController } from './pay/pay.controller';
import { PayService } from './pay/pay.service';
import { ThirdApiController } from './thirdApi/thirdApi.controller';
import { ThirdApiService } from './thirdApi/thirdApi.service';
import { PlayerService } from './player/player.service';
import { PlayerController } from './player/player.controller';
import { CashController } from './pay/cash.controller';
import { ReportAppController } from './agent/reportApp.controller';
import { ReportAppService } from './agent/reportApp.service';
import { CashService } from './pay/cash.service';
import { VipConfigController } from './vip/vipConfig.controller';
import { VipBonusDetailsController } from './vip/vipBonusDetails.controller';
import { CustomerController } from './pay/customer.controller';

@Module({
    controllers: [
        PayController,
        ThirdApiController,
        AgentController,
        LoginController,
        SystemMenuController,
        CashController,
        ReportAppController,
        PlayerController,
        VipConfigController,
        VipBonusDetailsController,
        CustomerController
    ],
    providers: [
        PayService,
        CashService,
        ReportAppService,
        ThirdApiService,
        AgentService,
        LoginService,
        SystemMenuService,
        PlayerService
    ]
})
export class ManagerBackendApiModule { }