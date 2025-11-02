import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import {LogModule} from "./log/log.module";

@Module({
    imports: [LogModule],
    controllers: [ ],
    providers: [
    ],
})
export class AppModule {
}

