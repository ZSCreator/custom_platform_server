import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ReportAppService } from "./reportApp.service";
import { getLogger } from 'pinus-logger';
import { TokenGuard } from "../../main/token.guard";

/**
 * 管理后台
 */
@Controller('reportApp')
@UseGuards(TokenGuard)
export class ReportAppController{
    logger: any;
    constructor(private readonly ReportAppService: ReportAppService) {
        this.logger = getLogger('thirdHttp', __filename);
    }

    /**
     * 推广渠道统计
     * @param str
     */
    @Post('platformStatistics')
    async getPlayerCashRecord(@Body() str: any): Promise<any> {
        console.warn("platformStatistics", str)
        try {
            let  { managerAgent } = str ;
            if(!managerAgent){
                return { code: 500, error:"请使用平台账号进行查看" }
            }
            const list  =  await  this.ReportAppService.platformStatistics(managerAgent )
            return {code: 200 , list };
        } catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error }
        }

    }




    /**
     * 根据时间查询代理详情
     * @param str
     */
    @Post('agentStatistics')
    async agentStatistics(@Body() str: any): Promise<any> {
        console.warn("agentStatistics", str)
        try {
            let  { agentName , startTime , endTime } = str ;
            if(!agentName){
                return { code: 500, error:"请选择代理进行查询" }
            }
            const result  =  await  this.ReportAppService.agentStatistics( agentName , startTime , endTime )
            return {code: 200 , result };
        } catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error }
        }

    }



    /**
     * 运营留存报表
     * @param str
     */
    @Post('getOperationalRetention')
    async getOperationalRetention(@Body() str: any): Promise<any> {
        console.warn("getOperationalRetention", str)
        try {
            let  { agentName , startTime , endTime } = str ;
            if(!agentName){
                return { code: 500, error:"请选择代理进行查询" }
            }
            const list  =  await  this.ReportAppService.getOperationalRetention( agentName , startTime , endTime )
            return {code: 200 , list: list };
        } catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error }
        }

    }


    /**
     * 运营留存报表总和统计
     * @param str
     */
    @Post('getOperationalRetentionSum_Time')
    async getOperationalRetentionSum_Time(@Body() str: any): Promise<any> {
        console.warn("getOperationalRetentionSum_Time", str)
        try {
            let  { agentName , startTime , endTime } = str ;
            if(!agentName){
                return { code: 500, error:"请选择代理进行查询" }
            }
            const result  =  await  this.ReportAppService.getOperationalRetentionSum_Time( agentName , startTime , endTime );
            if(result){
                return {code: 200 , result };
            }
            return {code: 200 , result : null };
        } catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error }
        }

    }







}

