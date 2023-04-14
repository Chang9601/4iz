import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ItemsService } from './items.service';
import { Item } from './item.entity';

@Controller('items')
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

  @Get('/:id')
  @HttpCode(200)
  getItemById(@Param('id') id: number): Promise<Item> {
    return this.itemsService.getItemById(id);
  }
}
