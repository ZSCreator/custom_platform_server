"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const AiAutoCreat_1 = require("../../app/servers/robot/lib/AiAutoCreat");
async function run() {
    await RDSClient_1.RDSClient.demoInit();
    await (0, AiAutoCreat_1.createTestPlayer)();
    console.warn('创建完成');
    process.exit();
}
process.nextTick(run);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkVGVzdFJlYWxQbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy90b20vYWRkVGVzdFJlYWxQbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFBcUU7QUFDckUseUVBQXlFO0FBRXpFLEtBQUssVUFBVSxHQUFHO0lBQ2QsTUFBTSxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRzNCLE1BQU0sSUFBQSw4QkFBZ0IsR0FBRSxDQUFDO0lBRXpCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFckIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLENBQUM7QUFFRCxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDIn0=