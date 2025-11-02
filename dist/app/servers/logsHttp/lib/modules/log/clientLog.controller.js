"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientLogController = void 0;
const common_1 = require("@nestjs/common");
const log4js = require("log4js");
log4js.configure({
    appenders: {
        "console": {
            "type": "console"
        },
        "client": {
            "type": "dateFile",
            "filename": "/data/logs/client",
            "layout": {
                "type": "pattern",
                "pattern": "|%m"
            },
            "alwaysIncludePattern": true,
            "pattern": "_yyyy-MM-dd.log"
        },
    },
    categories: {
        "default": {
            "appenders": [
                "console",
            ],
            "level": "warn",
            "enableCallStack": true
        },
        "client": {
            "appenders": [
                "console",
                "client"
            ],
            "level": "debug",
            "enableCallStack": true
        }
    },
});
let ClientLogController = class ClientLogController {
    constructor() {
        this.logger = log4js.getLogger('client');
    }
    async getAllGames(info) {
        if (!info || typeof info !== 'object') {
            return { code: 500 };
        }
        this.logger.info(`{"level":"${info.level}","time":"${info.time}","env":"${info.env}","version":"${info.version}","from":"${info.from}","scene":"${info.scene}","uid":"${info.uid}","message":"${info.message}"}`);
        return { code: 200 };
    }
};
__decorate([
    (0, common_1.Post)('clientGameLog'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientLogController.prototype, "getAllGames", null);
ClientLogController = __decorate([
    (0, common_1.Controller)('log'),
    __metadata("design:paramtypes", [])
], ClientLogController);
exports.ClientLogController = ClientLogController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50TG9nLmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9sb2dzSHR0cC9saWIvbW9kdWxlcy9sb2cvY2xpZW50TG9nLmNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQXNEO0FBQ3RELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ2IsU0FBUyxFQUFFO1FBQ1AsU0FBUyxFQUFFO1lBQ1AsTUFBTSxFQUFFLFNBQVM7U0FDcEI7UUFDRCxRQUFRLEVBQUU7WUFDTixNQUFNLEVBQUUsVUFBVTtZQUNsQixVQUFVLEVBQUUsbUJBQW1CO1lBQy9CLFFBQVEsRUFBRTtnQkFDTixNQUFNLEVBQUUsU0FBUztnQkFDakIsU0FBUyxFQUFFLEtBQUs7YUFDbkI7WUFDRCxzQkFBc0IsRUFBRSxJQUFJO1lBQzVCLFNBQVMsRUFBRSxpQkFBaUI7U0FDL0I7S0FFSjtJQUNELFVBQVUsRUFBRTtRQUNSLFNBQVMsRUFBRTtZQUNQLFdBQVcsRUFBRTtnQkFDVCxTQUFTO2FBQ1o7WUFDRCxPQUFPLEVBQUUsTUFBTTtZQUNmLGlCQUFpQixFQUFFLElBQUk7U0FDMUI7UUFDRCxRQUFRLEVBQUU7WUFDTixXQUFXLEVBQUU7Z0JBQ1QsU0FBUztnQkFDVCxRQUFRO2FBQ1g7WUFDRCxPQUFPLEVBQUUsT0FBTztZQUNoQixpQkFBaUIsRUFBRSxJQUFJO1NBQzFCO0tBQ0o7Q0FDSixDQUFDLENBQUM7QUFzQkgsSUFBYSxtQkFBbUIsR0FBaEMsTUFBYSxtQkFBbUI7SUFHNUI7UUFDSSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQU9ELEtBQUssQ0FBQyxXQUFXLENBQVMsSUFBZTtRQUNyQyxJQUFJLENBQUMsSUFBSSxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUNuQyxPQUFPLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBQyxDQUFDO1NBQ3RCO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsS0FBSyxhQUFhLElBQUksQ0FBQyxJQUFJLFlBQVksSUFBSSxDQUFDLEdBQUcsZ0JBQWdCLElBQUksQ0FBQyxPQUFPLGFBQWEsSUFBSSxDQUFDLElBQUksY0FBYyxJQUFJLENBQUMsS0FBSyxZQUFZLElBQUksQ0FBQyxHQUFHLGdCQUFnQixJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztRQUNsTixPQUFPLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBQyxDQUFDO0lBQ3ZCLENBQUM7Q0FDSixDQUFBO0FBUkc7SUFEQyxJQUFBLGFBQUksRUFBQyxlQUFlLENBQUM7SUFDSCxXQUFBLElBQUEsYUFBSSxHQUFFLENBQUE7Ozs7c0RBT3hCO0FBbkJRLG1CQUFtQjtJQUQvQixJQUFBLG1CQUFVLEVBQUMsS0FBSyxDQUFDOztHQUNMLG1CQUFtQixDQW9CL0I7QUFwQlksa0RBQW1CIn0=