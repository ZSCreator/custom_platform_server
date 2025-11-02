import { Injectable, } from '@nestjs/common';
import { getLogger } from "pinus-logger";
import PlayerManagerDao from "../../../../../../common/dao/daoManager/Player.manager";
import MallService from "../../../../../../services/hall/mallHandler/mallService";
import OnlinePlayerRedisDao from "../../../../../../common/dao/redis/OnlinePlayer.redis.dao";
import PlayerCashRecordMysqlDao from "../../../../../../common/dao/mysql/PlayerCashRecord.mysql.dao";
const ManagerErrorLogger = getLogger('http', __filename);
import * as msgService from "../../../../../../services/MessageService";
import {Player} from "../../../../../../common/dao/mysql/entity/Player.entity";





@Injectable()
export class CashService {
    mallService: MallService;

    constructor() {
        this.mallService = new MallService();
    }

    /**
     *  获取玩家未审核的提现记录, 根据uid 查询 ，否则默认为未审核的记录
     * @param agentNum
     * @param gold
     */
    async getPlayerCashRecord(uid: string ,orderStatus:number,  manager : string, startTime:string , endTime :string, page : number = 1 , pageSize : number = 20): Promise<any> {
        try {
            let where = null;
            if (startTime && endTime) {
                where = `Sp_PlayerCashRecord.createDate > "${startTime}"  AND Sp_PlayerCashRecord.createDate <= "${endTime}"`;
            }

            // else if(orderStatus != undefined){
            //     let start = moment().format("YYYY-MM-DD 00:00:00");
            //     let end = moment().format("YYYY-MM-DD 23:59:59.999");
            //     where = `Sp_PlayerCashRecord.createDate > "${start}"  AND Sp_PlayerCashRecord.createDate <= "${end}"`;
            // }

            if(orderStatus == 10 && manager){
                if(where){
                    where = where + ` AND Sp_PlayerCashRecord.orderStatus = ${orderStatus} AND Sp_PlayerCashRecord.checkName = "${manager}"`;
                }else{
                    where =  `Sp_PlayerCashRecord.orderStatus = ${orderStatus} AND Sp_PlayerCashRecord.checkName = "${manager}"`;
                }
            }

            if(orderStatus){
                if(where){
                    where = where + ` AND Sp_PlayerCashRecord.orderStatus = ${orderStatus}`;
                }else{
                    where =  `Sp_PlayerCashRecord.orderStatus = ${orderStatus}`;
                }
            }

            if(!where){
                where =  `Sp_PlayerCashRecord.orderStatus = 0`;
            }

            const {list ,count } = await PlayerCashRecordMysqlDao.selectWhere(where , page ,pageSize);
            return { list ,count }
        } catch (e) {
            ManagerErrorLogger.error(`获取玩家未审核的提现记录: ${e.stack | e}`);
            return {list : [], count: 0};
        }
    };




    /**
     *  审核订单
     * @param agentNum
     * @param gold
     */
    async setCashRecordForCheck(manager:string , id : number ,orderStatus : number ,content : string): Promise<any> {
        try {
            const record = await PlayerCashRecordMysqlDao.findOne({id:id});
            if(!record){
                return Promise.reject("订单不存在");
            }

            if(record.checkName && record.orderStatus == 10){
                if(record.checkName !== manager){
                    return Promise.reject("订单正在被审核");
                }
            }


            if(!manager){
                return Promise.reject("审核人员信息不存在,请重新登陆后台");
            }

            if(orderStatus == 2 ){
                let gold = record.money;
                await PlayerCashRecordMysqlDao.updateOne({id},{orderStatus, checkName : manager , content});

                // @ts-ignore
                let player : Player  =  await PlayerManagerDao.findOne({ uid : record.uid }, false);
                if(!player){
                    return ;
                }
                let addTixian = player.addTixian - gold ;
                if(addTixian  < 0){
                    addTixian = 0;
                }
                //更新玩家金币
                await PlayerManagerDao.updateOneCash(record.uid,{gold:gold ,addTixian});

                //通知玩家
                const onlinePlayer = await OnlinePlayerRedisDao.findOne({uid : record.uid});
                if(onlinePlayer){
                    let msgUserIds = { uid: player.uid, sid: player.sid };
                    msgService.pushMessageByUids('updateGold', { //充值成功过后，对玩家的金币进行增加
                        gold: Math.floor(player.gold + gold), //显示的金币
                        walletGold: Math.floor(player.walletGold ), //显示的金币
                    }, [msgUserIds]);
                }

            }else {
                await PlayerCashRecordMysqlDao.updateOne({id},{orderStatus, checkName : manager});
            }
            return true;
        } catch (e) {
            ManagerErrorLogger.error(`审核订单 : ${e}`);
            return {code: 500 , error: "审核失败"};
        }
    };



    /**
     *  获取玩家审核通过但是没有汇款的记录
     * @param agentNum
     * @param gold
     */
    async getPlayerIsCheckPass(manager:string  ,uid:string ,cashStatus :number, page :number = 1, pageSize :number = 20 ,startTime :string , endTime : string): Promise<any> {
        try {
            let where = `Sp_PlayerCashRecord.orderStatus = 1`;

            if (startTime && endTime) {
                where = where +  ` AND Sp_PlayerCashRecord.createDate > "${startTime}"  AND Sp_PlayerCashRecord.createDate <= "${endTime}"`;
            }

            // else if(cashStatus != undefined){
            //     let start = moment().format("YYYY-MM-DD 00:00:00");
            //     let end = moment().format("YYYY-MM-DD 23:59:59.999");
            //     where = `Sp_PlayerCashRecord.createDate > "${start}"  AND Sp_PlayerCashRecord.createDate <= "${end}"`;
            // }

            if(cashStatus && cashStatus == 10){
                where = where + ` AND Sp_PlayerCashRecord.cashStatus = ${cashStatus}  AND Sp_PlayerCashRecord.remittance = "${manager}"`;
            }else if(cashStatus && cashStatus !== 10){
                where = where + ` AND Sp_PlayerCashRecord.cashStatus = ${cashStatus}`;
            }else{
                where = where + ` AND Sp_PlayerCashRecord.cashStatus = 0`;
            }

            const { list ,count } = await PlayerCashRecordMysqlDao.selectWhere(where , page ,pageSize );
            return { list, count }
        } catch (e) {
            ManagerErrorLogger.error(`审核订单通过，然后进行汇款 : ${e.stack | e}`);
            return { list : [], count: 0};
        }
    };

    /**
     *  设置提现订单的汇款状态
     * @param agentNum
     * @param gold
     */
    async setCashRecordForCash(manager:string , id : number ,cashStatus : number): Promise<any> {
        try {
            const record = await PlayerCashRecordMysqlDao.findOne({id:id});
            if(!record){
                return Promise.reject("订单不存在");
            }

            if(record.cashStatus == 1){
                return Promise.reject("订单已经汇款完成");
            }

            if(record.remittance && record.cashStatus == 10){
                if(record.remittance !== manager){
                    return Promise.reject("订单正在汇款当中");
                }
            }

            if(!manager){
                return Promise.reject("汇款人员信息不存在,请重新登陆后台");
            }
            await PlayerCashRecordMysqlDao.updateOne({id},{ cashStatus, remittance : manager});
            return true;
        } catch (e) {
            ManagerErrorLogger.error(`审核订单 : ${e.stack | e}`);
            return false;
        }
    };

    /**
     *  设置提现订单的汇款状态
     * @param agentNum
     * @param gold
     */
    async setCashRecordForCash_DaiFu(manager:string , id : number ,cashStatus : number): Promise<any> {
        try {
            const record = await PlayerCashRecordMysqlDao.findOne({id:id});
            if(!record){
                return Promise.reject("订单不存在");
            }

            if(record.cashStatus == 1){
                return Promise.reject("订单已经汇款完成");
            }

            if(record.remittance && record.cashStatus == 10){
                if(record.checkName !== manager){
                    return Promise.reject("订单正在汇款当中");
                }
            }

            if(!manager){
                return Promise.reject("汇款人员信息不存在,请重新登陆后台");
            }
            //调用代付接口
            let money = Math.floor( record.money / 100);
            let result =   await this.mallService.getPayForCashOrder({uid: record.uid ,cardHolderName : record.bankUserName ,
                accountName: record.bankUserName , cardNumber : record.bankCardNo, betFlowMag:0 , amount : money ,requestAmount : money , type : 0 , bankCodeType : record.type  });
            if(result && result.code == 200){
                await PlayerCashRecordMysqlDao.updateOne({id},{ cashStatus, remittance : manager});
                return true ;
            }else {
                return Promise.reject("代付功能失败，请联系相关技术人员");
            }
        } catch (e) {
            ManagerErrorLogger.error(`审核订单 : ${e.stack | e}`);
            return false;
        }
    };


    /**
     * 获取玩家获取所有成功和拒绝的提现订单
     * @param agentNum
     * @param gold
     */
    async getAllCashRecord(uid:string ,orderStatus : number , cashStatus :number, page :number = 1, pageSize :number = 20 ,startTime :string , endTime : string , orderNo:string): Promise<any> {
        try {
            let where = null;
            if (startTime && endTime) {
                where = `Sp_PlayerCashRecord.createDate > "${startTime}"  AND Sp_PlayerCashRecord.createDate <= "${endTime}"`;
            }

            if(uid){
                if(where){
                    where = where + ` AND Sp_PlayerCashRecord.uid = "${uid}"`;
                }else{
                    where =  `Sp_PlayerCashRecord.uid = "${uid}"`;
                }
            }

            if(orderNo){
                if(where){
                    where = where + ` AND Sp_PlayerCashRecord.orderNo = "${orderNo}"`;
                }else{
                    where =  `Sp_PlayerCashRecord.orderNo = "${orderNo}"`;
                }
            }

            if(orderStatus){
                if(where){
                    where = where + ` AND Sp_PlayerCashRecord.orderStatus = ${orderStatus}`;
                }else{
                    where =  `Sp_PlayerCashRecord.orderStatus = ${orderStatus}`;
                }
            }

            if(cashStatus){
                if(where){
                    where = where + ` AND Sp_PlayerCashRecord.cashStatus = ${cashStatus}`;
                }else{
                    where =  `Sp_PlayerCashRecord.cashStatus = ${cashStatus}`;
                }
            }

            if(!where){
                where =  `Sp_PlayerCashRecord.cashStatus = 1`;
            }

            const { list ,count } = await PlayerCashRecordMysqlDao.selectWhere(where , page ,pageSize );
            return { list, count }
        } catch (e) {
            ManagerErrorLogger.error(`获取玩家获取所有成功和拒绝的提现订单 : ${e.stack | e}`);
            return { list : [], count: 0};
        }
    };

    /**
     *  精准查询玩家银行卡信息
     * @param agentNum
     * @param gold
     */
    async getPlayerBankForUid(uid:string ): Promise<any> {
        try {

            return true;
        } catch (e) {
            ManagerErrorLogger.error(`审核订单 : ${e.stack | e}`);
            return {list : [], count: 0};
        }
    };



}


