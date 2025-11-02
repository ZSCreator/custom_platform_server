import {Module, NestModule, MiddlewareConsumer} from '@nestjs/common';
import { ClientLogController, } from './clientLog.controller';

@Module({
    controllers: [ClientLogController],
    providers: [],
})
export class LogModule{
}