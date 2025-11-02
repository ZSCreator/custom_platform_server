import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { PlayerService } from "./player.service";
import { getLogger } from 'pinus-logger';
import { TokenGuard } from "../../main/token.guard";

/**
 * 管理后台
 */
@Controller('player')
@UseGuards(TokenGuard)
export class PlayerController {
    logger: any;
    constructor(private readonly PlayerService: PlayerService) {
        this.logger = getLogger('thirdHttp', __filename);
    }

    /**
     * 获取玩家列表
     * @param str
     */
    @Post('getPlayers')
    async getPlayers(@Body() str: any): Promise<any> {
        console.log("getPlayers", str)
        try {
            // const param = str.param;
            const page: number = Number(str.page);
            const pageSize: number = Number(str.pageSize);
            const uid: string = str.uid;
            const thirdUid: string = str.thirdUid;
            const ip: string = str.ip;
            if(uid || thirdUid || ip){
                const result = await this.PlayerService.queryPlayer(uid, thirdUid , ip);
                return result;
            }else{
                const result = await this.PlayerService.getPlayers(page ,pageSize);
                return result;
            }
        } catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error }
        }

    }


    /**
     * 获取玩家的基础信息
     * @param str
     */
    @Post('getOnePlayerMessage')
    async getOnePlayerMessage(@Body() str: any): Promise<any> {
        console.log("getOnePlayerMessage", str)
        try {
            // const param = str.param;
            const uid: string = str.uid;
            const result = await this.PlayerService.getOnePlayerMessage(uid);
            return result;
        } catch (error) {
            this.logger.error(`获取玩家的基础信息 :${error}`);
            return { code: 500, error }
        }

    }

    /**
     * 修改玩家密码
     * @param str
     */
    @Post('changePlayerPassWord')
    async changePlayerPassWord(@Body() str: any): Promise<any> {
        console.log("changePlayerPassWord", str)
        try {
            const param = str;
            const uid: string = param.uid;
            const passWord: string = param.passWord;
            const result = await this.PlayerService.changePlayerPassWord(uid, passWord);
            return result;
        } catch (error) {
            this.logger.error(`修改玩家密码 :${error}`);
            return { code: 500, error }
        }

    }


    /**
     * 封禁玩家的分钟数以及封禁原因
     * @param str
     */
    @Post('closeTimeAndReason')
    async closeTimeAndReason(@Body() str: any): Promise<any> {
        console.log("closeTimeAndReason", str)
        try {
            const param = str;
            const uid: string = param.uid;
            const closeReason: string = param.closeReason;
            const closeTime: number = param.closeTime;
            const result = await this.PlayerService.closeTimeAndReason(uid, closeReason, closeTime);
            return result;
        } catch (error) {
            this.logger.error(`封禁玩家的分钟数以及封禁原因 :${error}`);
            return { code: 500, error }
        }

    }


    /**
     * 获取玩家的卡列表
     * @param str
     */
    // @Post('getPlayersBankMessage')
    // async getPlayersBankMessage(@Body() str: any): Promise<any> {
    //     console.log("getPlayersBankMessage", str)
    //     try {
    //         const param = str.param;
    //         const uid: string = param.uid;
    //         const page: number = param.page;
    //         const bankCardNo: string = param.bankCardNo;
    //         const bankCardName: string = param.bankCardName;
    //         const result = await this.PlayerService.getPlayersBankMessage(uid, page, bankCardNo, bankCardName);
    //         return result;
    //     } catch (error) {
    //         this.logger.error(`获取玩家的卡列表 :${error}`);
    //         return { code: 500, error }
    //     }
    //
    // }

    /**
     * 修改银行卡号
     * @param str
     */
    // @Post('changePlayerBank')
    // async changePlayerBank(@Body() str: any): Promise<any> {
    //     console.log("changePlayerBank", str)
    //     try {
    //         const param = str.param;
    //         const uid: string = param.uid;
    //         const bankCardNo: string = param.bankCardNo;
    //         const bankCardName: string = param.bankCardName;
    //         const bankName: string = param.bankName;
    //         const bankAddress: string = param.bankAddress;
    //         const result = await this.PlayerService.changePlayerBank(uid, bankCardNo, bankCardName, bankName, bankAddress);
    //         return result;
    //     } catch (error) {
    //         this.logger.error(`修改银行卡号 :${error}`);
    //         return { code: 500, error }
    //     }
    //
    // }

    /**
     * 如果玩家不在线了，将玩家身上的 position 的位置进行修正
     * @param str
     */
    @Post('changePlayerPosition')
    async changePlayerPosition(@Body() str: any): Promise<any> {
        console.log("changePlayerPosition", str)
        try {
            // const param = str.param;
            const uid: string = str.uid;
            await this.PlayerService.changePlayerPosition(uid);
            return { code: 200 , msg:'修正成功'};
        } catch (error) {
            this.logger.error(`如果玩家不在线了，将玩家身上的 position 的位置进行修正 :${error}`);
            return { code: 500, error }
        }

    }


    /**
     * 删除玩家不在线
     * @param str
     */
    @Post('deleteOnlinePlayer')
    async deleteOnlinePlayer(@Body() str: any): Promise<any> {
        console.log("deleteOnlinePlayer", str)
        try {
            // const param = str.param;
            const uid: string = str.uid;
            await this.PlayerService.deleteOnlinePlayer(uid);
            return { code: 200 , msg:'删除成功' };
        } catch (error) {
            this.logger.error(`如果玩家不在线了，将玩家身上的 position 的位置进行修正 :${error}`);
            return { code: 500, error }
        }

    }


    /**
     * 根据uid 和 group_id 来查询玩家的信息
     * @param str
     */
    @Post('getPlayerGameRecordForUidAndGroupId')
    async getPlayerGameRecordForUidAndGroupId(@Body() str: any): Promise<any> {
        console.log("getPlayerGameRecordForUidAndGroupId", str)
        try {
            // const param = str.param;
            let {uid , group_id , page } = str;
            if(!uid ){
                return { code: 500 , msg:'缺少参数uid 和 group_id' };
            }
            if(!page){
                page = 1;
            }
            const { list  , count } = await this.PlayerService.getPlayerGameRecordForUidAndGroupId(uid , group_id , page );
            return { code: 200 , list , count };
        } catch (error) {
            this.logger.error(`如果玩家不在线了，将玩家身上的 position 的位置进行修正 :${error}`);
            return { code: 500, error }
        }

    }


    /**
     * 踢掉单个玩家
     * @param str
     */
    @Post('kickOnePlayer')
    async kickOnePlayer(@Body() str: any): Promise<any> {
        console.log("kickOnePlayer", str)
        try {
            // const param = str.param;
            let { uid } = str;
            if(!uid ){
                return { code: 500 , msg:'缺少参数uid' };
            }
            await this.PlayerService.kickOnePlayer( uid );
            return { code: 200 };
        } catch (error) {
            this.logger.error(`踢掉单个玩家 :${error}`);
            return { code: 500, error }
        }

    }


    /**
     * 根据某个游戏踢掉该游戏的所有玩家
     * @param str
     */
    @Post('kickOneGamePlayers')
    async kickOneGamePlayers(@Body() str: any): Promise<any> {
        console.log("kickOnePlayer", str)
        try {
            // const param = str.param;
            let { nid } = str;
            if(!nid ){
                return { code: 500 , msg:'缺少参数nid' };
            }
            await this.PlayerService.kickOneGamePlayers( nid );
            return { code: 200 };
        } catch (error) {
            this.logger.error(`根据某个游戏踢掉该游戏的所有玩家 :${error}`);
            return { code: 500, error }
        }
    }

    /**
     *  管理后台 在线会员
     */
    @Post('managerPlayerFengkong')
    async managerPlayerFengkong(@Body() str: any): Promise<any> {
        try {
            // const param = str.param;
            const {
                uid,
                thirdUid,
                ip,
                nidList,
                dayProfit,
                maxBetGold,
                page,
                addRmb,
                pageSize,
                platformUid,
            } = str;
            /**
             * 单查询
             */
            if(uid || thirdUid){
                /**
                 * 单查询
                 */
                const result = await this.PlayerService.managerFentkongForSinglePlayer(uid,thirdUid);
                return { code: 200, ...result };
            }else {
                /**
                 * 列表集合查询
                 */
                const result = await this.PlayerService.managerPlayerFengkongForPlayerList(platformUid ,nidList, ip, dayProfit, maxBetGold, addRmb, page ,pageSize);
                return {code: 200, ...result};
            }
        } catch (error) {
            this.logger.error(`平台给平台代理添加金币 :${error}`);
            return { code: 500, error: error }
        }

    }
}