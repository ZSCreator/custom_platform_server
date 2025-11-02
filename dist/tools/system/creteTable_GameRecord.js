"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const moment = require("moment");
const SubGameRecord_mysql_dao_1 = require("../../app/common/dao/mysql/SubGameRecord.mysql.dao");
RDSClient_1.RDSClient.demoInit();
async function clean() {
    const date = moment().format("YYYYMM");
    const beExists = await SubGameRecord_mysql_dao_1.default.tableBeExists(date);
    if (!beExists) {
        await SubGameRecord_mysql_dao_1.default.createTable(date);
    }
    console.log("clear all ok!!!!");
    process.exit();
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JldGVUYWJsZV9HYW1lUmVjb3JkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvc3lzdGVtL2NyZXRlVGFibGVfR2FtZVJlY29yZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBSWIsd0VBQXFFO0FBS3JFLGlDQUFpQztBQUNqQyxnR0FBdUY7QUFHdkYscUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQU1yQixLQUFLLFVBQVUsS0FBSztJQUNoQixNQUFNLElBQUksR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFLdkMsTUFBTSxRQUFRLEdBQUcsTUFBTSxpQ0FBcUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakUsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNYLE1BQU0saUNBQXFCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2pEO0lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ2hDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyJ9