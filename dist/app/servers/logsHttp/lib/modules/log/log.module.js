"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogModule = void 0;
const common_1 = require("@nestjs/common");
const clientLog_controller_1 = require("./clientLog.controller");
let LogModule = class LogModule {
};
LogModule = __decorate([
    (0, common_1.Module)({
        controllers: [clientLog_controller_1.ClientLogController],
        providers: [],
    })
], LogModule);
exports.LogModule = LogModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2xvZ3NIdHRwL2xpYi9tb2R1bGVzL2xvZy9sb2cubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDJDQUFzRTtBQUN0RSxpRUFBOEQ7QUFNOUQsSUFBYSxTQUFTLEdBQXRCLE1BQWEsU0FBUztDQUNyQixDQUFBO0FBRFksU0FBUztJQUpyQixJQUFBLGVBQU0sRUFBQztRQUNKLFdBQVcsRUFBRSxDQUFDLDBDQUFtQixDQUFDO1FBQ2xDLFNBQVMsRUFBRSxFQUFFO0tBQ2hCLENBQUM7R0FDVyxTQUFTLENBQ3JCO0FBRFksOEJBQVMifQ==