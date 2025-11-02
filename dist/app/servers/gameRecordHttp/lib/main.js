"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nestRun = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./modules/main/app.module");
const httpException_filter_1 = require("./modules/httpException.filter");
const RDSClient_1 = require("../../../common/dao/mysql/lib/RDSClient");
const databaseService_1 = require("../../../services/databaseService");
async function nestRun() {
    await RDSClient_1.RDSClient.demoInit(70);
    await (0, databaseService_1.initRedisConnection)(null);
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalFilters(new httpException_filter_1.HttpExceptionFilter());
    await app.listen(3323);
    console.warn("第三方平台接口gameRecordHttp连接成功");
}
exports.nestRun = nestRun;
nestRun();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dhbWVSZWNvcmRIdHRwL2xpYi9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUEyQztBQUMzQywwREFBc0Q7QUFDdEQseUVBQXFFO0FBQ3JFLHVFQUFrRTtBQUNsRSx1RUFBc0U7QUFDL0QsS0FBSyxVQUFVLE9BQU87SUFJekIsTUFBTSxxQkFBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUk3QixNQUFNLElBQUEscUNBQW1CLEVBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEMsTUFBTSxHQUFHLEdBQUcsTUFBTSxrQkFBVyxDQUFDLE1BQU0sQ0FBQyxzQkFBUyxDQUFDLENBQUM7SUFFaEQsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ2pCLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLDBDQUFtQixFQUFFLENBQUMsQ0FBQztJQUNoRCxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFBO0FBRzdDLENBQUM7QUFqQkQsMEJBaUJDO0FBTUQsT0FBTyxFQUFFLENBQUMifQ==