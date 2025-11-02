import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
export async function RpcRun() {

    console.warn("启动Rpc下分通知服务-----开始");
    const app = await NestFactory.create(AppModule);
    await app.listen(3324);
    console.warn("启动Rpc下分通知服务------完成");
}
