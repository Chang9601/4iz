import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemRepository } from './item.repository';

import { GetItemByIdDto } from './dto/get-item-by-id.dto';
import { RequestGetItemsDto } from './dto/request-get-items.dto';
import { ResponseGetItemsDto } from './dto/response-get-items.dto';

@Injectable()
export class ItemsService {
  constructor(private readonly itemRepository: ItemRepository) {}

  async getItemById(id: number): Promise<GetItemByIdDto> {
    const itemDto = await this.itemRepository.getItemById(id);
    const item = itemDto.item;

    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }

    return itemDto;
  }

  async getItems(conditions: RequestGetItemsDto): Promise<ResponseGetItemsDto> {
    return this.itemRepository.getItems(conditions);
  }
}
