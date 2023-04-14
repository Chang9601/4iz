import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemRepository } from './item.repository';
import { Item } from './item.entity';

@Injectable()
export class ItemsService {
  constructor(private readonly itemRepository: ItemRepository) {}

  async getItemById(id: number): Promise<Item> {
    const item = await this.itemRepository.getItemById(id);

    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }

    return item;
  }
}
