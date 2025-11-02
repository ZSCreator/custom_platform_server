import { Controller, Post, Body } from "@nestjs/common";
import { ThirdService } from "../service/third.service";
import Utils = require("../../../../../utils/index");
import MiddlewareEnum = require('../../const/middlewareEnum');
import {configure, Logger, getLogger} from 'pinus';
import changePlayerMoneyRedisDao from "../../../../../common/dao/redis/changePlayerMoney.redis.dao";
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
    constructor(
        private readonly thirdService: ThirdService
    ) {
        this.logger = getLogger('thirdHttp');
        this.thirdHttp_call = getLogger('thirdHttp_call');
    }

    /**
     * 玩家登陆
     * @param str
     */
    @Post('login')
    async login(@Body() str: any): Promise<any> {
        const param = str.param;
        const money: number = Number(param.money);
        const account: string = param.account;
        const KindId: string = String(param.KindID);
        const agent: string = str.agent;
        const language: string = param.language;
        const lineCode: string = param.lineCode;
        const loginHall: boolean = param.loginHall === 'true';
        const backHall: boolean = param.backHall === 'true';
        const timestamp: number = Number(str.timestamp);

        this.thirdHttp_call.warn(`玩家登陆 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},站点:${lineCode}语言:${language} loginHall:${loginHall},KindId:${KindId}`);
        try {
            if (!KindId) {
                return { s: 100, m: "/login", d: { code: MiddlewareEnum.KINDID_NOT_EXIST.status } }
            }

            if (!account) {
                return { s: 100, m: "/login", d: { code: MiddlewareEnum.ACCOUNT_LOSE.status } }
            }

            const result = await this.thirdService.login(agent, money, account, KindId, language,lineCode, loginHall, backHall);
            this.thirdHttp_call.warn(`玩家登陆返回 :account${account},时间:${Utils.cDate(timestamp)}, url:${result.d.url}`)
            return result;
        } catch (error) {
            this.logger.error(`玩家登陆 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ACCOUNT_GET_LOSE.status;
            return { s: 100, m: "/login", d: { code: status } }
        }

    }

    /**
     * 查询玩家可上下分
     * @param str
     */

    @Post('checkPlayerMoney')
    async checkPlayerMoney(@Body() str: any): Promise<any> {
        try {
            const param = str.param;
            const agent = str.agent;
            const account: string = String(param.account);
            this.thirdHttp_call.warn(`查询玩家可上下分:account: ${account},时间:${Utils.cDate()},代理:${agent}`);
            if (!account) {
                return { s: 101, m: "/checkPlayerMoney", d: { code: MiddlewareEnum.ACCOUNT_LOSE.status } };
            }
            const result = await this.thirdService.checkPlayerMoney(account, agent);
            return result;
        } catch (error) {
            this.logger.error(`查询玩家可上下分 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ACCOUNT_GET_LOSE.status;
            return { s: 101, m: "/checkPlayerMoney", d: { code: status } }
        }

    }

    /**
     *  给玩家上分
     * @param str
     */
    @Post('addPlayerMoney')
    async addPlayerMoney(@Body() str: any): Promise<any> {
        const param = str.param;
        const agent = str.agent;
        const timestamp = Number(str.timestamp);
        const account: string = param.account;
        const money: number = Number(param.money);
        const orderid: string = param.orderid;
        this.thirdHttp_call.warn(`第三方请求给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},money:${money}`);
        try {
            if (!agent || !account) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ACCOUNT_LOSE.msg} | 上分异常 | 参数不全`);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.ACCOUNT_LOSE.status } };
            }

            if (!orderid) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ORDERID_NOT_EXIST.msg} | 上分异常 | orderId已存在`)
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.ORDERID_NOT_EXIST.status } };
            }
            if (typeof money !== 'number' || isNaN(money) || money <= 0) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ORDERID_RULE_ERROR.msg} | 上分异常 | 上分金币不正确`)
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.ORDERID_RULE_ERROR.status } };
            }

            // 是否有人再上下分
            const changeExists = await changePlayerMoneyRedisDao.changePlayerMoneySAdd(agent, account);

            if (!changeExists) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ORDERID_RULE_ERROR.msg} | 上分异常 | 上下分正在处理中`);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.UP_DOWN_MONEY_ERROR.status } };
            }

            const result = await this.thirdService.addPlayerMoney(account, money, agent, orderid, timestamp);


            this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag last`);

            return result;
        } catch (error) {
            this.logger.error(`给玩家上分 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ACCOUNT_GET_LOSE.status;
            return { s: 102, m: "/addPlayerMoney", d: { code: status } }
        }

    }

    /**
     *  给玩家下分
     * @param str
     */
    @Post('lowerPlayerMoney')
    async lowerPlayerMoney(@Body() str: any): Promise<any> {
        const param = str.param;
        const agent = str.agent;
        const timestamp = Number(str.timestamp);
        let { account, money, orderid } = param;
        this.thirdHttp_call.warn(`第三方请求玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},money:${money}`);
        try {
            if (!agent || !account) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ACCOUNT_PLAYING.msg} | 下分异常 | 参数不全`);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.ACCOUNT_LOSE.status } };
            }

            if (!orderid) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ACCOUNT_PLAYING.msg} | 下分异常 | 未有orderId`);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.ORDERID_NOT_EXIST.status } };
            }

            // 加入改变集合
            const changeExists = await changePlayerMoneyRedisDao.changePlayerMoneySAdd(agent, account);

            if (!changeExists) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ORDERID_RULE_ERROR.msg} | 下分异常 | 下分未处理完`);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.UP_DOWN_MONEY_ERROR.status } };
            }


            if (money) {
                money = -Number(money);
            } else {
                money = null;
            }
            const result = await this.thirdService.lowerPlayerMoney(account, money, agent, orderid, timestamp);
            this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag last`);
            return result;
        } catch (error) {
            this.logger.error(`给玩家下分 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ACCOUNT_GET_LOSE.status;
            return { s: 103, m: "/lowerPlayerMoney", d: { code: status } }
        }

    }


    /**
     *  检查订单号
     * @param str
     */
    @Post('queryOrderId')
    async queryOrderId(@Body() str: any): Promise<any> {
        try {
            const param = str.param;
            // const timestamp = Number(str.timestamp);
            // const account = param.account;
            // const agent = str.agent;
            const orderid: string = String(param.orderid);
            if (!orderid) {
                return { s: 104, m: "/queryOrderId", d: { code: MiddlewareEnum.ORDERID_NOT_EXIST.status } };
            }
            // const boolean = await this.thirdService.checkOrderId(orderid, agent, timestamp, account);
            // if (boolean == false) {
            //     return { s: 104, m: "/queryOrderId", d: { code: MiddlewareEnum.ORDERID_RULE_ERROR.status } };
            // }
            const result = await this.thirdService.queryOrderId(orderid);
            return result;
        } catch (error) {
            this.logger.error(`检查订单号 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ORDERID_NOT_EXIST.status;
            return { s: 104, m: "/queryOrderId", d: { code: status } }
        }

    }


    /**
     *  查询玩家在线状态
     * @param str
     */
    @Post('findPlayerOnline')
    async findPlayerOnline(@Body() str: any): Promise<any> {
        try {
            const param = str.param;
            const account = param.account;
            const agent = str.agent;
            const timestamp = Number(param.timestamp);
            const result = await this.thirdService.findPlayerOnline(agent, account, timestamp);
            return result;
        } catch (error) {
            this.logger.error(`查询玩家在线状态 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ACCOUNT_GET_LOSE.status;
            return { s: 105, m: "/findPlayerOnline", d: { code: status, status: MiddlewareEnum.ACCOUNT_OLINE_ERROR.status } }
        }

    }

    /**
     *  查询玩家总分
     * @param str
     */
    @Post('queryPlayerGold')
    async queryPlayerGold(@Body() str: any): Promise<any> {
        try {
            const param = str.param;
            const account = param.account;
            const agent = str.agent;
            const timestamp = Number(param.timestamp);
            const result = await this.thirdService.queryPlayerGold(agent, account, timestamp);
            return result;
        } catch (error) {
            this.logger.error(`查询玩家总分 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ACCOUNT_GET_LOSE.status;
            return { s: 106, m: "/queryPlayerGold", d: { code: status, status: MiddlewareEnum.ACCOUNT_GET_LOSE.status } }
        }

    }


    /**
     *  踢玩家下线
     * @param str
     */
    @Post('kickPlayer')
    async kickPlayer(@Body() str: any): Promise<any> {
        try {
            const param = str.param;
            const account = param.account;
            const agent = str.agent;
            const timestamp = Number(param.timestamp);
            const result = await this.thirdService.kickPlayer(agent, account, timestamp);
            return result;
        } catch (error) {
            this.logger.error(`踢玩家下线 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ACCOUNT_GET_LOSE.status;
            return { s: 107, m: "/queryPlayerGold", d: { code: status, status: MiddlewareEnum.ACCOUNT_OLINE_ERROR.status } }
        }

    }



    /**
     *  拉取总平台的统计报表
     * @param str
     */
    @Post('getPlatformData')
    async getPlatformData(@Body() str: any): Promise<any> {
        let hadAdded = false;

        try {
            const param = str.param;
            const agent = str.agent;

            // if (this.reqCount > 30) {
            //     return { s: 109, m: "/getPlatformData", d: { code: MiddlewareEnum.LA_DAN_LOSE.status, status: MiddlewareEnum.LA_DAN_LOSE.status } }
            // }

            if (!agent || !param || !param.startTime || !param.endTime) {
                return { s: 108, m: "/getPlatformData", d: { code: MiddlewareEnum.VALIDATION_ERROR.status, status: MiddlewareEnum.VALIDATION_ERROR.msg } }
            }

            const startTime = Number(param.startTime);
            const endTime = Number(param.endTime);

            // 如果参数不符合规则
            if (typeof startTime !== 'number' || typeof endTime !== 'number' || startTime <= 0 || endTime <= 0 || (endTime - startTime) <= 0) {
                return { s: 108, m: "/getPlatformData", d: { code: MiddlewareEnum.GAME_LIMIT_ERROR.status, status: MiddlewareEnum.GAME_LIMIT_ERROR.msg } }
            }

            // 如果是租户拉单 则五分钟只能拉一次
            // if (this.reqMap.has(agent) && (Date.now() - this.reqMap.get(agent) < 5 * 60 * 1000)) {
            //     return { s: 106, m: "/getGameRecord", d: { code: MiddlewareEnum.GAME_LIMIT_ERROR.status, status: MiddlewareEnum.GAME_LIMIT_ERROR.msg } }
            // }


            // this.reqCount++;
            hadAdded = true;
            const result = await this.thirdService.getPlatformData(agent, startTime, endTime);

            // this.reqMap.set(agent, Date.now());
            console.log("getPlatformData", agent, '拉单成功');
            return result;
        } catch (error) {
            this.logger.error(`拉取游戏记录 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.DATA_NOT_EXIST.status;
            return { s: 108, m: "/getPlatformData", d: { code: status, status: MiddlewareEnum.LA_DAN_LOSE.status } }
        }
    }

}