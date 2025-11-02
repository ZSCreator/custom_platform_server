import { Controller, Post, Get, Body } from "@nestjs/common";
import { ThirdService } from "../service/third.service";
import MiddlewareEnum = require('../../const/middlewareEnum');
import {configure, Logger, getLogger} from 'pinus';

configure({
    appenders: {
        "console": {
            "type": "console"
        },
        "thirdHttp": {
            "type": "dateFile",
            "filename": "/data/logs/thirdHttp",
            "layout": {
                "type": "pattern",
                "pattern": "|%d|%p|%c|%m|"
            },
            "alwaysIncludePattern": true,
            "pattern": "_yyyy-MM-dd.log"
        },
        "thirdHttp_call": {
            "type": "dateFile",
            "filename": "/data/logs/thirdHttp_call",
            "layout": {
                "type": "pattern",
                "pattern": "|%d|%p|%c|%m|"
            },
            "alwaysIncludePattern": true,
            "pattern": "_yyyy-MM-dd.log"
        },
        "thirdHttp_game_record": {
            "type": "dateFile",
            "filename": "/data/logs/thirdHttp_game_record",
            "layout": {
                "type": "pattern",
                "pattern": "|%d|%p|%c|%m|"
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
        thirdHttp: {
            "appenders": [
                "console",
                "thirdHttp"
            ],
            "level": "warn",
            "enableCallStack": true
        },
        thirdHttp_call: {
            "appenders": [
                "console",
                "thirdHttp_call"
            ],
            "level": "warn",
            "enableCallStack": true
        },
        thirdHttp_game_record: {
            "appenders": [
                "console",
                "thirdHttp_game_record"
            ],
            "level": "warn",
            "enableCallStack": true
        }
    },
});


/**
 * 第三方平台业务层
 */
@Controller('third')
export class ThirdController {
    logger: Logger;
    thirdHttp_call: Logger;
    reqMap: Map<string, number> = new Map();
    maxReq = 50;
    reqCount: number = 0;
    constructor(
        private readonly thirdService: ThirdService
    ) {
        this.logger = getLogger('thirdHttp');
        this.thirdHttp_call = getLogger('thirdHttp_call');


    }



    /**
     *  拉取游戏记录
     * @param str
     */
    @Post('getGameRecord')
    async getGameRecord(@Body() str: any): Promise<any> {
        console.log("getGameRecord", str);

        let hadAdded = false;

        try {
            const param = str.param;
            const agent = str.agent;

            if (this.reqCount > this.maxReq) {
                this.logger.error(`拉取游戏记录失败:代理${agent},reqCount : ${this.reqCount} ,maxReq : ${this.maxReq} `);
                return { s: 109, m: "/getGameRecord", d: { code: MiddlewareEnum.LA_DAN_LOSE.status, status: MiddlewareEnum.LA_DAN_LOSE.status } }
            }

            if (!agent || !param || !param.startTime || !param.endTime) {
                return { s: 109, m: "/getGameRecord", d: { code: MiddlewareEnum.VALIDATION_ERROR.status, status: MiddlewareEnum.VALIDATION_ERROR.msg } }
            }

            const startTime = Number(param.startTime);
            const endTime = Number(param.endTime);

            // 如果参数不符合规则
            if (typeof startTime !== 'number' || typeof endTime !== 'number' || startTime <= 0 || endTime <= 0 || (endTime - startTime) <= 0) {
                return { s: 109, m: "/getGameRecord", d: { code: MiddlewareEnum.GAME_LIMIT_ERROR.status, status: MiddlewareEnum.GAME_LIMIT_ERROR.msg } }
            }

            // 如果是租户拉单 则五分钟只能拉一次
            // if (this.reqMap.has(agent) && (Date.now() - this.reqMap.get(agent) < 5 * 60 * 1000)) {
            //     return { s: 106, m: "/getGameRecord", d: { code: MiddlewareEnum.GAME_LIMIT_ERROR.status, status: MiddlewareEnum.GAME_LIMIT_ERROR.msg } }
            // }


            this.reqCount++;
            hadAdded = true;
            const result = await this.thirdService.getGameRecord(agent, startTime, endTime);

            this.reqMap.set(agent, Date.now());
            console.log("getGameRecord", agent, '拉单成功');
            return result;
        } catch (error) {
            this.logger.error(`拉取游戏记录 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.DATA_NOT_EXIST.status;
            return { s: 109, m: "/getGameRecord", d: { code: status, status: MiddlewareEnum.LA_DAN_LOSE.status } }
        }finally{
            if(hadAdded){
                this.reqCount--;
            }
        }

    }



    /**
     *  拉取游戏记录
     * @param str
     */
    @Post('getGameRecordForPlatformName')
    async getGameRecordForPlatformName(@Body() str: any): Promise<any> {
        console.log("getGameRecordForPlatformName", str);

        let hadAdded = false;

        try {
            const param = str.param;
            const agent = str.agent;

            if (this.reqCount > 30) {
                return { s: 110, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.LA_DAN_LOSE.status, status: MiddlewareEnum.LA_DAN_LOSE.status } }
            }

            if (!agent || !param || !param.startTime || !param.endTime) {
                return { s: 110, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.VALIDATION_ERROR.status, status: MiddlewareEnum.VALIDATION_ERROR.msg } }
            }

            const startTime = Number(param.startTime);
            const endTime = Number(param.endTime);

            // 如果参数不符合规则
            if (typeof startTime !== 'number' || typeof endTime !== 'number' || startTime <= 0 || endTime <= 0 || (endTime - startTime) <= 0) {
                return { s: 110, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.GAME_LIMIT_ERROR.status, status: MiddlewareEnum.GAME_LIMIT_ERROR.msg } }
            }

            // 如果是租户拉单 则五分钟只能拉一次
            // if (this.reqMap.has(agent) && (Date.now() - this.reqMap.get(agent) < 5 * 60 * 1000)) {
            //     return { s: 106, m: "/getGameRecord", d: { code: MiddlewareEnum.GAME_LIMIT_ERROR.status, status: MiddlewareEnum.GAME_LIMIT_ERROR.msg } }
            // }


            this.reqCount++;
            hadAdded = true;
            const result = await this.thirdService.getGameRecordForPlatformName(agent, startTime, endTime);

            this.reqMap.set(agent, Date.now());
            console.log("getGameRecordForPlatformName", agent, '拉单成功');
            return result;
        } catch (error) {
            this.logger.error(`拉取游戏记录 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.DATA_NOT_EXIST.status;
            return { s: 110, m: "/getGameRecordForPlatformName", d: { code: status, status: MiddlewareEnum.LA_DAN_LOSE.status } }
        }finally{
            if(hadAdded){
                this.reqCount--;
            }
        }
    }

    /**
     *  第三方获取游戏记录详情
     * @param str
     */
    @Post('getGameRecordResult')
    async getGameRecordResult(@Body() str: any): Promise<any> {
        console.log("getGameRecordResult", str);

        let hadAdded = false;

        try {
            const param = str.param;
            const agent = str.agent;



            if (!agent || !param ) {
                return { s: 111, m: "/getGameRecordResult", d: { code: MiddlewareEnum.VALIDATION_ERROR.status, status: MiddlewareEnum.VALIDATION_ERROR.msg } }
            }

            const gameOrder = param.gameOrder;
            const createTimeDate = param.createTimeDate;
            const groupRemark = param.groupRemark;
            if (!gameOrder) {
                return { s: 111, m: "/getGameRecordResult", d: { code: MiddlewareEnum.ORDERID_NOT_EXIST.status, status: MiddlewareEnum.ORDERID_NOT_EXIST.msg } }
            }
            const result = await this.thirdService.getGameRecordResult(agent, gameOrder, createTimeDate, groupRemark);
            return result;
        } catch (error) {
            this.logger.error(`拉取游戏记录 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.DATA_NOT_EXIST.status;
            return { s: 111, m: "/getGameRecordResult", d: { code: status, status: MiddlewareEnum.LA_DAN_LOSE.status } }
        }finally{
            if(hadAdded){
                this.reqCount--;
            }
        }
    }


}