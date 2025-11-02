"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThirdModule = void 0;
const common_1 = require("@nestjs/common");
const third_controller_1 = require("./controller/third.controller");
const goldCoinChangeWarningOrder_service_1 = require("./service/goldCoinChangeWarningOrder.service");
const third_service_1 = require("./service/third.service");
let ThirdModule = class ThirdModule {
};
ThirdModule = __decorate([
    (0, common_1.Module)({
        controllers: [third_controller_1.ThirdController],
        providers: [third_service_1.ThirdService, goldCoinChangeWarningOrder_service_1.GoldCoinChangeWarningOrderService],
    })
], ThirdModule);
exports.ThirdModule = ThirdModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhpcmQubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvbmVzdEh0dHAvbGliL3RoaXJkL3RoaXJkLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwyQ0FBd0M7QUFDeEMsb0VBQWdFO0FBQ2hFLHFHQUFpRztBQUNqRywyREFBdUQ7QUFNdkQsSUFBYSxXQUFXLEdBQXhCLE1BQWEsV0FBVztDQUFJLENBQUE7QUFBZixXQUFXO0lBSnZCLElBQUEsZUFBTSxFQUFDO1FBQ0osV0FBVyxFQUFFLENBQUMsa0NBQWUsQ0FBQztRQUM5QixTQUFTLEVBQUUsQ0FBQyw0QkFBWSxFQUFFLHNFQUFpQyxDQUFDO0tBQy9ELENBQUM7R0FDVyxXQUFXLENBQUk7QUFBZixrQ0FBVyJ9