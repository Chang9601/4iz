import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { GetItemsDto } from './dto/get-items.dto';
import { GetItemByIdDto } from './dto/get-item-by-id.dto';
import { ItemProcessor } from 'src/utils/item-processor';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('/:id')
  @HttpCode(200)
  getItemById(@Param('id') id: number): Promise<GetItemByIdDto> {
    return this.itemsService.getItemById(id);
  }

  @Get('/')
  @HttpCode(200)
  getItems(
    @Query(new ValidationPipe({ transform: true })) conditions: ItemProcessor,
  ): Promise<GetItemsDto> {
    return this.itemsService.getItems(conditions);
  }
}
