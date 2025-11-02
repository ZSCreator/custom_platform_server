"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const ApiResult_1 = require("../../../../../common/pojo/ApiResult");
const Utils = require("../../../../../utils/index");
let HttpExceptionFilter = class HttpExceptionFilter {
    async catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();
        const ip = Utils.getClientIp(request);
        switch (status) {
            case 400:
                res.json(new ApiResult_1.ApiResult(common_1.HttpStatus.BAD_REQUEST, JSON.parse(exception.message), "请求参数错误"));
                break;
            case 403:
                res.json(new ApiResult_1.ApiResult(common_1.HttpStatus.FORBIDDEN, ip, "授权不通过请重新登陆"));
                break;
            case 404:
                res.json(new ApiResult_1.ApiResult(common_1.HttpStatus.NOT_FOUND, null, "请求不存在"));
                break;
            case 501:
                res.json(new ApiResult_1.ApiResult(common_1.HttpStatus.NOT_IMPLEMENTED, null, "token过期,请重新登陆"));
                break;
            default:
                res.status(status)
                    .json({
                    statusCode: status,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                });
                break;
        }
    }
};
HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(common_2.HttpException)
], HttpExceptionFilter);
exports.HttpExceptionFilter = HttpExceptionFilter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cEV4Y2VwdGlvbi5maWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL3N1cHBvcnQvY29kZS9odHRwRXhjZXB0aW9uLmZpbHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwyQ0FBbUY7QUFDbkYsMkNBQStDO0FBRS9DLG9FQUFpRTtBQUNqRSxvREFBcUQ7QUFJckQsSUFBYSxtQkFBbUIsR0FBaEMsTUFBYSxtQkFBbUI7SUFDNUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUF3QixFQUFFLElBQW1CO1FBQ3JELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUVoQyxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFOUIsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLFVBQVUsRUFBVyxDQUFDO1FBRTFDLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQU1wQyxNQUFNLEVBQUUsR0FBVyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRy9DLFFBQVEsTUFBTSxFQUFFO1lBQ1osS0FBSyxHQUFHO2dCQUNKLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBUyxDQUFDLG1CQUFVLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pGLE1BQU07WUFDVixLQUFLLEdBQUc7Z0JBQ0osR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFTLENBQUMsbUJBQVUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLE1BQU07WUFDVixLQUFLLEdBQUc7Z0JBQ0osR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFTLENBQUMsbUJBQVUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQzdELE1BQU07WUFDVixLQUFLLEdBQUc7Z0JBQ0osR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFTLENBQUMsbUJBQVUsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUM7Z0JBQzNFLE1BQU07WUFDVjtnQkFDSSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztxQkFDYixJQUFJLENBQUM7b0JBQ0YsVUFBVSxFQUFFLE1BQU07b0JBQ2xCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtvQkFDbkMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHO2lCQUNwQixDQUFDLENBQUM7Z0JBQ1AsTUFBTTtTQUNiO0lBQ0wsQ0FBQztDQUNKLENBQUE7QUF4Q1ksbUJBQW1CO0lBRC9CLElBQUEsY0FBSyxFQUFDLHNCQUFhLENBQUM7R0FDUixtQkFBbUIsQ0F3Qy9CO0FBeENZLGtEQUFtQiJ9