"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const logger_middleware_1 = require("../logger.middleware");
const third_module_1 = require("../../third/third.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(logger_middleware_1.LoggerMiddleware)
            .forRoutes('third');
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [third_module_1.ThirdModule],
        controllers: [],
        providers: [],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dhbWVSZWNvcmRIdHRwL2xpYi9tb2R1bGVzL21haW4vYXBwLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwyQ0FBdUY7QUFDdkYsNERBQXdEO0FBQ3hELDJEQUF1RDtBQVl2RCxJQUFhLFNBQVMsR0FBdEIsTUFBYSxTQUFTO0lBQ2xCLFNBQVMsQ0FBQyxRQUE0QjtRQUNsQyxRQUFRO2FBQ0gsS0FBSyxDQUFDLG9DQUFnQixDQUFDO2FBQ3ZCLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1QixDQUFDO0NBRUosQ0FBQTtBQVBZLFNBQVM7SUFWckIsSUFBQSxlQUFNLEVBQUM7UUFDTixPQUFPLEVBQUUsQ0FBQywwQkFBVyxDQUFDO1FBQ3RCLFdBQVcsRUFBRSxFQUFHO1FBQ2hCLFNBQVMsRUFBRSxFQUNWO0tBQ0YsQ0FBQztHQUtXLFNBQVMsQ0FPckI7QUFQWSw4QkFBUyJ9