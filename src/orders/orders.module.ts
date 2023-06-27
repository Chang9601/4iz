import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmExModule } from 'src/repository/typeorm-ex.module';
import { AuthModule } from 'src/auth/auth.module';
import { OrderRepository } from './order.repository';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([OrderRepository]), AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
