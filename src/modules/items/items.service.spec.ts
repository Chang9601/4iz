import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { PaginationDto } from '../../dtos/pagination.dto';
import { PageStateDto } from '../../dtos/page-state.dto';
import { PageDto } from '../../dtos/page.dto';
import { Item } from '../../entities/item.entity';
import { ItemsService } from './items.service';
import { ItemsRepository } from './items.repository';

describe('ItemsService', () => {
  let itemsService: ItemsService;
  let itemsRepository: Partial<ItemsRepository>;

  const items: Partial<Item>[] = [
    {
      id: 1,
      name: '나이키 플렉스 슈즈',
      gender: '남성',
      isNew: false,
      price: 259000.0,
      discountRate: 0,
      description: '매우 유연한',
      releaseDate: new Date('2012-04-13'),
    },
    {
      id: 2,
      name: '나이키코트 슈즈 블로그',
      gender: '여성',
      price: 189000.0,
      isNew: true,
      discountRate: 65,
      description: '블로그 테니스화',
      releaseDate: new Date('2023-03-05'),
    },
    {
      id: 3,
      name: '스테판 슈즈 엑스',
      gender: '여성',
      price: 259000.0,
      isNew: false,
      discountRate: 0,
      description: '환상적인 농구화',
      releaseDate: new Date('2018-01-24'),
    },
  ];

  beforeEach(async () => {
    itemsRepository = {
      findItem: async (id: number) => {
        const item = items.find((item) => item.id === id) as Item;

        if (!item) {
          throw new NotFoundException('아이디에 해당하는 상품 없음.');
        }

        return item;
      },
      findItems: async (paginationDto: PaginationDto) => {
        const { search, sort } = paginationDto;

        const result = items.filter((item) => {
          return item.name?.indexOf(search as string) !== -1;
        }) as Item[];

        if (sort === 'low') {
          result.sort((a, b) => a.price - b.price);
        }

        const total = result.length;
        const pageStateDto = new PageStateDto(total, paginationDto);

        if (pageStateDto.lastPage >= pageStateDto.currentPage) {
          return new PageDto(pageStateDto, result);
        }

        throw new NotFoundException('존재하지 않는 페이지.');
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: ItemsRepository,
          useValue: itemsRepository,
        },
      ],
    }).compile();

    itemsService = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(itemsService).toBeDefined();
  });

  describe('findOne', () => {
    it('should get a single item', async () => {
      const id = Math.floor(Math.random() * items.length) + 1;
      const item = await itemsService.findOne(id);

      const index = items.findIndex((item) => item.id === id);

      expect(item.gender).toBe(items[index].gender);
      expect(item.discountRate).toBe(items[index].discountRate);
    });

    it('should throw NotFoundException for an item that does not exist', async () => {
      const id = Math.floor(Math.random() * items.length) + 100;

      await expect(itemsService.findOne(id)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('find', () => {
    it('should get an array of items meeting conditions', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        offset: 0,
        search: '나이키',
        sort: 'high',
        skip: 0,
      };

      const page = await itemsService.find(paginationDto);

      const items = page.data;
      const state = page.state;

      expect(state.total).toBe(2);
      expect(state.currentPage).toBe(1);
      expect(items[0].description).toBe('매우 유연한');
      expect(items[1].discountRate).toBe(65);
    });

    it('should throw NotFoundException for a page that does not exist', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        offset: 5,
        search: '나이키',
        sort: 'high',
        skip: 0,
      };

      await expect(itemsService.find(paginationDto)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
