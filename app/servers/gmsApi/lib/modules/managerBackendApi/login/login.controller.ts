import { Controller, Post, Request, Body, Session, UseGuards, Ip, Logger } from "@nestjs/common";
import { LoginService } from "./login.service";
import Utils = require("../../../../../../utils/index");
import { TokenGuard } from "../../main/token.guard";
import { ApiTags } from "@nestjs/swagger";

/**
 * 管理后台
 */
@Controller('manager')
@ApiTags("后台管理账户和权限管理")
export class LoginController {

    constructor(private readonly loginService: LoginService) {
    }

    /**
     * 主后台创建账号
     * @param str
     */
    @Post('Create')
    @UseGuards(TokenGuard)
    async managerCreate(@Body() str: any, @Request() req: any, @Session() session: any,): Promise<any> {
        try {
            const param = str;
            const { userName, passWord, agent, ip ,role , rootAgent ,managerRole , manager, managerIp } = param;
            if ( !role.toString() || !ip || !userName || !passWord || !managerRole) {
                return { code: 500, error: "输入参数不完整" }
            }
            const result = await this.loginService.managerCreate(userName, passWord, agent, ip,  role , rootAgent ,managerRole ,manager ,managerIp);
            return result;
        } catch (error) {
            // this.logger.error(`创建账号 :${error}`);
            return { code: 500, error: error ? error : "创建失败" }
        }

    }


    /**
     * 平台账号给分代创建账号
     * @param str
     */
    @Post('platformCreateMangerUser')
    @UseGuards(TokenGuard)
    async platformCreateMangerUser(@Body() str: any, @Session() session: any,): Promise<any> {
        console.log("platformCreateMangerUser", str)
        try {
            const param = str;
            const { managerAgent, userName, passWord, agent, ip ,role ,manager,managerIp } = param;
            if (!managerAgent|| !role || !ip || !userName || !passWord) {
                return { code: 500, error: "输入参数不完整" }
            }
            if(!agent){
                return { code: 500, error: "请输入该后台账号的代理号" }
            }

            const result = await this.loginService.platformCreateMangerUser(managerAgent,userName, passWord, agent, ip,  role ,manager ,managerIp );
            return result;
        } catch (error) {
            // this.logger.error(`创建账号 :${error}`);
            return { code: 500, error: error ? error : "创建失败" }
        }

    }


    /**
     * 账号登陆
     * @param str
     */
    @Post('Login')
    async managerLogin(@Body() { userName , passWord}, @Request() req: any): Promise<any> {

        try {
            if(!userName || !passWord){
                return { code: 500, error: "输入后台账号和密码" }
            }
            const ip: string = Utils.getClientIp(req);

            const result = await this.loginService.managerLogin(userName, passWord , ip );
            return result;
        } catch (error) {
            // this.logger.error(`后台登陆 :${error}`);
            return { code: 500, error:error ? error : "账号登陆失败" }
        }

    }

    /**
     * 主后台修改账号
     * @param str
     */
    @Post('changePassWord')
    @UseGuards(TokenGuard)
    async changePassWord(@Body() str: any , @Request() req: any ): Promise<any> {
        console.log("changePassWord", str)
        try {
            const param = str;

            const { manager, userName ,passWord , agent, ip , role ,managerRole , managerIp } = param;
            if (!userName) {
                return { code: 500, error: "请输入账号和密码,以及ip" };
            }

            if(!manager || !managerRole){
                return { code: 500, error: "修改失败" };
            }

            const loginIp: string = Utils.getClientIp(req);

            const result = await this.loginService.changePassWord(manager , userName, passWord , agent, ip , role , loginIp ,managerRole ,managerIp );
            return result;
        } catch (error) {
            // this.logger.error(`修改账号 :${error}`);
            return { code: 500, error: error ? error :"修改失败" }
        }

    }


    /**
     * 分代修改账号
     * @param str
     */
    @Post('platformChangePassWord')
    @UseGuards(TokenGuard)
    async platformChangePassWord(@Body() str: any , @Request() req: any ): Promise<any> {
        console.log("changePassWord", str)
        try {
            const param = str;
            const { manager, userName, passWord , agent, ip , role, managerRole  , managerIp } = param;
            if ( !userName ) {
                return { code: 500, error: "请输入账号" }
            }
            // if(!agent){
            //     return { code: 500, error: "请输入该后台账号的代理号" }
            // }

            const loginIp: string = Utils.getClientIp(req);

            const result = await this.loginService.platformChangePassWord(manager ,userName, passWord , agent, ip , role , loginIp ,managerRole , managerIp );
            
            return result;
        } catch (error) {
            // this.logger.error(`修改账号 :${error}`);
            return { code: 500, error:error ? error : "修改失败" }
        }

    }


    /**
     * 主后台获取所有账号信息
     * @param str
     */
    @Post('getAllManagerUser')
    @UseGuards(TokenGuard)
    async getAllManagerUser(@Body() str: any): Promise<any> {
        console.log("getAllManagerUser", str)
        try {
            const param = str;
            let { page , pageSize ,userName   } = param;
            if(!page){
                page = 1;
            }
            if(!pageSize){
                pageSize = 20;
            }
            if(userName){
                const  result = await this.loginService.getOneManagerUser(userName);
                return result;
            }
            const result = await this.loginService.getAllManagerUser(page, pageSize);
            return result;
        } catch (error) {
            // this.logger.error(`修改账号 :${error}`);
            return { code: 500, error:error ? error : "获取失败" }
        }

    }


    /**
     * 代理后台获取所有账号信息
     * @param str
     */
    @Post('getPlatformManagerUser')
    @UseGuards(TokenGuard)
    async getPlatformManagerUser(@Body() str: any): Promise<any> {
        try {
            const param = str;
            let { page , pageSize , manager  } = param;
            let userName = manager;
            if(!page){
                page = 1;
            }
            if(!pageSize){
                pageSize = 20;
            }
            if(!userName){
                return { code: 500, error: "缺少账号信息" }
            }

            const result = await this.loginService.getPlatformManagerUser(page, pageSize , userName);
            return result;
        } catch (error) {
            // this.logger.error(`修改账号 :${error}`);
            return { code: 500, error: error ? error : "修改失败" }
        }

    }


    /**
     * 删除账号
     * @param str
     */
    @Post('deleteUserName')
    @UseGuards(TokenGuard)
    async deleteUserName(@Body() str: any): Promise<any> {
        console.log("deleteUserName", str)
        try {
            const param = str;
            const { id , manager , managerRole } = param;
            if (!id) {
                return { code: 500, error: "id不存在" };
            }
            const result = await this.loginService.deleteUserName(id, manager , managerRole);
            return result;
        } catch (error) {
            // this.logger.error(`删除账号 :${error}`);
            return { code: 500, error: error ? error : "删除失败" }
        }

    }


    /**
     * 自己给自己修改密码
     * @param str
     */
    @Post('updateManagerSelfUser')
    @UseGuards(TokenGuard)
    async updateManagerSelfUser(@Body() str: any ,@Request() req: any): Promise<any> {
        console.log("updateManagerSelfUser", str)
        try {
            const param = str;
            const { manager , passWord  , oldPassWord} = param;
            let userName = manager;

            const ip: string = Utils.getClientIp(req);

            if (!userName) {
                return { code: 500, error: "玩家信息已过期" };
            }
            if(!passWord || !oldPassWord){
                return { code: 500, error: "请输入密码" };
            }
            const result = await this.loginService.updateManagerSelfUser(userName , passWord , oldPassWord ,ip);
            return result;
        } catch (error) {
            // this.logger.error(`删除账号 :${error}`);
            return { code: 500, error: error ? error : "修改失败" }
        }

    }



    /**
     * 获取短信验证
     * @param str
     */
    @Post('sendMessage')
    // @UseGuards(TokenGuard)
    async sendMessage(@Body() { userName } ,@Request() req: any): Promise<any> {

        try {

            const ip: string = Utils.getClientIp(req);

            if (!userName) {
                return { code: 500, error: "玩家信息已过期" };
            }

            const result = await this.loginService.sendMessage(userName ,ip);
            return result;
        } catch (error) {
            // this.logger.error(`删除账号 :${error}`);
            return { code: 500, error: error ? error : "修改失败" }
        }

    }


    /**
     * 验证短信
     * @param str
     */
    @Post('checkAuthCode')
    // @UseGuards(TokenGuard)
    async checkAuthCode(@Body() { userName , auth_code} ,@Request() req: any): Promise<any> {

        try {

            const ip: string = Utils.getClientIp(req);

            if (!userName) {
                return { code: 500, error: "玩家信息已过期" };
            }

            const result = await this.loginService.checkAuthCode(userName ,auth_code , ip);
            return result;
        } catch (error) {
            // this.logger.error(`删除账号 :${error}`);
            return { code: 500, error: error ? error : "修改失败" }
        }

    }



    /**
     * 根据前端获取的订单号和代理好来查询玩家的详情
     * @param str
     */
    @Post('getThirdGameResultById')
    async getThirdGameResultById(@Body() str: any): Promise<any> {
        console.log("getThirdGameResultById", str)
        try {
            const {  gameOrder, createTimeDate , groupRemark } = str;
            if (!gameOrder && !createTimeDate) {
                return { code: 500, error: '请输入订单号和时间' }
            }
            const record = await this.loginService.getThirdGameResultById( gameOrder, createTimeDate , groupRemark);
            return { code: 200, record };
        } catch (error) {
            return { code: 500, error: error ? error : "修改失败" }
        }

    }


    /**
     * 获取客服地址
     * @param str
     */
    @Post('getCustomerUrl')
    async getCustomerUrl(): Promise<any> {
        try {
            const customer = await this.loginService.getCustomerUrl();
            return { code: 200, customer : customer };
        } catch (error) {
            return { code: 500, error: error ? error : "获取失败" }
        }

    }


}
