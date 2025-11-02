"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const third_service_1 = require("../app/servers/nestHttp/lib/third/service/third.service");
async function timeFormatter() {
    channelMessage: third_service_1.ThirdService;
    try {
        console.warn("API上下分测试");
        const service = new third_service_1.ThirdService(this);
        const result = await service.checkPlayerMoney("123456", "22222222");
        console.warn('result...', result);
        return;
    }
    catch (error) {
        return;
    }
}
timeFormatter();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rvb2xzL2FwaVRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUNiLDJGQUF1RjtBQUV2RixLQUFLLFVBQVUsYUFBYTtJQUN4QixjQUFjLEVBQUUsNEJBQVksQ0FBQztJQUV6QixJQUFJO1FBQ0EsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUN4QixNQUFNLE9BQU8sR0FBRyxJQUFJLDRCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdkMsTUFBTyxNQUFNLEdBQUcsTUFBTyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RFLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ2hDLE9BQU87S0FDVjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTztLQUNWO0FBRVQsQ0FBQztBQUdELGFBQWEsRUFBRSxDQUFDIn0=