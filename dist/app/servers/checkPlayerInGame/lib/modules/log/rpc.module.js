"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcModule = void 0;
const common_1 = require("@nestjs/common");
const rpcHttp_controller_1 = require("./rpcHttp.controller");
let RpcModule = class RpcModule {
};
RpcModule = __decorate([
    (0, common_1.Module)({
        controllers: [rpcHttp_controller_1.RpcHttpController],
        providers: [],
    })
], RpcModule);
exports.RpcModule = RpcModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnBjLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2NoZWNrUGxheWVySW5HYW1lL2xpYi9tb2R1bGVzL2xvZy9ycGMubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDJDQUF1QztBQUN2Qyw2REFBMEQ7QUFNMUQsSUFBYSxTQUFTLEdBQXRCLE1BQWEsU0FBUztDQUNyQixDQUFBO0FBRFksU0FBUztJQUpyQixJQUFBLGVBQU0sRUFBQztRQUNKLFdBQVcsRUFBRSxDQUFDLHNDQUFpQixDQUFDO1FBQ2hDLFNBQVMsRUFBRSxFQUFFO0tBQ2hCLENBQUM7R0FDVyxTQUFTLENBQ3JCO0FBRFksOEJBQVMifQ==