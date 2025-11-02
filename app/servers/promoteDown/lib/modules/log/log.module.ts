import {Module, NestModule, MiddlewareConsumer} from '@nestjs/common';
import { promoteDownController } from './promoteDown.controller';

@Module({
    controllers: [promoteDownController],
    providers: [],
})
export class LogModule{
}