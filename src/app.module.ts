import { join } from 'path';

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as Joi from '@hapi/joi';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';

import { ItemsModule } from './modules/items/items.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartsModule } from './modules/carts/carts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { HealthModule } from './modules/health/health.module';
import { CustomCacheModule } from './modules/cache/custom-cache.module';
import { AdminModule } from './modules/admin/admin.module';
import { CacheConfigService } from './configs/cache-config.service';
import { TypeOrmConfigService } from './configs/typeorm-config.service';
import { AllExceptionFilter } from './filters/all-exception.filter';
import { LoggerMiddleware } from './middlewares/logger.middleware';

@Module({
  imports: [
    ItemsModule,
    AuthModule,
    CartsModule,
    OrdersModule,
    HealthModule,
    CustomCacheModule,
    AdminModule,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'views'),
    }),
    // Joi를 사용하면 객체 스키마를 정의하고 애플리케이션 실행 전 환경 변수를 검증한다.
    ConfigModule.forRoot({
      // ConfigService에서 환경 변수 값을 읽으려면 먼저 ConfigService를 주입해야 한다.
      // 즉, 어느 프로바이더와 마찬가지로 ConfigService를 포함하는 모듈인 ConfigModule을 가져와야 한다.
      // 그러나, ConfigModule.forRoot() 메서드에 전달된 옵션 객체의 isGlobal 속성을 true로 설정할 경우 필요없다.
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validationSchema: Joi.object({
        HOST: Joi.string().required(),
        PORT: Joi.number().required(),
        DB_TYPE: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_DATABASE: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION: Joi.string().required(),
        CACHE_TTL: Joi.number().required(),
        CACHE_MAX: Joi.number().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    CacheModule.registerAsync({
      useClass: CacheConfigService,
      // CacheConfigService에서 isGlobal: true가 있어도 app.module.ts 파일에서 설정해야 전역으로 적용된다.
      isGlobal: true,
    }),
  ],
  // main.ts에 설정하면 의존성 주입을 사용할 수 없으며 E2E 테스트의 경우 미들웨어 사용하지 않는다.
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        // 유효성 검사 데코레이터로(e.g., @Matches, @IsDate, ...) 데코레이트된 속성만 DTO 객체에서 허용하며 명시적으로 데코레이트되지 않은 추가 속성은 제거된다.
        // 유효성 검사 시 null 또는 undefined을 생략한다.
        whitelist: true,
        // PATCH 요청 시 요청 페이로드에 일부 필드가 포함되지 않을 경우 DTO에서는 undefined로 설정된다.
        // @IsOptional()을 사용하지 않으면 class-validator는 이러한 정의되지 않은 속성을 유효성 검사 오류로 처리한다.
        // 왜냐하면 이러한 속성은 유효성 검사 데코레이터에서 지정한 제약 조건을 충족하지 못하기 때문이다.
        // @IsOptional() 데코레이터를 속성에 적용 해당 속성이 undefind 혹은 null일 수 있으며 페이로드에 없으면 해당 속성에 대한 유효성 검사를 생략한다.
        skipMissingProperties: true,
      }),
    },
  ],
})
export class AppModule implements NestModule {
  corsOptions: CorsOptions = {
    origin:
      process.env.NODE_ENV === 'production'
        ? false
        : ['http://127.0.0.1:3000', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  };

  configure(consumer: MiddlewareConsumer) {
    // cookieParse(): 쿠키를 읽기 쉬운 객체 형태로 파싱하는 미들웨어.
    // cors(): CORS 설정 미들웨어.
    consumer
      .apply(cors(this.corsOptions), cookieParser(), LoggerMiddleware)
      .forRoutes('*');
  }
}
