import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemRepository } from './item.repository';
import { Item } from './item.entity';

@Injectable()
export class ItemsService {
  constructor(private readonly itemRepository: ItemRepository) {}

  // Not exactly Item, but how?
  async getItemById(id: number): Promise<Item> {
    const item = await this.itemRepository.getItemById(id);

    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }

    return item;
  }

  async getItems(
    limit: number,
    offset: number,
    search: string,
    sort: string,
    filters: Record<string, any>,
  ): Promise<any> {
    delete filters.sort;
    delete filters.search;

    const items = await this.itemRepository.getItems(
      limit,
      offset,
      search,
      sort,
      filters,
    );

    return items;
  }
}
