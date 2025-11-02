import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from '../logger.middleware';
import { ThirdModule } from '../../third/third.module';

@Module({
  imports: [ThirdModule],
  controllers: [ ],
  providers: [
  ],
})

/**
 * http 请求中间件可以进行验证请求是否是合法的
 */
export class AppModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggerMiddleware)
            .forRoutes('third');
    }

}

