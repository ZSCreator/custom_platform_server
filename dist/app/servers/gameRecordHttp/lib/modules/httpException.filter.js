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
const MiddlewareEnum = require("../const/middlewareEnum");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();
        if (status == 404) {
            return response.send({ s: 100, m: "/xxxxxx", d: { code: MiddlewareEnum.NOT_FOUND_REQUEST.status } });
        }
        response
            .status(status)
            .json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
};
HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(common_2.HttpException)
], HttpExceptionFilter);
exports.HttpExceptionFilter = HttpExceptionFilter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cEV4Y2VwdGlvbi5maWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nYW1lUmVjb3JkSHR0cC9saWIvbW9kdWxlcy9odHRwRXhjZXB0aW9uLmZpbHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwyQ0FBdUU7QUFDdkUsMkNBQStDO0FBQy9DLDBEQUE0RDtBQUc1RCxJQUFhLG1CQUFtQixHQUFoQyxNQUFhLG1CQUFtQjtJQUM1QixLQUFLLENBQUMsU0FBd0IsRUFBRSxJQUFtQjtRQUMvQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDaEMsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ25DLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNqQyxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDckMsSUFBRyxNQUFNLElBQUksR0FBRyxFQUFDO1lBQ1YsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRyxFQUFDLElBQUksRUFBRyxjQUFjLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFDLEVBQUMsQ0FBQyxDQUFDO1NBQ3pHO1FBQ0QsUUFBUTthQUNILE1BQU0sQ0FBQyxNQUFNLENBQUM7YUFDZCxJQUFJLENBQUM7WUFDRixVQUFVLEVBQUUsTUFBTTtZQUNsQixTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7WUFDbkMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHO1NBQ3BCLENBQUMsQ0FBQztJQUNYLENBQUM7Q0FDSixDQUFBO0FBakJZLG1CQUFtQjtJQUQvQixJQUFBLGNBQUssRUFBQyxzQkFBYSxDQUFDO0dBQ1IsbUJBQW1CLENBaUIvQjtBQWpCWSxrREFBbUIifQ==