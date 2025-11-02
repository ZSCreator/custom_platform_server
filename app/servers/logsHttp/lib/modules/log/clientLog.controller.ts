import {Body, Controller, Post} from "@nestjs/common";
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

interface ClientLog {
    // 日志等级
    level: 'warn' | 'debug' | 'error';
    // 包版本
    version: string;
    // 环境
    env: 'android' | 'ios' | 'phone-h5' | 'pc-h5';
    // 时间
    time: Date;
    // 场景
    scene: string;
    // 网络|事件
    from: string;
    // 玩家uid
    uid: string;
    // 信息
    message: string;
}

@Controller('log')
export class ClientLogController {
    logger: any;

    constructor() {
        this.logger = log4js.getLogger('client');
    }

    /**
     * 添加前端游戏日志
     * @param info
     */
    @Post('clientGameLog')
    async getAllGames(@Body() info: ClientLog): Promise<any> {
        if (!info || typeof info !== 'object') {
            return {code: 500};
        }

        this.logger.info(`{"level":"${info.level}","time":"${info.time}","env":"${info.env}","version":"${info.version}","from":"${info.from}","scene":"${info.scene}","uid":"${info.uid}","message":"${info.message}"}`);
        return {code: 200};
    }
}