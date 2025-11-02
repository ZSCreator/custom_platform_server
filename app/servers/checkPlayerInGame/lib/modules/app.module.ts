import { Module } from '@nestjs/common';
import {RpcModule} from "./log/rpc.module";

@Module({
    imports: [RpcModule],
    controllers: [ ],
    providers: [
    ],
})
export class AppModule {
}

