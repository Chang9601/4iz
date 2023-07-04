import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ItemsRepository } from './items.repository';
import { Item } from './item.entity';
import { RequestGetItemsDto } from './dto/request.get-items.dto';
import { NotFoundException } from '@nestjs/common';

const item1 = {
  name: '나이키 플렉스 슈즈',
  gender: '남성',
  price: 259000.0,
  discountRate: 0,
  description: '매우 유연한',
  releaseDate: new Date('2012-04-13'),
};

const item2 = {
  name: '나이키코트 슈즈 블로그',
  gender: '여성',
  price: 189000.0,
  discountRate: 65,
  description: '블로그 테니스화',
  releaseDate: new Date('2023-03-05'),
};

const item3 = {
  name: '스테판 슈즈 엑스',
  gender: '여성',
  price: 259000.0,
  discountRate: 0,
  description: '환상적인 농구화',
  releaseDate: new Date('2018-01-24'),
};

const items = [item1, item2, item3];

describe('ItemsService', () => {
  let service: ItemsService;
  let mockItemsRepository: Partial<ItemsRepository>;

  beforeEach(async () => {
    mockItemsRepository = {
      getItemById: async (id: number) => {
        if (id >= items.length) {
          throw new NotFoundException(`Item with id ${id} not found`);
        }

        return {
          item: {
            id,
            ...item1,
          } as Item,
        };
      },
      getItems: async (conditions: RequestGetItemsDto) => {
        const result = items.filter((item) => {
          return item.name.indexOf(conditions.search) !== -1;
        }) as Item[];

        return {
          total: result.length,
          offset: conditions.offset,
          items: result,
        };
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: getRepositoryToken(ItemsRepository),
          useValue: mockItemsRepository,
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get a single item', async () => {
    const id = 1;
    const dto = await service.getItemById(id);
    const item = dto.item;

    expect(item).toHaveProperty('id');
    expect(item.gender).toBe('남성');
    expect(item.discountRate).toBe(0);
  });

  it('should throw a NotFoundException', async () => {
    const id = 100;
    await expect(service.getItemById(id)).rejects.toThrowError(
      NotFoundException,
    );
  });

  it('should get an array of items', async () => {
    const conditions: RequestGetItemsDto = {
      limit: 10,
      offset: 1,
      search: '나이키',
      sort: 'high',
    };
    const dto = await service.getItems(conditions);
    const items = dto.items;

    expect(dto.total).toBe(2);
    expect(dto.offset).toBe(1);
    expect(items[0].description).toBe('매우 유연한');
    expect(items[1].discountRate).toBe(65);
  });
});
