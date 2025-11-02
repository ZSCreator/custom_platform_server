"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayServerModule = void 0;
const common_1 = require("@nestjs/common");
const payCallBack_controller_1 = require("./payCallBack.controller");
let PayServerModule = class PayServerModule {
};
PayServerModule = __decorate([
    (0, common_1.Module)({
        controllers: [payCallBack_controller_1.PayServerController],
        providers: [],
    })
], PayServerModule);
exports.PayServerModule = PayServerModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5U2VydmVyLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9wYXlTZXJ2ZXJBcGkvcGF5U2VydmVyLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwyQ0FBd0M7QUFDeEMscUVBQStEO0FBTS9ELElBQWEsZUFBZSxHQUE1QixNQUFhLGVBQWU7Q0FBSSxDQUFBO0FBQW5CLGVBQWU7SUFKM0IsSUFBQSxlQUFNLEVBQUM7UUFDSixXQUFXLEVBQUUsQ0FBQyw0Q0FBbUIsQ0FBQztRQUNsQyxTQUFTLEVBQUUsRUFBRTtLQUNoQixDQUFDO0dBQ1csZUFBZSxDQUFJO0FBQW5CLDBDQUFlIn0=