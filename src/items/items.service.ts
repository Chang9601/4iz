import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemRepository } from './item.repository';
import { GetItemsDto } from './dto/get-items.dto';
import { GetItemByIdDto } from './dto/get-item-by-id.dto';
import { ItemProcessor } from 'src/utils/item-processor';

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

  async getItems(conditions: ItemProcessor): Promise<GetItemsDto> {
    return await this.itemRepository.getItems(conditions);
  }
}
