import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsModule } from './items/items.module';
import { CartsModule } from './carts/carts.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { TypeOrmConfigModule } from './config/typeorm-config.module';
import { TypeOrmConfigService } from './config/typeorm-config.service';

@Module({
  imports: [
    ItemsModule,
    CartsModule,
    AuthModule,
    OrdersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [TypeOrmConfigModule],
      inject: [TypeOrmConfigService],
      useFactory: async (configService: TypeOrmConfigService) => {
        return configService.mysqlConfig;
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
