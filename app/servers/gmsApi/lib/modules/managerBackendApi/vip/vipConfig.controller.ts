import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { getLogger } from 'pinus-logger';
import VipConfigMysqlDao from "../../../../../../common/dao/mysql/VipConfig.mysql.dao";
import { TokenGuard } from "../../main/token.guard";

@Controller("vipConfig")
@UseGuards(TokenGuard)
export class VipConfigController {
    logger: any;
    constructor() {
        this.logger = getLogger('thirdHttp', __filename);
    }

    @Post('findList')
    async findList(@Body() str: any): Promise<any> {
        console.log("findList", str)
        try {
            // const param = str.param;
            const page: number = Number(str.page);
            const pageSize: number = Number(str.pageSize);

            const data = await VipConfigMysqlDao.findListToLimit(page, pageSize);

            if (data) {
                return { code: 200, data, msg: "操作成功" };
            }

            return { code: 200, data: { list: [], count: 0 }, msg: "异常" }
        } catch (error) {
            this.logger.error(`获取vip配置列表 :${error}`);
            return { code: 500, error, msg: "出错" }
        }
    }

    @Post('updateOne')
    async updateOne(@Body() str: any) {
        const { id, ...rest } = str;
        const {
            des,
            levelScore,
            bonus,
            bonusForWeeks,
            bonusForMonth
        } = rest;
        try {
            await VipConfigMysqlDao.updateOne({ id }, {
                des,
                levelScore,
                bonus,
                bonusForWeeks,
                bonusForMonth
            });

            return { code: 200, data: null, msg: "操作成功" }
        } catch (error) {
            this.logger.error(`修改vip配置信息出错 :${error}`);
            return { code: 500, error, msg: "出错" }
        }
    }
}