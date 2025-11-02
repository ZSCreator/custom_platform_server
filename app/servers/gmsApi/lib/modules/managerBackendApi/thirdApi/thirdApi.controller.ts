import { Controller, Post, Request, Body, Session, UseGuards } from "@nestjs/common";
import { ThirdApiService } from "./thirdApi.service";
import { getLogger } from 'pinus-logger';
import { TokenGuard } from "../../main/token.guard";
import {GmsApiResultVO} from "../../../const/GmsApiResult.vo";

/**
 * 管理后台
 */
@Controller('thirdApi')
@UseGuards(TokenGuard)
export class ThirdApiController {
    logger: any;

    constructor(private readonly thirdApiService: ThirdApiService) {
        this.logger = getLogger('http', __filename);
    }

    /**
     * 第三方 API 的相关功能， 获取游戏记录
     * @param str
     */
    @Post('getGameRecrodApi')
    async getGameRecrodApi(@Body() str: any): Promise<any> {
        console.log("getGameRecrodApi", str)
        try {
            // const param = str.param;
            let { roundId ,  startTime ,endTime, page , managerAgent , thirdUid ,nid ,pageSize ,gameOrder , rootAgent ,managerUid} = str;
            if(!page){
                page = 1;
            }
            if(!pageSize){
                pageSize = 100;
            }
            const result = await this.thirdApiService.getGameRecrodApiForMoreTable(managerUid , rootAgent , page, startTime, endTime, managerAgent, thirdUid, nid ,pageSize ,gameOrder ,roundId);
            return {code: 200 ,result};
        } catch (error) {
            this.logger.error(`第三方 API 的相关功能， 获取游戏记录 :${error}`);
            return { code: 500, error: error }
        }

    }


    /**
     * 代理玩家列表
     * @param str
     */
    @Post('getAgentPlayers')
    async getAgentPlayers(@Body() str: any): Promise<any> {
        console.log("getAgentPlayers", str)
        try {
            // const param = str.param;
            let { managerUid ,rootAgent, page , managerAgent , thirdUid  ,pageSize, uid ,ip } = str;
            if(!page){
                page = 1;
            }
            if(uid || thirdUid || ip){
                const result = await this.thirdApiService.queryPlayer( uid,managerUid,rootAgent, managerAgent, thirdUid, page ,pageSize ,ip);
                return result;
            }else{
                const result = await this.thirdApiService.getAgentPlayers( uid,managerUid,rootAgent, managerAgent, thirdUid, page ,pageSize ,ip );
                return result;
            }
        } catch (error) {
            this.logger.error(`第三方 API 的相关功能， 获取游戏记录 :${error}`);
            return { code: 500, error: error ? error : "获取失败"  }
        }

    }





    /**
     * api 获取第三方上下分警告设置
     */
    @Post('getWarnGoldCfg')
    async getWarnGoldCfg(@Body() str: any): Promise<any> {

        try {
            /**
             * 列表集合查询
             */
            const data = await this.thirdApiService.getWarnGoldCfg();
            return { code: 200, data };
        } catch (error) {
            this.logger.error(`获取第三方上下分警告设置 :${error}`);
            return { code: 500, error: error }
        }

    }


    /**
     * api 设置第三方上下分警告设置
     */
    @Post('setWarnGoldCfg')
    async setWarnGoldCfg(@Body() str: any): Promise<any> {

        try {
            const { warnGoldCfg }  = str;
            if (!Array.isArray(warnGoldCfg)) {
                return { code: 500, msg: "应传入数组" };
            }

            const checkResult = warnGoldCfg.every(({ startGold, endGold, targetGold, status }) =>
                typeof startGold === "number" &&
                typeof endGold === "number" &&
                typeof targetGold === "number" &&
                typeof status === "number"
            );

            if (!checkResult) {
                return { code: 500, msg: "数组每项参数应含 startGold endGold targetGold status, 且均为整数类型" };
            }

            await this.thirdApiService.setWarnGoldCfg(warnGoldCfg);
            return { code: 200, msg:"修改成功" };
        } catch (error) {
            this.logger.error(`获取第三方上下分警告设置 :${error}`);
            return { code: 500, error: error }
        }

    }


    /**
     * api 获取第三方上下分记录
     */
    @Post('getThirdGoldRecord')
    async getThirdGoldRecord(@Body() str: any): Promise<any> {
        try {
            let { page, uid, startTime, endTime, pageSize } = str;
            pageSize = pageSize ? pageSize : 20;
            if (!page || !pageSize) {
                return { code: 200, msg: "参数不正确" };
            }
            const result = await this.thirdApiService.getThirdGoldRecord(page , uid , pageSize  , startTime  , endTime );
            return { code: 200, result };
        } catch (error) {
            return { code: 500, error: '获取失败' };
        }

    }



    /**
     * api 设置是否通过平台下分操作
     */
    @Post('setPlayerWarnGold')
    async setPlayerWarnGold(@Body() str: any): Promise<any> {
        try {
            let { orderId, uid, remark} = str;
            await this.thirdApiService.setPlayerWarnGold(orderId, uid, remark);
            return { code: 200, msg:'操作成功' };
        } catch (error) {
            return { code: 500, error: '操作失败' };
        }

    }




    /**
     * 获取当天在线人数
     *
     */
    @Post('onlinePlayers')
    async onlinePlayers(@Body() str: any): Promise<any> {
        try {
            let { page , pageSize} = str;
            page  = page ? page : 1;
            const { games ,playerList , length } = await this.thirdApiService.onlinePlayers(page , pageSize);
            return { code: 200, games ,playerList , length };
        } catch (error) {
            return { code: 500, error: '操作失败' };
        }

    }


    /**
     * 登陆总人数
     *
     */
    @Post('loginPlayers')
    async loginPlayers(@Body() str: any): Promise<any> {
        try {
            let { page , pageSize} = str;
            page  = page ? page : 1;
            const { playerList , length } =  await this.thirdApiService.loginPlayers(page , pageSize);
            return { code: 200, playerList , length };
        } catch (error) {
            return { code: 500, error: '操作失败' };
        }
    }

    /**
     * 新增用户人数
     *
     */
    @Post('createPlayers')
    async createPlayers(@Body() str: any): Promise<any> {
        try {
            let {page , pageSize} = str;
            page  = page ? page : 1;
            const { playerList , length } =  await this.thirdApiService.createPlayers(page , pageSize);
            return { code: 200, playerList , length };
        } catch (error) {
            return { code: 500, error: '操作失败' };
        }
    }


    /**
     *
     * 玩家输赢监控
     */
    @Post('agentPlayerGameRecord')
    async agentPlayerGameRecord(@Body() str: any): Promise<any> {
        try {
            let { managerAgent , rootAgent, startTime , endTime , thirdUid , nid  } = str;
            const num = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
            if (num > 31) {
                return GmsApiResultVO.ERROR(null, "时间请不要超过一个月");
            }
            if(!rootAgent || !managerAgent){
                return { code: 500, error:  '后台账号信息不正确，请重新登陆' };
            }
            const total =  await this.thirdApiService.agentPlayerGameRecord(managerAgent , rootAgent, startTime , endTime ,thirdUid , nid  );
            return { code: 200, total };
        } catch (error) {
            return { code: 500, error: error ? error : '操作失败' };
        }
    }




}