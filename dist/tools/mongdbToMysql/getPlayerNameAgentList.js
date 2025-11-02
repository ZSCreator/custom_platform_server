"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const PlatformNameAgentList_redis_dao_1 = require("../../app/common/dao/redis/PlatformNameAgentList.redis.dao");
RDSClient_1.RDSClient.demoInit();
async function clean() {
    console.warn(`开始执行`);
    await PlatformNameAgentList_redis_dao_1.default.findAllPlatformUidList(true);
    console.warn(`执行完成`);
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UGxheWVyTmFtZUFnZW50TGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL21vbmdkYlRvTXlzcWwvZ2V0UGxheWVyTmFtZUFnZW50TGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdFQUFxRTtBQUNyRSxnSEFBdUc7QUFFdkcscUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNyQixLQUFLLFVBQVUsS0FBSztJQUNoQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JCLE1BQU0seUNBQTZCLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDaEUsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyQixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZixPQUFPO0FBQ1gsQ0FBQztBQUNELFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMifQ==