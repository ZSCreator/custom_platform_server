import { RDSClient } from "../../../app/common/dao/mysql/lib/RDSClient";
import dao from "../../../app/common/dao/mysql/LogTelegramCustomerRecord.mysql.dao";
import { describe, before, it } from "mocha";
import ConnectionManager from "../../../app/common/dao/mysql/lib/connectionManager";
import { LogTelegramCustomerRecord } from "../../../app/common/dao/mysql/entity/LogTelegramCustomerRecord.entity";


describe("测试tele客服表", function () {
    this.timeout(50000);
    before("初始化连接池", async () => {
        await RDSClient.demoInit();
    });


    /* it("获取总记录和每个客服合计", async () => {
        // const total = await dao.getCountTotal();
        // console.log("total");
        // console.log(total);
        const p = await dao.getCountForEveryCustomer()
        console.log("p");
        console.log(p);
        return true;
    }); */

    it("测试count", async () => {
        // const res = await ConnectionManager.getConnection()
        //     .getRepository(LogTelegramCustomerRecord)
        //     .createQueryBuilder("lt")
        //     .select("SUM(lt.fk_telegramCustomer_id)","sum")
        //     .getRawOne();

        // const res = await ConnectionManager.getConnection()
        //     .query("SELECT sum(fk_telegramCustomer_id) FROM Log_TelegramCustomer_record")
        // console.log(res)

        const res = await ConnectionManager.getConnection()
            .getRepository(LogTelegramCustomerRecord)
            .createQueryBuilder("lt")
            .select("SUM(lt.fk_telegramCustomer_id)", "sum")
            .getRawOne();

        console.log(res, typeof res.sum)
        return true;
    })

});
