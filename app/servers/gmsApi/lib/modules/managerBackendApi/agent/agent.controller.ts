import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AgentService } from "./agent.service";
import { getLogger } from 'pinus-logger';
import { TokenGuard } from "../../main/token.guard";
import { HttpCode } from "../../../support/code/HttpCode.enum";
import { CreatePlatform } from "./createPlatform.dto";
import { GmsApiResultVO } from "../../../const/GmsApiResult.vo";
import { AgentList } from "./AgentList.dto";
import { UpdateGoldForPlatform } from "./UpdateGoldForPlatform.dto";
import { UpdateAgentGoldFromPlatform } from "./UpdateAgentGoldFromPlatform.dto";
import { TenantGameOperationalData } from "./TenantGameOperationalData";
import * as moment from "moment";
/**
 * 管理后台
 */
@ApiTags("平台、代理业务相关")
@Controller('agent')
@UseGuards(TokenGuard)
export class AgentController {
    logger: any;
    constructor(private readonly AgentService: AgentService) {
        this.logger = getLogger('http', __filename);
    }

    @ApiOperation({ summary: "创建平台信息", description: "创建新的平台基本信息接口" })
    @Post('createPlatform')
    @ApiResponse({ status: HttpCode.SUCCESS, description: "创建平台信息成功" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "创建平台信息出错" })
    @ApiResponse({ status: HttpCode.Platform_Existence, description: "平台已存在" })
    async createPlatform(@Body() { manager , platform, gold, language }: CreatePlatform): Promise<GmsApiResultVO> {
        try {
            const result = await this.AgentService.createPlatform(manager , platform, gold, language);

            return GmsApiResultVO.SUCCESS(result, "创建平台信息成功");
        } catch (e) {

            if (e instanceof GmsApiResultVO)
                return e;

            this.logger.error(`创建平台信息出错 :${e.stack}`);

            return GmsApiResultVO.ERROR(null, "创建平台信息出错");
        }

    }


    @ApiOperation({ summary: "删除平台信息", description: "删除平台信息基本信息接口" })
    @Post('deletePlatform')
    @ApiResponse({ status: HttpCode.SUCCESS, description: "删除平台信息成功" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "删除平台信息出错" })
    async deletePlatform(@Body() { platform }): Promise<GmsApiResultVO> {
        try {
            await this.AgentService.deletePlatform(platform);

            return GmsApiResultVO.SUCCESS(null, "删除平台信息成功");
        } catch (e) {

            if (e instanceof GmsApiResultVO)
                return e;

            this.logger.error(`删除平台信息出错 :${e.stack}`);

            return GmsApiResultVO.ERROR(null, "删除平台信息出错");
        }

    }

    @ApiResponse({ status: HttpCode.SUCCESS, description: "获取平台信息列表成功" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "获取平台信息列表出错" })
    @ApiOperation({ summary: "平台列表", description: "获取平台信息列表" })
    @Post('platformList')
    async platformList(@Body() { currentPage, pageSize , managerUid }): Promise<any> {
        try {
            const result = await this.AgentService.platformList(currentPage, pageSize , managerUid);
            return GmsApiResultVO.SUCCESS(result, "获取平台信息列表成功");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;

            this.logger.error(`获取平台列表 :${e}`);
            return GmsApiResultVO.ERROR(null, "获取平台信息列表出错")
        }

    }

    @ApiOperation({ summary: "创建代理", description: "为平台创建代理" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "创建代理成功" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "创建代理出错" })
    @ApiResponse({ status: HttpCode.Agent_Existence, description: "租户已存在" })
    @ApiResponse({ status: HttpCode.Platfrom_Nonexistence, description: "平台不存在" })
    @ApiResponse({ status: HttpCode.PlatformGold_Not_Enough, description: "平台金币不足" })
    @Post('createAgentForPlatform')
    async createAgentForPlatform(@Body() { manager , managerUid, platform, gold, language }): Promise<GmsApiResultVO> {
        try {
            if(!managerUid){
                return GmsApiResultVO.ERROR(null, "后台账户信息过期")
            }
            await this.AgentService.createAgentForPlatform(manager , managerUid, platform, gold, language);

            return GmsApiResultVO.SUCCESS(null, "创建代理成功");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;

            this.logger.error(`获取玩家列表 :${e}`);

            return GmsApiResultVO.ERROR(null, "创建代理出错")
        }

    }



    @ApiOperation({ summary: "删除代理", description: "为平台删除代理" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "删除代理成功" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "删除代理出错" })
    @ApiResponse({ status: HttpCode.Agent_Existence, description: "租户已存在" })
    @ApiResponse({ status: HttpCode.Platfrom_Nonexistence, description: "平台不存在" })
    @Post('deleteAgentForPlatform')
    async deleteAgentForPlatform(@Body() { managerUid, agentUid,  }): Promise<GmsApiResultVO> {
        try {

            await this.AgentService.deleteAgentForPlatform(managerUid, agentUid );

            return GmsApiResultVO.SUCCESS(null, "删除代理成功");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;

            this.logger.error(`获取玩家列表 :${e}`);

            return GmsApiResultVO.ERROR(null, "删除代理出错")
        }

    }


    @ApiOperation({ summary: "代理列表", description: "获取指定平台下的代理列表信息" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "获取代理列表成功" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "获取代理列表出错" })
    @Post('agentListFromPlatform')
    async agentList(@Body() { currentPage, pageSize, platfromUid , rootAgent}: AgentList): Promise<GmsApiResultVO> {
        try {
            const result = await this.AgentService.agentListFromPlatform(platfromUid,rootAgent, currentPage, pageSize);

            return GmsApiResultVO.SUCCESS(result, "获取代理列表成功");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;

            this.logger.error(`大区下面的玩家列表 :${e}`);
            return GmsApiResultVO.ERROR(null, "获取代理列表出错")
        }

    }

    @ApiOperation({ summary: "创建后台账号给代理绑定获取代理列表", description: "获取指定平台下的代理列表信息" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "获取代理列表成功" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "获取代理列表出错" })
    @Post('bingManagerAgentList')
    async bingManagerAgentList(@Body() {  platfromUid }: AgentList): Promise<GmsApiResultVO> {
        try {
            const result = await this.AgentService.bingManagerAgentList(platfromUid);
            return GmsApiResultVO.SUCCESS(result, "获取代理列表成功");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;

            this.logger.error(`大区下面的玩家列表 :${e}`);
            return GmsApiResultVO.ERROR(null, "获取代理列表出错")
        }

    }



    @ApiOperation({ summary: "修改平台金币", description: "修改平台金币" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "修改平台金币成功" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "修改平台金币出错" })
    @Post('updateGoldForPlatform')
    async updateGoldForPlatform(@Body() { manager, platfromUid, gold }: UpdateGoldForPlatform): Promise<GmsApiResultVO> {
        try {
            await this.AgentService.updateGoldForPlatform(manager, gold, platfromUid);
            return GmsApiResultVO.SUCCESS(null, "修改平台金币成功");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;
            return GmsApiResultVO.ERROR(null, "修改平台金币出错");
        }
    }

    @ApiOperation({ summary: "修改代理金币", description: "修改指定平台下代理的金币" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "修改代理金币成功" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "修改代理金币出错" })
    @ApiResponse({ status: HttpCode.Platfrom_Nonexistence, description: "平台不存在" })
    @ApiResponse({ status: HttpCode.PlatformGold_Not_Enough, description: "平台金币不足" })
    @ApiResponse({ status: HttpCode.Platfrom_Nonexistence, description: "平台不存在" })
    @Post('updateAgentGoldFromPlatform')
    async updateAgentGoldFromPlatform(@Body() { manager, gold, plateform, uid }: UpdateAgentGoldFromPlatform): Promise<GmsApiResultVO> {
        try {
            await this.AgentService.addPlatformAgentGold(manager , plateform, gold, uid);
            return GmsApiResultVO.SUCCESS(null, "修改代理金币成功");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;
            this.logger.error(`修改代理金币出错: ${e.stack}`);
            return GmsApiResultVO.ERROR(null, "修改代理金币出错");
        }
    }


    /**
     * 查看所有给平台和代理加金币的记录
     * @param str
     */
    @ApiOperation({ summary: "查看平台给代理上分记录", description: "获取上下分记录" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "获取上下分记录成功" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "获取上下分记录出错" })
    @Post('getPlatformToAgentGoldRecordList')
    async getPlatformToAgentGoldRecordList(@Body() { currentPage, pageSize, managerAgent , agentSearch}): Promise<any> {
        try {
            const result = await this.AgentService.getPlatformToAgentGoldRecordList(managerAgent, agentSearch, currentPage, pageSize);
            return { code: 200, result };
        } catch (error) {
            this.logger.error(`查看平台和给平台添加金币的记录 :${error}`);
            return { code: 500, error }
        }
    }


    /**
     * 查看代理查看下面所有玩家上下分
     * @param str
     */
    @ApiOperation({ summary: "查看平台给代理上分记录", description: "获取上下分记录" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "获取上下分记录成功" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "获取上下分记录出错" })
    @Post('getAgentForPlayerGoldRecordList')
    async getAgentForPlayerGoldRecordList(@Body() { page, pageSize, uid , startTime , endTime, managerAgent  }): Promise<any> {
        try {
            const result = await this.AgentService.getAgentForPlayerGoldRecordList(managerAgent , page,   pageSize ,startTime , endTime,uid);
            return { code: 200, result };
        } catch (error) {
            this.logger.error(`查看平台和给平台添加金币的记录 :${error}`);
            return { code: 500, error }
        }
    }


    @ApiOperation({ summary: "租户运营数据", description: "租户运营数据" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "获取租户运营数据成功" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "获取租户运营数据出错" })
    @Post('tenantOperationalData')
    async tenantOperationalData(@Body() {  platformUid, currentPage, pageSize , groupRemark } ): Promise<GmsApiResultVO> {
        try {
            let requestStartTime = Date.now();
            if(!platformUid){
                return GmsApiResultVO.ERROR(null, "请选择平台再进行操作");
            }
            if(groupRemark){
                const result = await this.AgentService.selectTenantData( groupRemark );
                let responseEndTime = Date.now();
                return GmsApiResultVO.SUCCESS({requestStartTime ,responseEndTime,...result}, "查询租户运营数据成功");
            }
            const result = await this.AgentService.getTenantOperationalDataList( platformUid, currentPage, pageSize);
            let responseEndTime = Date.now();
            return GmsApiResultVO.SUCCESS({requestStartTime ,responseEndTime ,...result}, "获取租户运营数据成功");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;
            this.logger.error(`获取租户运营数据出错: ${e.stack}`);
            return GmsApiResultVO.ERROR(null, "获取租户运营数据出错");
        }
    }




    @ApiOperation({ summary: "租户游戏运营数据", description: "租户游戏运营数据" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "获取租户游戏运营数据成功" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "获取租户游戏运营数据出错" })
    @Post('tenantGameData')
    async tenantGameData(@Body() { platformUid , groupRemark, currentPage, pageSize }: TenantGameOperationalData): Promise<GmsApiResultVO> {
        try {
            let requestStartTime = Date.now();
            if(!platformUid){
                return GmsApiResultVO.ERROR(null, "请选择平台再进行操作");
            }
            const result = await this.AgentService.getTenantGameData(platformUid, groupRemark, currentPage, pageSize);
            let responseEndTime = Date.now();
            return GmsApiResultVO.SUCCESS({requestStartTime ,responseEndTime ,...result}, "获取租户运营数据成功");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;
            this.logger.error(`获取租户游戏运营数据出错: ${e.stack}`);
            return GmsApiResultVO.ERROR(null, "获取租户游戏运营数据出错");
        }
    }

    @ApiOperation({ summary: "平台盈亏报表", description: "代理盈亏报表数据" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "获取代理盈亏报表数据成功" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "获取代理盈亏报表数据出错" })
    @Post('platformProfitAndLossData')
    async platformProfitAndLossData(@Body() { startTimestamp, endTimestamp, managerAgent, currentPage, pageSize }): Promise<GmsApiResultVO> {
        try {
            let requestStartTime = Date.now();

            if(moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss") > moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss")){
                return GmsApiResultVO.ERROR(null, "时间范围选择错误");
            }
           const  startTime = moment(startTimestamp).format("YYYYMM");
           const  endTime = moment(endTimestamp).format("YYYYMM");

            if(startTime != endTime){
               return GmsApiResultVO.ERROR(null, "时间请不要跨月查询数据报表");
            }

            if( moment(endTimestamp).format("YYYY-MM-DD 23:59:59") > moment().format("YYYY-MM-DD 23:59:59")){
                return GmsApiResultVO.ERROR(null, "结束时间大于了当前时间，请重新选择");
            }

            const result = await this.AgentService.platformProfitAndLossData(managerAgent, startTimestamp, endTimestamp, currentPage, pageSize);
            let responseEndTime = Date.now();
            return GmsApiResultVO.SUCCESS({requestStartTime ,responseEndTime ,...result}, "获取代理盈亏报表成功");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;
            this.logger.error(`获取租户游戏运营数据出错: ${e.stack}`);
            return GmsApiResultVO.ERROR(null, "获取代理盈亏报表数据出错");
        }
    }



    @ApiOperation({ summary: "代理盈亏报表", description: "代理盈亏报表数据" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "获取代理盈亏报表数据成功" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "获取代理盈亏报表数据出错" })
    @Post('agentProfitAndLossData')
    async agentProfitAndLossData(@Body() { managerAgent , startTimestamp, endTimestamp, groupRemark, currentPage, pageSize }): Promise<GmsApiResultVO> {
        try {
            let requestStartTime = Date.now();

            if(moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss") > moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss")){
                return GmsApiResultVO.ERROR(null, "时间范围选择错误");
            }
            const  startTime = moment(startTimestamp).format("YYYYMM");
            const  endTime = moment(endTimestamp).format("YYYYMM");
            if(startTime != endTime){
                return GmsApiResultVO.ERROR(null, "时间请不要跨月查询数据报表");
            }

            if(!groupRemark){
                return GmsApiResultVO.ERROR(null, "查询数据请传代理号");
            }

            const result = await this.AgentService.agentProfitAndLossData(managerAgent ,groupRemark, startTimestamp, endTimestamp, currentPage, pageSize);
            let responseEndTime = Date.now();
            return GmsApiResultVO.SUCCESS({requestStartTime ,responseEndTime ,...result}, "获取代理盈亏报表成功");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;
            this.logger.error(`获取租户游戏运营数据出错: ${e.stack}`);
            return GmsApiResultVO.ERROR(null, "获取代理盈亏报表数据出错");
        }
    }

    /**
     * 历史数据汇总根据代理获取游戏数据
     * @param startTimestamp
     * @param endTimestamp
     * @param platformUid
     * @param currentPage
     * @param pageSize
     */

    @ApiOperation({ summary: "历史数据汇总根据代理获取游戏数据", description: "历史数据汇总根据代理获取游戏数据" })
    @ApiResponse({ status: HttpCode.SUCCESS, description: "历史数据汇总根据代理获取游戏数据" })
    @ApiResponse({ status: HttpCode.BAD_REQUEST, description: "参数错误" })
    @ApiResponse({ status: HttpCode.FAIL, description: "历史数据汇总根据代理获取游戏数据出错" })
    @Post('agentGameRecordData')
    async agentGameRecordData(@Body() { startTimestamp, endTimestamp, groupRemark, currentPage, pageSize }): Promise<GmsApiResultVO> {
        try {
            let requestStartTime = Date.now();
            const num = Math.ceil((endTimestamp - startTimestamp) / (1000 * 60 * 60 * 24));
            if (num > 31) {
                return GmsApiResultVO.ERROR(null, "时间请不要超过一个月");
            }
            if(!groupRemark){
                return GmsApiResultVO.ERROR(null, "代理号不存在");
            }
            const result = await this.AgentService.agentGameRecordData(groupRemark, startTimestamp, endTimestamp, currentPage, pageSize);
            let responseEndTime = Date.now();
            return GmsApiResultVO.SUCCESS({requestStartTime ,responseEndTime ,...result}, "历史数据汇总根据代理获取游戏数据数据成功");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;
            this.logger.error(`获取租户游戏运营数据出错: ${e.stack}`);
            return GmsApiResultVO.ERROR(null, "历史数据汇总根据代理获取游戏数据");
        }
    }

    /**
     * 获取所有平台对应的uid
     */

    @Post('getPlatformUidList')
    async getPlatformUidList(@Body() {}): Promise<GmsApiResultVO> {
        try {
            const platformUidList = await this.AgentService.getPlatformUidList();
            return GmsApiResultVO.SUCCESS(platformUidList, "获取所有平台对应的uid成功");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;
            this.logger.error(`获取所有平台对应的uid: ${e.stack}`);
            return GmsApiResultVO.ERROR(null, "获取所有平台对应的uid");
        }
    }


    /**
     * 获取所有平台对应的分代号
     */
    @Post('getPlatformForAgent')
    async getPlatformForAgent(@Body() { managerAgent , platformName }): Promise<GmsApiResultVO> {
        try {
            if(!managerAgent && !platformName){
                return GmsApiResultVO.ERROR(null, "请传平台的相关参数");
            }
            let name = null;
            if(managerAgent){
                name = managerAgent ;
            }else{
                name = platformName ;
            }
            const agentList = await this.AgentService.getPlatformForAgent(name);
            return GmsApiResultVO.SUCCESS(agentList, "获取所有平台对应的分代号成功");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;
            this.logger.error(`获取所有平台对应的分代号成功uid: ${e.stack}`);
            return GmsApiResultVO.ERROR(null, "获取所有平台对应的分代号失败");
        }
    }


     /** 获取平台的游戏配置列表 */
    @Post('getPlatformGameList')
    async getPlatformGameList(@Body() { managerAgent , platformName }): Promise<GmsApiResultVO> {
        try {
            if(!managerAgent && !platformName){
                return GmsApiResultVO.ERROR(null, "请传平台的相关参数");
            }
            let name = null;
            if(managerAgent){
                name = managerAgent ;
            }else{
                name = platformName ;
            }
            const result = await this.AgentService.getPlatformGameList(name);
            return GmsApiResultVO.SUCCESS(result, "获取所有平台对应的uid成功");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;
            this.logger.error(`获取所有平台对应的uid: ${e.stack}`);
            return GmsApiResultVO.ERROR(null, "获取所有平台对应的uid");
        }
    }



    /** 设置平台的游戏开关 */
    @Post('setPlatformCloseGame')
    async setPlatformCloseGame(@Body() { managerAgent , platformName , closeGameList }): Promise<GmsApiResultVO> {
        try {
            if(!managerAgent && !platformName && !closeGameList){
                return GmsApiResultVO.ERROR(null, "请传平台的相关参数");
            }
            let name = null;
            if(managerAgent){
                name = managerAgent ;
            }else{
                name = platformName ;
            }
            const result = await this.AgentService.setPlatformCloseGame(name , closeGameList);
            return GmsApiResultVO.SUCCESS(result, "设置平台的游戏开关");
        } catch (e) {
            if (e instanceof GmsApiResultVO)
                return e;
            this.logger.error(`获取所有平台对应的uid: ${e.stack}`);
            return GmsApiResultVO.ERROR(null, "设置平台的游戏开关");
        }
    }

}