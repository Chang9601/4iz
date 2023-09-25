import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from '../../entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { CartsModule } from '../carts/carts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), CartsModule],
  providers: [OrdersService, OrdersRepository],
  controllers: [OrdersController],
})
export class OrdersModule {}
