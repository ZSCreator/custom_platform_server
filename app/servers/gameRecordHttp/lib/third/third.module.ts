import { Module } from '@nestjs/common';
import { ThirdController } from './controller/third.controller';
import { ThirdService } from './service/third.service';

@Module({
    controllers: [ThirdController],
    providers: [ThirdService],
})
export class ThirdModule { }