import {Body, Controller, Post} from "@nestjs/common";
import PromoteDownMysqlDao from "../../../../../common/dao/mysql/PromoteDown.mysql.dao";


@Controller('app')
export class promoteDownController {

    /**
     * 添加前端游戏日志
     * @param info
     */
    @Post('promoteDown')
    async getAllGames(@Body() str : any ): Promise<any> {
        const {platformName , rom_type , phoneId } = str;
        try {
            if(!platformName){
                return {code: 500 , error: "邀请标识不存在" }
            }

            if(!rom_type) {
                return {code: 500 , error: "设备信息不存在" }
            }

            if(!phoneId) {
                return {code: 500 , error: "手机ID不存在" }
            }
            await PromoteDownMysqlDao.insertOne({platformName  ,rom_type , phoneId })
            return {code: 200};
        }catch (e) {
            return {code : 500 }
        }
    }
}

