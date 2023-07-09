import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmExModule } from '../repository/typeorm-ex.module';
import { AuthModule } from '../auth/auth.module';
import { OrderRepository } from './order.repository';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([OrderRepository]), AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
