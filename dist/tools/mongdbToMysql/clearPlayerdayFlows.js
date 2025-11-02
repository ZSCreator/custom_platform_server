"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
RDSClient_1.RDSClient.demoInit();
async function clean() {
    console.warn(`开始执行时间：${new Date()}`);
    process.exit();
    console.warn(`结算时间：${new Date()}`);
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYXJQbGF5ZXJkYXlGbG93cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL21vbmdkYlRvTXlzcWwvY2xlYXJQbGF5ZXJkYXlGbG93cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdFQUFxRTtBQU1yRSxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3JCLEtBQUssVUFBVSxLQUFLO0lBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQWtHckMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2YsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ25DLE9BQU87QUFDWCxDQUFDO0FBR0QsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyJ9