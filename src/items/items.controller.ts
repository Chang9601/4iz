import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';
import { ItemsService } from './items.service';
import { Item } from './item.entity';
import { Pagination } from 'src/constants/pagination';

@Controller('items')
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

  @Get('/:id')
  @HttpCode(200)
  getItemById(@Param('id') id: number): Promise<Item> {
    return this.itemsService.getItemById(id);
  }

  @Get('/')
  @HttpCode(200)
  getItems(
    @Query('limit') limit: number = Pagination.LIMIT,
    @Query('offset') offset: number = Pagination.OFFSET,
    @Query('search') search: string = Pagination.SEARCH,
    @Query('sort') sort: string = Pagination.SORT,
    @Query() filters: Record<string, any>,
  ): Promise<Item[]> {
    return this.itemsService.getItems(limit, offset, search, sort, filters);
  }
}
