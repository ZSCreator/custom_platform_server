"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerBackendApiModule = void 0;
const common_1 = require("@nestjs/common");
const agent_controller_1 = require("./agent/agent.controller");
const agent_service_1 = require("./agent/agent.service");
const login_controller_1 = require("./login/login.controller");
const systemMenu_controller_1 = require("./login/systemMenu.controller");
const login_service_1 = require("./login/login.service");
const systemMenu_service_1 = require("./login/systemMenu.service");
const pay_controller_1 = require("./pay/pay.controller");
const pay_service_1 = require("./pay/pay.service");
const thirdApi_controller_1 = require("./thirdApi/thirdApi.controller");
const thirdApi_service_1 = require("./thirdApi/thirdApi.service");
const player_service_1 = require("./player/player.service");
const player_controller_1 = require("./player/player.controller");
const cash_controller_1 = require("./pay/cash.controller");
const reportApp_controller_1 = require("./agent/reportApp.controller");
const reportApp_service_1 = require("./agent/reportApp.service");
const cash_service_1 = require("./pay/cash.service");
const vipConfig_controller_1 = require("./vip/vipConfig.controller");
const vipBonusDetails_controller_1 = require("./vip/vipBonusDetails.controller");
const customer_controller_1 = require("./pay/customer.controller");
let ManagerBackendApiModule = class ManagerBackendApiModule {
};
ManagerBackendApiModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            pay_controller_1.PayController,
            thirdApi_controller_1.ThirdApiController,
            agent_controller_1.AgentController,
            login_controller_1.LoginController,
            systemMenu_controller_1.SystemMenuController,
            cash_controller_1.CashController,
            reportApp_controller_1.ReportAppController,
            player_controller_1.PlayerController,
            vipConfig_controller_1.VipConfigController,
            vipBonusDetails_controller_1.VipBonusDetailsController,
            customer_controller_1.CustomerController
        ],
        providers: [
            pay_service_1.PayService,
            cash_service_1.CashService,
            reportApp_service_1.ReportAppService,
            thirdApi_service_1.ThirdApiService,
            agent_service_1.AgentService,
            login_service_1.LoginService,
            systemMenu_service_1.SystemMenuService,
            player_service_1.PlayerService
        ]
    })
], ManagerBackendApiModule);
exports.ManagerBackendApiModule = ManagerBackendApiModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFuYWdlckJhY2tlbmRBcGkubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ21zQXBpL2xpYi9tb2R1bGVzL21hbmFnZXJCYWNrZW5kQXBpL21hbmFnZXJCYWNrZW5kQXBpLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwyQ0FBd0M7QUFDeEMsK0RBQTJEO0FBQzNELHlEQUFxRDtBQUNyRCwrREFBMkQ7QUFDM0QseUVBQXFFO0FBQ3JFLHlEQUFxRDtBQUNyRCxtRUFBK0Q7QUFDL0QseURBQXFEO0FBQ3JELG1EQUErQztBQUMvQyx3RUFBb0U7QUFDcEUsa0VBQThEO0FBQzlELDREQUF3RDtBQUN4RCxrRUFBOEQ7QUFDOUQsMkRBQXVEO0FBQ3ZELHVFQUFtRTtBQUNuRSxpRUFBNkQ7QUFDN0QscURBQWlEO0FBQ2pELHFFQUFpRTtBQUNqRSxpRkFBNkU7QUFDN0UsbUVBQStEO0FBMkIvRCxJQUFhLHVCQUF1QixHQUFwQyxNQUFhLHVCQUF1QjtDQUFJLENBQUE7QUFBM0IsdUJBQXVCO0lBekJuQyxJQUFBLGVBQU0sRUFBQztRQUNKLFdBQVcsRUFBRTtZQUNULDhCQUFhO1lBQ2Isd0NBQWtCO1lBQ2xCLGtDQUFlO1lBQ2Ysa0NBQWU7WUFDZiw0Q0FBb0I7WUFDcEIsZ0NBQWM7WUFDZCwwQ0FBbUI7WUFDbkIsb0NBQWdCO1lBQ2hCLDBDQUFtQjtZQUNuQixzREFBeUI7WUFDekIsd0NBQWtCO1NBQ3JCO1FBQ0QsU0FBUyxFQUFFO1lBQ1Asd0JBQVU7WUFDViwwQkFBVztZQUNYLG9DQUFnQjtZQUNoQixrQ0FBZTtZQUNmLDRCQUFZO1lBQ1osNEJBQVk7WUFDWixzQ0FBaUI7WUFDakIsOEJBQWE7U0FDaEI7S0FDSixDQUFDO0dBQ1csdUJBQXVCLENBQUk7QUFBM0IsMERBQXVCIn0=