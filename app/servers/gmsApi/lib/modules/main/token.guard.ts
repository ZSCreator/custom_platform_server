import {Injectable, CanActivate, ExecutionContext, HttpException} from '@nestjs/common';
import {Request} from 'express';

@Injectable()
export class TokenGuard implements CanActivate {
    constructor() { }
    async canActivate(context: ExecutionContext,): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        /**
         * 白名单访问检测
         */
        let ipAddress;
        let headers = request.headers;

        let forwardedIpsStr = headers['x-request-ip'] || headers['x-forwarded-for'];
        forwardedIpsStr ? ipAddress = forwardedIpsStr : ipAddress = null;
        if (!ipAddress) {
            ipAddress = request.connection.remoteAddress;
        }
        let ip = ipAddress;
        ip = ip.split(',')[0];
        ip = ip.split(':').slice(-1)[0];

        let token = headers.token;


        if (!token) {
            throw new HttpException('token过期', 501)
        }

        let path = request.path;

        request.body.ip = ip;
        request.body.token = token;
        request.body.path = path;

        return true;
    }
}
