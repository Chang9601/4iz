import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { TypeOrmExModule } from './../repository/typeorm-ex.module';
import { ItemsRepository } from './items.repository';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([ItemsRepository])],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [TypeOrmExModule.forCustomRepository([ItemsRepository])],
})
export class ItemsModule {}
