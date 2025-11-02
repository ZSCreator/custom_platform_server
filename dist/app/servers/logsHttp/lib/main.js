"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nestRun = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./modules/app.module");
async function nestRun() {
    console.warn("启动前端日志服务器-----开始");
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    await app.listen(3360);
    console.warn("启动前端日志服务器------完成");
}
exports.nestRun = nestRun;
nestRun();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2xvZ3NIdHRwL2xpYi9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUEyQztBQUMzQyxxREFBaUQ7QUFHMUMsS0FBSyxVQUFVLE9BQU87SUFTekIsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ2pDLE1BQU0sR0FBRyxHQUFHLE1BQU0sa0JBQVcsQ0FBQyxNQUFNLENBQUMsc0JBQVMsQ0FBQyxDQUFDO0lBRWhELEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNqQixNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFmRCwwQkFlQztBQUVELE9BQU8sRUFBRSxDQUFDIn0=