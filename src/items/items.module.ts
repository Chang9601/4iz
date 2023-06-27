import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { TypeOrmExModule } from 'src/repository/typeorm-ex.module';
import { ItemRepository } from './item.repository';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([ItemRepository])],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [TypeOrmExModule.forCustomRepository([ItemRepository])],
})
export class ItemsModule {}
