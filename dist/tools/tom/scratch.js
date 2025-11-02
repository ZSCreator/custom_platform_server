"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ScratchCardResult_mysql_dao_1 = require("../../app/common/dao/mysql/ScratchCardResult.mysql.dao");
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const data = require("./scratch_card_result.json");
RDSClient_1.RDSClient.demoInit();
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
        await ScratchCardResult_mysql_dao_1.default.insertOne(info);
        i++;
    }
    console.warn(`生成数据完成`);
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL3RvbS9zY3JhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0dBQStGO0FBQy9GLHdFQUFtRTtBQUNuRSxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUNuRCxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNWLEtBQUssVUFBVSxLQUFLO0lBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdkIsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQzdCLE1BQU0sSUFBSSxHQUFHO1lBQ1QsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ3JCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUM5QixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQ3pCLE1BQU0sRUFBRSxDQUFDO1NBQ1osQ0FBQztRQUNGLE1BQU0scUNBQXlCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hELENBQUMsRUFBRSxDQUFDO0tBQ1A7SUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNmLE9BQU87QUFDWCxDQUFDO0FBQ0QsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyJ9