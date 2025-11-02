import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { Request } from 'express';
import { ApiResult } from '../../../../../common/pojo/ApiResult';
import Utils = require("../../../../../utils/index");


@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    async catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();

        const res = ctx.getResponse();

        const request = ctx.getRequest<Request>();

        const status = exception.getStatus();


        /**
         * 白名单访问检测
         */
         const ip: string = Utils.getClientIp(request);


        switch (status) {
            case 400:
                res.json(new ApiResult(HttpStatus.BAD_REQUEST, JSON.parse(exception.message), "请求参数错误"));
                break;
            case 403:
                res.json(new ApiResult(HttpStatus.FORBIDDEN, ip, "授权不通过请重新登陆"));
                break;
            case 404:
                res.json(new ApiResult(HttpStatus.NOT_FOUND, null, "请求不存在"));
                break;
            case 501:
                res.json(new ApiResult(HttpStatus.NOT_IMPLEMENTED, null, "token过期,请重新登陆"));
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
}