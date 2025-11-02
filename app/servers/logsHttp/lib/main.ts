import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import {RDSClient} from "../../../common/dao/mysql/lib/RDSClient";
import {initRedisConnection} from "../../../services/databaseService";
export async function nestRun() {
    /**
     * 连接数据库
     */
    // await RDSClient.demoInit();
    /**
     * 连接redis
     */
    // await initRedisConnection(null);
    console.warn("启动前端日志服务器-----开始");
    const app = await NestFactory.create(AppModule);
    // 处理跨域
    app.enableCors();
    await app.listen(3360);
    console.warn("启动前端日志服务器------完成");
}

nestRun();