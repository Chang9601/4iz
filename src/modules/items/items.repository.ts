import { In, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { PaginationDto } from '../../dtos/pagination.dto';
import { PageDto } from '../../dtos/page.dto';
import { PageStateDto } from '../../dtos/page-state.dto';
// import { GetOptionsDto } from '../../dtos/get-options.dto';
import { Item } from '../../entities/item.entity';
import { QueryBuilder } from '../../common/factories/query-builder.factory';
import { buildOption } from '../../common/factories/common.factory';

export class ItemsRepository extends Repository<Item> {
  constructor(
    @InjectRepository(Item) private readonly itemsRepository: Repository<Item>,
  ) {
    super(
      itemsRepository.target,
      itemsRepository.manager,
      itemsRepository.queryRunner,
    );
  }

  async findItem(id: number) {
    const INCLUDED_FIELDS = [
      'item.id',
      'item.name',
      'item.gender',
      'item.isNew',
      'item.price',
      'item.discountRate',
      'item.description',
      'item.releaseDate',
    ];

    const queryBuilder = this.itemsRepository
      .createQueryBuilder('item')
      .select(INCLUDED_FIELDS)
      .where('item.id = :id', { id });

    queryBuilder
      .innerJoinAndSelect(
        'item.options',
        'options',
        'options.item_id = item.id',
      )
      .innerJoinAndSelect('item.images', 'images', 'images.item_id = item.id')
      .innerJoinAndSelect(
        'item.categories',
        'categories',
        'item_categories.category_id = categories.id',
      );

    const item = await queryBuilder.getOne();

    if (!item) {
      throw new NotFoundException('아이디에 해당하는 상품 없음.');
    }

    // fetch() 메서드로 전달하는 쿼리 매개변수가 검증을 통과하지 못하는 오류로 임시방편으로 4개의 옵션만 추출한다.
    const indexes = [0, 24, 48, 72];
    item.options = indexes.map((index) => item.options[index]);

    return item;
  }

  // 쿼리 수정 필요.
  async findItems(paginationDto: PaginationDto) {
    const {
      limit: take,
      search,
      skip,
      sort,
      color,
      gender,
      size,
    } = paginationDto;

    const queryBuilder = new QueryBuilder(sort);

    const sortQuery = queryBuilder.buildSortQuery();
    const orderQuery = queryBuilder.buildOrderQuery();

    const [items, total] = await this.itemsRepository.findAndCount({
      where: [
        {
          name: Like(`%${search}%`),
        },
        {
          description: Like(`%${search}%`),
        },
        {
          categories: [
            {
              name: Like(`%${search}%`),
            },
          ],
        },
        {
          gender: In([gender]),
        },
        { options: [{ color: In([color]), size: In([size]) }] },
      ],
      relations: ['images', 'categories'],
      select: [
        'id',
        'name',
        'gender',
        'isNew',
        'price',
        'discountRate',
        'releaseDate',
      ],
      order: {
        [sortQuery]: orderQuery,
      },
      take,
      skip,
    });

    const pageStateDto = new PageStateDto(total, paginationDto);

    if (pageStateDto.lastPage < pageStateDto.currentPage) {
      throw new NotFoundException('존재하지 않는 페이지.');
    }

    return new PageDto(pageStateDto, items);
  }

  async findItemByOptionId(id: number) {
    const option = buildOption({ options: { id } });

    const item = await this.itemsRepository.findOne(option);

    if (!item) {
      throw new NotFoundException('존재하지 않는 상품.');
    }

    return item;
  }

  // async findOptions(getOptions: GetOptionsDto) {
  //   try {
  //     const { ids } = getOptions;

  //     const options = await this.optionsRepository.findBy({
  //       id: In(ids),
  //     });

  //     return options;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       '조건을 만족하는 옵션 검색 중 오류 발생.',
  //     );
  //   }
  // }
}
