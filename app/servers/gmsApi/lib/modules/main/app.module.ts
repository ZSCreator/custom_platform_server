import { Module } from '@nestjs/common';
import { SystemModule } from '../system/system.module';
import { ManagerBackendApiModule } from '../managerBackendApi/managerBackendApi.module';
import { PayServerModule } from '../payServerApi/payServer.module';

@Module({
    imports: [
        SystemModule,
        ManagerBackendApiModule,
        PayServerModule
    ],
    controllers: [],
    providers: [],
})

/**
 * http 请求中间件可以进行验证请求是否是合法的
 */
export class AppModule {


}

