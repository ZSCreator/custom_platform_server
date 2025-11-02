import ScratchCardResultMysqlDao from "../../app/common/dao/mysql/ScratchCardResult.mysql.dao";
import {RDSClient} from "../../app/common/dao/mysql/lib/RDSClient";
const data = require("./scratch_card_result.json");
RDSClient.demoInit();
let i = 0;
async function clean() {
    console.warn(`开始生成数据`);
    for (const list of data.RECORDS) {
        const info = {
            cardNum: list.cardNum,
            result: list.result.toString(),
            rebate: list.rebate,
            jackpotId: list.jackpotId,
            status: 0,
        };
        await ScratchCardResultMysqlDao.insertOne(info);
        i++;
    }
    console.warn(`生成数据完成`);
    process.exit();
    return;
}
setTimeout(clean, 2000);