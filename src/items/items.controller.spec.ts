import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { RequestGetItemsDto } from './dto/request.get-items.dto';
import { Item } from './item.entity';
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

describe('ItemsController', () => {
  let controller: ItemsController;
  let mockItemsService: Partial<ItemsService>;

  beforeEach(async () => {
    mockItemsService = {
      getItemById: async (id: number) => {
        if (id >= items.length) {
          throw new NotFoundException(`Item with id ${id} not found`);
        }

        return {
          item: {
            id,
            ...item2,
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
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: mockItemsService,
        },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get a single item', async () => {
    const id = 2;
    const dto = await controller.getItemById(id);
    const item = dto.item;

    expect(item).toHaveProperty('id');
    expect(item.gender).toBe('여성');
    expect(item.discountRate).toBe(65);
  });

  it('should throw a NotFoundException', async () => {
    const id = 100;
    await expect(controller.getItemById(id)).rejects.toThrowError(
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
    const dto = await controller.getItems(conditions);
    const items = dto.items;

    expect(dto.total).toBe(2);
    expect(dto.offset).toBe(1);
    expect(items[0].description).toBe('매우 유연한');
    expect(items[1].discountRate).toBe(65);
  });
});
