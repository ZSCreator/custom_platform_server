import {Module } from '@nestjs/common';
import { RpcHttpController, } from './rpcHttp.controller';

@Module({
    controllers: [RpcHttpController],
    providers: [],
})
export class RpcModule{
}