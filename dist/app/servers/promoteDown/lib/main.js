"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nestRun = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./modules/app.module");
const RDSClient_1 = require("../../../common/dao/mysql/lib/RDSClient");
async function nestRun() {
    await RDSClient_1.RDSClient.demoInit();
    console.warn("启动下载页服务器-----开始");
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    await app.listen(3322);
    console.warn("启动下载页服务器------完成");
}
exports.nestRun = nestRun;
nestRun();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3Byb21vdGVEb3duL2xpYi9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUEyQztBQUMzQyxxREFBaUQ7QUFDakQsdUVBQWtFO0FBRTNELEtBQUssVUFBVSxPQUFPO0lBSXpCLE1BQU0scUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUszQixPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDaEMsTUFBTSxHQUFHLEdBQUcsTUFBTSxrQkFBVyxDQUFDLE1BQU0sQ0FBQyxzQkFBUyxDQUFDLENBQUM7SUFFaEQsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ2pCLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDckMsQ0FBQztBQWZELDBCQWVDO0FBRUQsT0FBTyxFQUFFLENBQUMifQ==