import { Injectable } from '@nestjs/common';

import { ItemsRepository } from './items.repository';
import { PaginationDto } from '../../dtos/pagination.dto';
// import { GetOptionsDto } from '../../dtos/get-options.dto';

@Injectable()
export class ItemsService {
  constructor(private readonly itemsRepository: ItemsRepository) {}

  async findOne(id: number) {
    return await this.itemsRepository.findItem(id);
  }

  async find(paginationDto: PaginationDto) {
    return await this.itemsRepository.findItems(paginationDto);
  }

  async findOneByOptionId(id: number) {
    return await this.itemsRepository.findItemByOptionId(id);
  }

  // async findOptions(getOptions: GetOptionsDto) {
  //   return await this.itemsRepository.findOptions(getOptions);
  // }
}
