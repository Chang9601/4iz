import { Module } from '@nestjs/common';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { TypeOrmExModule } from 'src/db/typeorm-ex.module';
import { CartRepository } from './cart.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  // Import AuthModule to use it in CartsModule
  imports: [TypeOrmExModule.forCustomRepository([CartRepository]), AuthModule],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
