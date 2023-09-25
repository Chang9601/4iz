import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { PaginationDto } from '../../dtos/pagination.dto';
import { PageDto } from '../../dtos/page.dto';
import { CreateCartDto } from '../../dtos/create-cart.dto';
import { PageStateDto } from '../../dtos/page-state.dto';
import { UpdateCartDto } from '../../dtos/update-cart.dto';
import { Item } from '../../entities/item.entity';
import { User } from '../../entities/user.entity';
import { Cart } from '../../entities/cart.entity';
import { Option } from '../../entities/option.entity';
import { CartsService } from './carts.service';
import { CartsRepository } from './carts.repository';
import { ItemsService } from '../items/items.service';

describe('CartsService', () => {
  let cartsService: CartsService;
  let itemsService: Partial<ItemsService>;
  let cartsRepository: {
    createOne: (
      createCartDto: CreateCartDto,
      item: Item,
      user: User,
    ) => Promise<{ totalPrice: number; totalQuantity: number }>;
    findOne: (options: {
      where: {
        id: number;
        user: User;
      };
    }) => Promise<Cart | null>;
    findCarts: (
      paginationDto: PaginationDto,
      user: User,
    ) => Promise<PageDto<Cart>>;
    remove: (id: number, user: User) => Promise<Cart>;
    save: (carts: Cart) => Promise<Cart>;
  };

  const user: Partial<User> = {
    id: 1,
    name: '박선심',
    email: 'sunshim@naver.com',
    password: '12344321!@',
    phoneNumber: '010-1111-2222',
    birthday: new Date('1966-01-01'),
  };

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

  const options: Partial<Option>[] = [
    {
      id: 1,
      item: items[0] as Item,
      color: '검정색',
      size: '220',
      stock: 100,
    },
    {
      id: 2,
      item: items[0] as Item,
      color: '멀티컬러',
      size: '260',
      stock: 100,
    },
    {
      id: 3,
      item: items[1] as Item,
      color: '노란색',
      size: '290',
      stock: 100,
    },
    {
      id: 4,
      item: items[1] as Item,
      color: '푸른색',
      size: '270',
      stock: 0,
    },
  ];

  const createCartDto: CreateCartDto = {
    itemId: 1,
    options: ['멀티컬러/260/2'],
  };

  const updateCartDto: UpdateCartDto = {
    quantity: 4,
  };

  beforeEach(async () => {
    const carts: Cart[] = [];

    itemsService = {
      findOne: async (id: number) => {
        const item = items.find((item) => item.id === id) as Item;

        if (!item) {
          throw new NotFoundException('아이디에 해당하는 상품 없음.');
        }

        return item;
      },
    };
    cartsRepository = {
      save: async (cart: Cart) => {
        carts.push(cart);

        return cart;
      },
      remove: async (id: number, user: User) => {
        const index = carts.findIndex(
          (cart) => cart.id === id && cart.user.id === user.id,
        );

        const [cart] = carts.splice(index, 1);
        return cart;
      },
      findOne: async (options) => {
        const { where } = options;

        const cart = carts.find(
          (cart) => cart.id === where.id && cart.user.id === where.user.id,
        );

        return cart ? cart : null;
      },
      findCarts: async (paginationDto: PaginationDto, user: User) => {
        const result = carts.filter((cart) => cart.user.id === user.id);

        const total = result.length;
        const pageStateDto = new PageStateDto(total, paginationDto);

        if (pageStateDto.lastPage >= pageStateDto.currentPage) {
          return new PageDto(pageStateDto, result);
        }

        throw new NotFoundException('존재하지 않는 페이지.');
      },
      createOne: async (
        createCartDto: CreateCartDto,
        item: Item,
        user: User,
      ) => {
        const { options: optionArray } = createCartDto;
        const [color, size, quantity] = optionArray[0].split('/');

        const option = options.find(
          (option) =>
            option.item?.id === item.id &&
            option.color === color &&
            option.size === size,
        ) as Option;

        if (!option || option.stock <= 0) {
          throw new NotFoundException('옵션 재고 없음.');
        }

        const foundCart = carts.find(
          (cart) =>
            cart.options[0].item.id === item.id &&
            cart.options[0].color === option.color &&
            cart.options[0].size === option.size &&
            cart.user.id === user.id,
        );

        const qt = parseInt(quantity);

        if (foundCart) {
          carts[0].totalQuantity += qt;
          carts[0].totalPrice = carts[0].totalQuantity * item.price;
        } else {
          const cart = {
            id: 1,
            totalQuantity: qt,
            totalPrice: item.price * qt,
            options: [option],
            user: user,
          } as Cart;
          carts.push(cart);
        }

        const totalPrice = carts[0].totalPrice;
        const totalQuantity = carts[0].totalQuantity;

        return { totalPrice, totalQuantity };
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        {
          provide: ItemsService,
          useValue: itemsService,
        },
        {
          provide: CartsRepository,
          useValue: cartsRepository,
        },
      ],
    }).compile();

    cartsService = module.get<CartsService>(CartsService);
  });

  it('should be defined', () => {
    expect(itemsService).toBeDefined();
  });

  describe('create', () => {
    it('should create a single cart', async () => {
      const { totalPrice, totalQuantity } = await cartsService.create(
        createCartDto,
        user as User,
      );

      expect(totalPrice).toBe((items[0].price as number) * 2);
      expect(totalQuantity).toBe(2);
    });

    it('should update an existing cart', async () => {
      await cartsService.create(createCartDto, user as User);

      const { totalPrice, totalQuantity } = await cartsService.create(
        createCartDto,
        user as User,
      );

      expect(totalPrice).toBe((items[0].price as number) * 4);
      expect(totalQuantity).toBe(4);
    });
  });

  describe('find', () => {
    it('should get an array of carts for a user meeting conditions', async () => {
      const pagination: PaginationDto = {
        limit: 10,
        offset: 0,
        skip: 0,
      };

      await cartsService.create(createCartDto, user as User);
      const page = await cartsService.find(pagination, user as User);

      const carts = page.data;
      const state = page.state;

      expect(state.total).toBe(1);
      expect(state.currentPage).toBe(1);
      expect(carts[0].user.name).toBe(user.name);
    });

    it('should throw NotFoundException for a page that does not exist', async () => {
      const pagination: PaginationDto = {
        limit: 10,
        offset: 5,
        skip: 0,
      };

      await cartsService.create(createCartDto, user as User);
      await expect(
        cartsService.find(pagination, user as User),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a cart', async () => {
      const { totalPrice: prevTotalPrice, totalQuantity: prevTotalQuantity } =
        await cartsService.create(createCartDto, user as User);

      const { totalPrice: postTotalPrice, totalQuantity: postTotalQuantity } =
        await cartsService.update(1, updateCartDto, user as User);

      expect(postTotalPrice).toBe(prevTotalPrice * 2);
      expect(postTotalQuantity).toBe(prevTotalQuantity * 2);
    });

    it('should throw NotFoundException for an invalid id', async () => {
      await cartsService.create(createCartDto, user as User);

      await expect(
        cartsService.update(1131, updateCartDto, user as User),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a cart', async () => {
      await cartsService.create(createCartDto, user as User);
      const cart = await cartsService.delete(1, user as User);

      expect(createCartDto.itemId).toBe(cart.id);
    });

    it('should throw NotFoundException for an invalid id', async () => {
      await cartsService.create(createCartDto, user as User);

      await expect(
        cartsService.delete(4231, user as User),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});
