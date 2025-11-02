import { Module } from '@nestjs/common';
import { PayServerController } from './payCallBack.controller';

@Module({
    controllers: [PayServerController],
    providers: [],
})
export class PayServerModule { }