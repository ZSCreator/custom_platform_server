import {Injectable, NestMiddleware, } from '@nestjs/common';
import {Request, Response} from 'express';
import  Encryption = require ('../../../../common/encryption');
import  MiddlewareEnum = require("../const/middlewareEnum");


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: Function) {
        const {
            agent,
            timestamp,
            key,
            param
        } = req.body;

        /**
         * agent 参数
         */
        if (!agent) {
           return res.send({s: 100, m: "/xxxxxx", d: {code:  MiddlewareEnum.VALIDATION_LOSE.status}});
        }
        /**
         * timestamp 参数
         */
        if (!timestamp) {
            return res.send( {s: 100, m: "/xxxxxx", d: {code:  MiddlewareEnum.VALIDATION_LOSE.status}});
        }
        const md5 = Encryption.MD5KEY(agent, timestamp);

        /**
         * 验证key是否存在
         */
        if(!key){
            return res.send({s: 100, m: "/xxxxxx", d: {code:  MiddlewareEnum.VALIDATION_LOSE.status}});
        }

        if ( md5 != key) {
            return res.send({s: 100, m: "/xxxxxx", d: {code:  MiddlewareEnum.VALIDATION_ERROR.status}});
        }
        /**
         * 验证是否存在param 参数
         */
        if (!param) {
            return res.send({s: 100, m: "/xxxxxx", d: {code:  MiddlewareEnum.DATA_NOT_EXIST.status}});
        }

        try{
            req.body.param = Encryption.httpUrlEnCryPtionObjectParam(param);
            next();
        }catch (e) {
            return res.send({s: 100, m: "/xxxxxx", d:  {code:  MiddlewareEnum.AES_ERROR }});
        }

    }
}