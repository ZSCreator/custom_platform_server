import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { CashService } from "./cash.service";
import { getLogger } from 'pinus-logger';
import { TokenGuard } from "../../main/token.guard";

/**
 * 管理后台
 */
@Controller('cash')
@UseGuards(TokenGuard)
export class CashController{
    logger: any;
    constructor(private readonly CashService: CashService) {
        this.logger = getLogger('thirdHttp', __filename);
    }

    /**
     * 获取玩家未审核的提现记录, 根据uid 查询 ，否则默认为未审核的记录
     * @param str
     */
    @Post('getPlayerCashRecord')
    async getPlayerCashRecord(@Body() str: any): Promise<any> {
        console.log("getPlayerCashRecord", str)
        try {
            let  { manager ,uid , page , pageSize ,orderStatus  ,startTime , endTime } = str ;
            page = page ? page : 1 ;
            const { list ,count }  =  await  this.CashService.getPlayerCashRecord(uid , orderStatus,  manager, startTime , endTime, page , pageSize)
            return {code: 200 , list , count }
        } catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error }
        }

    }


    /**
     * 后台用户审核玩家，将该订单进行设置
     * @param str
     */
    @Post('setCashRecordForCheck')
    async setCashRecordForCheck(@Body() str: any): Promise<any> {
        console.log("setCashRecordForCheck", str)
        try {
            let  { manager ,id ,orderStatus ,content } = str ;
            await  this.CashService.setCashRecordForCheck(manager ,id ,orderStatus ,content);
            return {code: 200 , msg: "审核成功" }
        } catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error }
        }

    }


    /**
     * 获取玩家审核通过但是没有汇款的记录
     * @param str
     */
    @Post('getPlayerIsCheckPass')
    async getPlayerIsCheckPass(@Body() str: any): Promise<any> {
        console.log("getPlayerIsCheckPass", str)
        try {
            let  { manager  ,uid ,cashStatus, page , pageSize ,startTime , endTime,  } = str ;
            const { list, count } = await  this.CashService.getPlayerIsCheckPass(manager  ,uid ,cashStatus, page , pageSize ,startTime , endTime,);
            return {code: 200 , list , count }
        } catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error }
        }
    }

    /**
     * 代付接口
     * @param str
     */
    @Post('setCashRecordForCash_DaiFu')
    async setCashRecordForCash_DaiFu(@Body() str: any): Promise<any> {
        console.log("setCashRecordForCash_DaiFu", str)
        try {
            let  { manager ,id ,cashStatus  } = str ;
            if(cashStatus !== 1){
                return  {code: 200 ,msg: "设置代付参数不对" }
            }
            await  this.CashService.setCashRecordForCash_DaiFu(manager ,id ,cashStatus);
            return {code: 200 ,msg: "设置成功" }
        } catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error }
        }

    }


    /**
     * 设置提现订单的汇款状态
     * @param str
     */
    @Post('setCashRecordForCash')
    async setCashRecordForCash(@Body() str: any): Promise<any> {
        console.log("setCashRecordForCash", str)
        try {
            let  { manager ,id ,cashStatus  } = str ;
            await  this.CashService.setCashRecordForCash(manager ,id ,cashStatus);
            return {code: 200 ,msg: "设置成功" }
        } catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error }
        }

    }


    /**
     * 获取所有成功和拒绝的提现订单
     * @param str
     */
    @Post('getAllCashRecord')
    async getAllCashRecord(@Body() str: any): Promise<any> {
        console.log("getAllCashRecord", str)
        try {
            let  { uid ,cashStatus, orderStatus, page , pageSize ,startTime , endTime, orderNo } = str ;
            const { list, count } = await  this.CashService.getAllCashRecord( uid ,orderStatus,cashStatus, page , pageSize ,startTime , endTime, orderNo);
            return {code: 200 , list , count }
        } catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error }
        }
    }


    /**
     * 精准查询玩家银行卡信息
     * @param str
     */
    @Post('getPlayerBankForUid')
    async getPlayerBankForUid(@Body() str: any): Promise<any> {
        console.log("getPlayerBankForUid", str)
        try {
            let  { uid  } = str ;
            const { list, count } = await  this.CashService.getPlayerBankForUid( uid );
            return {code: 200 , list , count }
        } catch (error) {
            this.logger.error(`精准查询玩家银行卡信息 :${error}`);
            return { code: 500, error }
        }
    }


}