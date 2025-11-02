import { Module } from '@nestjs/common';
import { ThirdController } from './controller/third.controller';
import { GoldCoinChangeWarningOrderService } from './service/goldCoinChangeWarningOrder.service';
import { ThirdService } from './service/third.service';

@Module({
    controllers: [ThirdController],
    providers: [ThirdService, GoldCoinChangeWarningOrderService],
})
export class ThirdModule { }