import { Controller, Post, Request, Body, Session, UseGuards, Ip, Logger } from "@nestjs/common";
import { SystemMenuService } from "./systemMenu.service";
import { TokenGuard } from "../../main/token.guard";
import { ApiTags } from "@nestjs/swagger";

/**
 * 管理后台
 */
@Controller('systemMenu')
@ApiTags("后台管理账户和权限管理")
@UseGuards(TokenGuard)
export class SystemMenuController  {

    constructor(private readonly systemMenuService: SystemMenuService) {
    }

    /**
     * 创建菜单
     * @param str
     */
    @Post('createSystemMenu')
    async createSystemMenu(@Body() str: any, @Request() req: any, @Session() session: any,): Promise<any> {
        console.log("createSystemMenu", str)
        try {
            // const param = str;
            const { menuName, sort, menuLevel , parentMenuNum ,webIndex , menuCoin} = str;
            if (!menuName || !sort || !menuLevel  ) {
                return { code: 500, error: "输入参数不完整" }
            }
             await this.systemMenuService.createMenu(menuName, sort, menuLevel , parentMenuNum , webIndex , menuCoin);
            return { code: 200, msg: "创建菜单成功" };
        } catch (error) {
            return { code: 500, error: error ? error : "创建失败" }
        }

    }


    /**
     * 获取所有菜单栏
     * @param str
     */
    @Post('getSystemMenu')
    async getSystemMenu(@Body() str: any, @Request() req: any, @Session() session: any,): Promise<any> {
        console.log("getSystemMenu", str)
        try {
            // const param = str;
            const menusList = await this.systemMenuService.getSystemMenu();
            return  {code: 200 , menusList} ;
        } catch (error) {
            return { code: 500, error: error ? error : "创建失败" }
        }

    }




    /**
     * 修改菜单
     * @param str
     */
    @Post('updateSystemMenu')
    async updateSystemMenu(@Body()  str : any, @Request() req: any): Promise<any> {

        try {

            const { menuName, sort , parentMenuNum , menuLevel ,id  , webIndex , menuCoin } = str;
            if(!id){
                return { code: 500, error: "id不存在" }
            }
            if (!menuName || !sort   ) {
                return { code: 500, error: "输入参数不完整" }
            }
             await this.systemMenuService.updateMenu(id , menuName, sort ,menuLevel, parentMenuNum , webIndex , menuCoin );
            return { code: 200, msg: "修改菜单成功" };
        } catch (error) {
            return { code: 500, error: error ? error : "修改菜单失败" }
        }
    }

    /**
     * 删除菜单
     * @param str
     */
    @Post('deleteSystemMenu')
    async deleteSystemMenu(@Body()  str : any, @Request() req: any): Promise<any> {

        try {

            const { id  } = str;
            if(!id){
                return { code: 500, error: "id不存在" }
            }
            await this.systemMenuService.deleteSystemMenu(id );
            return { code: 200, msg: "删除菜单成功" };
        } catch (error) {
            return { code: 500, error: error ?  error : "删除菜单失败" }
        }
    }


    /**
     * 创建角色
     * @param str
     */
    @Post('createSystemRole')
    async createSystemRole(@Body() str: any, @Request() req: any, @Session() session: any,): Promise<any> {
        console.log("createSystemRole", str)
        try {
            // const param = str;
            const {manager, roleName, sort, roleMenu,roleLevel  } = str;

            if(!manager || manager != "xiaolaobaoban"){
                return { code: 500, error: "没权限" }
            }

            if (!roleName || !sort.toString() || roleMenu.length == 0 || !roleLevel.toString() ) {
                return { code: 500, error: "输入参数不完整" }
            }

            if(roleLevel < 1){
                return { code: 500, error: "角色等级不对" }
            }
            const result = await this.systemMenuService.createSystemRole(roleName, sort, roleMenu ,roleLevel );
            return result;
        } catch (error) {
            return { code: 500, error: error ? error : "创建失败" }
        }

    }


    /**
     * 获取角色
     * @param str
     */
    @Post('getSystemRole')
    async getSystemRole(@Body() str: any, @Request() req: any, @Session() session: any,): Promise<any> {
        console.log("getSystemRole", str)
        try {
            const param = str;
            let { manager } = param;
            if(!manager){
                return { code: 500, error:  "获取角色列表失败" }
            }
            const rolesList = await this.systemMenuService.getSystemRole(manager);
            return { code: 200, rolesList };
        } catch (error) {
            return { code: 500, error: error ? error : "创建失败" }
        }

    }



    /**
     * 根据角色获取角色的菜单栏
     * @param str
     */
    @Post('getSystemRoleForMenu')
    async getSystemRoleForMenu(@Body() str: any, @Request() req: any, @Session() session: any,): Promise<any> {
        console.log("getSystemRoleForMenu", str)
        try {
            // const param = str;
            const { role  } = str;
            if (!role ) {
                return { code: 500, error: "输入角色编号" }
            }
            const { list, roleMenu }  = await this.systemMenuService.getSystemRoleForMenu(role);
            return { code: 200, list : list , roleMenu };
        } catch (error) {
            return { code: 500, error: error ? error : "创建失败" }
        }

    }

    /**
     * 登陆的时候根据角色获取角色的菜单栏
     * @param str
     */
    @Post('getLoginSystemRoleForMenu')
    async getLoginSystemRoleForMenu(@Body() str: any, @Request() req: any, @Session() session: any,): Promise<any> {
        console.log("getSystemRoleForMenu", str)
        try {
            // const param = str;
            const { role  } = str;
            if (!role ) {
                return { code: 500, error: "输入角色编号" }
            }
            const list  = await this.systemMenuService.getLoginSystemRoleForMenu(role);
            return { code: 200, list : list  };
        } catch (error) {
            return { code: 500, error: error ? error : "创建失败" }
        }

    }


    /**
     * 修改角色
     * @param str
     */
    @Post('updateSystemRole')
    async updateSystemRole(@Body() str: any, @Request() req: any, @Session() session: any,): Promise<any> {
        console.log("updateSystemRole", str)
        try {
            // const param = str;
            const { roleName, sort, manager, roleMenu ,id ,roleLevel} = str;

            if(!manager || manager != "xiaolaobaoban"){
                return { code: 500, error: "没权限" }
            }

            if(!id.toString()){
                return { code: 500, error: "id不存在" }
            }

            if (!roleName || !sort || !roleMenu) {
                return { code: 500, error: "输入参数不完整" }

            }

            if(roleLevel < 1){
                return { code: 500, error: "角色等级不对" }
            }

            const result = await this.systemMenuService.updateSystemRole(id , roleName, sort, roleMenu ,roleLevel );
            return result;
        } catch (error) {
            return { code: 500, error: error ? error : "修改角色失败" }
        }

    }


    /**
     * 删除角色
     * @param str
     */
    @Post('deleteSystemRole')
    async deleteSystemRole(@Body() str: any, @Request() req: any, @Session() session: any,): Promise<any> {
        console.log("deleteSystemRole", str)
        try {
            // const param = str;
            const { id } = str;

            if(!id){
                return { code: 500, error: "id不存在" }
            }
            const result = await this.systemMenuService.deleteSystemRole(id );
            return result;
        } catch (error) {
            return { code: 500, error: error ? error : "修改角色失败" }
        }

    }

    /**
     * 创建后台服务器列表
     * @param str
     */
    @Post('createManagerServersList')
    async managerServersList(@Body() str: any, @Request() req: any, @Session() session: any,): Promise<any> {
        console.log("managerCreate", str);
        try {
            // const param = str;
            const { serverName , serverHttp } = str;
            if(!serverName || !serverHttp){
                return { code: 500, error: "缺少参数" }
            }
            const result = await this.systemMenuService.createManagerServersList(serverName  , serverHttp );
            return result;
        } catch (error) {
            return { code: 500, error: error ? error : "修改角色失败" }
        }

    }


    /**
     * 获取后台服务器列表
     * @param str
     */
    @Post('getManagerServersList')
    async getManagerServersList(@Body() str: any, @Request() req: any, @Session() session: any,): Promise<any> {
        console.log("managerCreate", str);
        try {
            // const param = str;
            const result = await this.systemMenuService.getManagerServersList();
            return result;
        } catch (error) {
            return { code: 500, error: error ? error : "修改角色失败" }
        }

    }


    /**
     * 修改后台服务器列表
     * @param str
     */
    @Post('updateManagerServersList')
    async updateManagerServersList(@Body() str: any, @Request() req: any, @Session() session: any,): Promise<any> {
        console.log("managerCreate", str);
        try {
            // const param = str;
            const { serverName , serverHttp } = str;
            if(!serverName || !serverHttp){
                return { code: 500, error: "缺少参数" }
            }
            const result = await this.systemMenuService.updateManagerServersList(serverName  , serverHttp );
            return result;
        } catch (error) {
            return { code: 500, error: error ? error : "修改角色失败" }
        }

    }

    /**
     * 删除后台服务器列表
     * @param str
     */
    @Post('deleteManagerServersList')
    async deleteManagerServersList(@Body() str: any, @Request() req: any, @Session() session: any,): Promise<any> {
        console.log("managerCreate", str);
        try {
            // const param = str;
            const { serverName , serverHttp } = str;
            if(!serverName){
                return { code: 500, error: "缺少参数" }
            }
            const result = await this.systemMenuService.deleteManagerServersList(serverName   );
            return result;
        } catch (error) {
            return { code: 500, error: error ? error : "修改角色失败" }
        }

    }



    /**
     * 设置当前角色后台所有的请求路由
     * @param str
     */
    @Post('setManagerRoute')
    async setManagerRoute(@Body() str: any): Promise<any> {
        try {
            const { id , routeList , manager} = str;

            if(!manager || manager != "xiaolaobaoban"){
                return { code: 500, error: "没权限" }
            }

            if(!id || !routeList || routeList.length == 0){
                return { code: 500, error: "缺少参数" }
            }
            await this.systemMenuService.setManagerRoute(id  , routeList);
            return { code: 200 };
        } catch (error) {
            return { code: 500, error }
        }
    }



}
