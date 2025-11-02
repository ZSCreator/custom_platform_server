"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nestRun = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./modules/main/app.module");
const httpException_filter_1 = require("./modules/httpException.filter");
const RDSClient_1 = require("../../../common/dao/mysql/lib/RDSClient");
const databaseService_1 = require("../../../services/databaseService");
async function nestRun() {
    await RDSClient_1.RDSClient.demoInit();
    await (0, databaseService_1.initRedisConnection)(null);
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalFilters(new httpException_filter_1.HttpExceptionFilter());
    await app.listen(3321);
    console.warn("第三方平台接口nestHttp连接成功");
}
exports.nestRun = nestRun;
nestRun();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL25lc3RIdHRwL2xpYi9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUEyQztBQUMzQywwREFBc0Q7QUFDdEQseUVBQXFFO0FBQ3JFLHVFQUFrRTtBQUNsRSx1RUFBc0U7QUFDL0QsS0FBSyxVQUFVLE9BQU87SUFJekIsTUFBTSxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBSTNCLE1BQU0sSUFBQSxxQ0FBbUIsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxNQUFNLEdBQUcsR0FBRyxNQUFNLGtCQUFXLENBQUMsTUFBTSxDQUFDLHNCQUFTLENBQUMsQ0FBQztJQUVoRCxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDakIsR0FBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksMENBQW1CLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUE7QUFHdkMsQ0FBQztBQWpCRCwwQkFpQkM7QUFNRCxPQUFPLEVBQUUsQ0FBQyJ9