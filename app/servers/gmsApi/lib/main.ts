import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/main/app.module';
import * as session from 'express-session';
import { HttpExceptionFilter } from "./support/code/httpException.filter";
import { ValidationPipe } from './support/code/validate.pipe';
import { setupSwagger } from './swagger';
import { CheckTransformDataPipe } from './support/code/checkTransformData.pipe';
import { pinus } from "pinus";

export async function nestRun() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  if ("development" === pinus.app.get("env")) {
    setupSwagger(app);
  }
  app.enableCors();
  app.use(
    session({
      secret: 'development',
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: true
      },
      resave: false,
      saveUninitialized: true
    })
  );
  /**
   * 管道: 转换数据
   * 管道: 校验请求参数
   */
  app.useGlobalPipes(new CheckTransformDataPipe(), new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3320);
}
