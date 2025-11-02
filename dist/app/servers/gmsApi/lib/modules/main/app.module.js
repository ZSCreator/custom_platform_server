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
const system_module_1 = require("../system/system.module");
const managerBackendApi_module_1 = require("../managerBackendApi/managerBackendApi.module");
const payServer_module_1 = require("../payServerApi/payServer.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            system_module_1.SystemModule,
            managerBackendApi_module_1.ManagerBackendApiModule,
            payServer_module_1.PayServerModule
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9tYWluL2FwcC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsMkNBQXdDO0FBQ3hDLDJEQUF1RDtBQUN2RCw0RkFBd0Y7QUFDeEYsdUVBQW1FO0FBZW5FLElBQWEsU0FBUyxHQUF0QixNQUFhLFNBQVM7Q0FHckIsQ0FBQTtBQUhZLFNBQVM7SUFickIsSUFBQSxlQUFNLEVBQUM7UUFDSixPQUFPLEVBQUU7WUFDTCw0QkFBWTtZQUNaLGtEQUF1QjtZQUN2QixrQ0FBZTtTQUNsQjtRQUNELFdBQVcsRUFBRSxFQUFFO1FBQ2YsU0FBUyxFQUFFLEVBQUU7S0FDaEIsQ0FBQztHQUtXLFNBQVMsQ0FHckI7QUFIWSw4QkFBUyJ9