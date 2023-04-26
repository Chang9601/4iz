import { Module } from '@nestjs/common';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { TypeOrmExModule } from 'src/db/typeorm-ex.module';
import { CartRepository } from './cart.repository';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([CartRepository])],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
