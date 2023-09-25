import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { Cart } from '../../entities/cart.entity';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { CartsRepository } from './carts.repository';
import { ItemsModule } from '../items/items.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cart]), ItemsModule],
  controllers: [CartsController],
  providers: [CartsService, CartsRepository],
  exports: [CartsService],
})
export class CartsModule {}
