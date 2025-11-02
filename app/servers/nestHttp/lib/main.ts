import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/main/app.module';
import { HttpExceptionFilter } from './modules/httpException.filter';
import {RDSClient} from "../../../common/dao/mysql/lib/RDSClient";
import {initRedisConnection} from "../../../services/databaseService";
export async function nestRun() {
    /**
     * 连接数据库
     */
    await RDSClient.demoInit();
    /**
     * 连接redis
     */
    await initRedisConnection(null);
    const app = await NestFactory.create(AppModule);
    // 处理跨域
    app.enableCors();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.listen(3321);
    console.warn("第三方平台接口nestHttp连接成功")


}





nestRun();