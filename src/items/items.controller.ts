import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { GetItemByIdDto } from './dto/get-item-by-id.dto';
import { RequestGetItemsDto } from './dto/request-get-items.dto';
import { ResponseGetItemsDto } from './dto/response-get-items.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('/:id')
  @HttpCode(200)
  async getItemById(@Param('id') id: number): Promise<GetItemByIdDto> {
    return this.itemsService.getItemById(id);
  }

  @Get('/')
  @HttpCode(200)
  async getItems(
    @Query(new ValidationPipe({ transform: true }))
    conditions: RequestGetItemsDto,
  ): Promise<ResponseGetItemsDto> {
    return this.itemsService.getItems(conditions);
  }
}
