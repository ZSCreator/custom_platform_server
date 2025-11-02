"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcRun = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./modules/app.module");
async function RpcRun() {
    console.warn("启动Rpc下分通知服务-----开始");
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await app.listen(3324);
    console.warn("启动Rpc下分通知服务------完成");
}
exports.RpcRun = RpcRun;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2NoZWNrUGxheWVySW5HYW1lL2xpYi9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUEyQztBQUMzQyxxREFBaUQ7QUFDMUMsS0FBSyxVQUFVLE1BQU07SUFFeEIsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ25DLE1BQU0sR0FBRyxHQUFHLE1BQU0sa0JBQVcsQ0FBQyxNQUFNLENBQUMsc0JBQVMsQ0FBQyxDQUFDO0lBQ2hELE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDeEMsQ0FBQztBQU5ELHdCQU1DIn0=