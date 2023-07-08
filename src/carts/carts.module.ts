import { Module } from '@nestjs/common';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { TypeOrmExModule } from 'src/repository/typeorm-ex.module';
import { CartsRepository } from './carts.repository';
import { AuthModule } from 'src/auth/auth.module';
import { ItemsModule } from 'src/items/items.module';

@Module({
  // Import AuthModule to use it in CartsModule
  imports: [
    TypeOrmExModule.forCustomRepository([CartsRepository]),
    AuthModule,
    ItemsModule,
  ],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
