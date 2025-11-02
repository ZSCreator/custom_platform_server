"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemModule = void 0;
const common_1 = require("@nestjs/common");
const system_controller_1 = require("./system.controller");
const game_controller_1 = require("./game.controller");
const game_service_1 = require("./game.service");
const system_service_1 = require("./system.service");
let SystemModule = class SystemModule {
};
SystemModule = __decorate([
    (0, common_1.Module)({
        controllers: [system_controller_1.SystemController, game_controller_1.GameController],
        providers: [system_service_1.SystemService, game_service_1.GameService],
    })
], SystemModule);
exports.SystemModule = SystemModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9zeXN0ZW0vc3lzdGVtLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwyQ0FBd0M7QUFDeEMsMkRBQXVEO0FBQ3ZELHVEQUFtRDtBQUNuRCxpREFBNkM7QUFDN0MscURBQWlEO0FBTWpELElBQWEsWUFBWSxHQUF6QixNQUFhLFlBQVk7Q0FBSSxDQUFBO0FBQWhCLFlBQVk7SUFKeEIsSUFBQSxlQUFNLEVBQUM7UUFDSixXQUFXLEVBQUUsQ0FBQyxvQ0FBZ0IsRUFBRSxnQ0FBYyxDQUFDO1FBQy9DLFNBQVMsRUFBRSxDQUFDLDhCQUFhLEVBQUUsMEJBQVcsQ0FBQztLQUMxQyxDQUFDO0dBQ1csWUFBWSxDQUFJO0FBQWhCLG9DQUFZIn0=