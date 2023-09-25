import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PageDto } from '../../dtos/page.dto';
import { PaginationDto } from '../../dtos/pagination.dto';
import { PageStateDto } from '../../dtos/page-state.dto';
import { CreateOrderDto } from '../../dtos/create-order.dto';
import { User } from '../../entities/user.entity';
import { Cart } from '../../entities/cart.entity';
import { Option } from '../../entities/option.entity';
import { Order } from '../../entities/order.entity';
import { OrderToOption } from '../../entities/order-option.entity';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CartsService } from '../carts/carts.service';

describe('OrdersService', () => {
  let ordersService: OrdersService;
  let ordersRepository: {
    createOne: (createOrderDto: CreateOrderDto, user: User) => Promise<Order>;
    findOrders: (
      paginationDto: PaginationDto,
      user: User,
    ) => Promise<PageDto<Order>>;
    findAll: (id: number) => Promise<string[]>;
    deleteOne: (id: number, user: User) => Promise<Order>;
  };
  let cartsService: Partial<CartsService>;
  const cache = {
    get: jest.fn(),
    del: jest.fn(),
  };

  const users: Partial<User>[] = [
    {
      id: 1,
      name: '박선심',
      email: 'sunshim@naver.com',
      password: '12344321!@',
      phoneNumber: '010-1111-2222',
      birthday: new Date('1966-01-01'),
    },
    {
      id: 2,
      name: '실비아',
      email: 'silvia@naver.com',
      password: '12344321!@',
      phoneNumber: '010-3333-4444',
      birthday: new Date('1976-01-01'),
    },
    {
      id: 3,
      name: '홍길동',
      email: 'kildong@naver.com',
      password: '12344321!@',
      phoneNumber: '010-5555-6666',
      birthday: new Date('1000-01-01'),
    },
  ];

  const options: Partial<Option>[] = [
    {
      id: 1,
      color: '검정색',
      size: '220',
      stock: 100,
    },
    {
      id: 2,
      color: '멀티컬러',
      size: '260',
      stock: 100,
    },
    {
      id: 3,
      color: '노란색',
      size: '290',
      stock: 100,
    },
    {
      id: 4,
      color: '푸른색',
      size: '270',
      stock: 100,
    },
  ];

  const carts: Partial<Cart>[] = [
    {
      id: 1,
      totalQuantity: 2,
      totalPrice: 259000,
      user: users[0] as User,
      options: [options[0] as Option],
    },
    {
      id: 2,
      totalQuantity: 4,
      totalPrice: 189000.0,
      user: users[0] as User,
      options: [options[2] as Option],
    },
    {
      id: 3,
      totalQuantity: 1,
      totalPrice: 122000.0,
      user: users[1] as User,
      options: [options[3] as Option],
    },
  ];

  const createOrderDto: CreateOrderDto = {
    streetAddress: '부산광역시 기장군 일광읍 기장대로 692',
    address: '4층 정장계',
    zipcode: '46044',
  };

  beforeEach(async () => {
    const orders: Order[] = [];
    const orderToOptions: OrderToOption[] = [];

    ordersRepository = {
      createOne: async (createOrderDto: CreateOrderDto, user: User) => {
        const myCarts = carts.filter(
          (cart) => cart.user?.id === user.id,
        ) as Cart[];

        if (myCarts.length <= 0) {
          throw new NotFoundException('빈 장바구니.');
        }

        const { streetAddress, address, zipcode } = createOrderDto;

        const options = myCarts.map((myCart) => myCart.options[0]);
        const totalQuantity = myCarts.reduce(
          (total, myCart) => total + myCart.totalQuantity,
          0,
        );
        const totalPrice = myCarts.reduce(
          (total, myCart) => total + myCart.totalPrice,
          0,
        );

        for (let index = 0; index < myCarts.length; index++) {
          options[index].stock -= myCarts[index].totalQuantity;
        }

        const orderDate = new Date();
        const orderNumber = randomUUID();

        const order = {
          id: 1,
          streetAddress,
          address,
          zipcode,
          orderDate,
          orderNumber,
          totalPrice,
          totalQuantity,
          user,
        } as Order;

        for (let index = 0; index < myCarts.length; index++) {
          const orderToOption = {
            id: Math.floor(Math.random() * 10000) + 1,
            option: options[index],
            order: order,
            totalQuantity: myCarts[index].totalQuantity,
          };
          orderToOptions.push(orderToOption);
        }

        order.orderToOptions = orderToOptions;
        orders.push(order);

        return order;
      },
      deleteOne: async (id: number, user: User) => {
        const index = orders.findIndex(
          (order) => order.id === id && order.user.id === user.id,
        );

        if (index === -1) {
          throw new NotFoundException('아이디에 해당하는 주문 없음.');
        }

        const [order] = orders.splice(index, 1);

        return order;
      },
      findOrders: async (paginationDto: PaginationDto, user: User) => {
        const result = orders.filter((order) => order.user.id === user.id);
        const total = result.length;
        const pageStateDto = new PageStateDto(total, paginationDto);

        if (pageStateDto.lastPage >= pageStateDto.currentPage) {
          return new PageDto(pageStateDto, result);
        }

        throw new NotFoundException('존재하지 않는 페이지.');
      },
      findAll: async (id: number) => {
        const index = orders.findIndex((order) => order.id === id);

        return [index.toString()];
      },
    };

    cartsService = {
      findAll: async (user: User) => {
        const foundCarts = carts.filter(
          (cart) => cart.user?.id === user.id,
        ) as Cart[];
        const optionIds = foundCarts.map((cart) =>
          cart.options[0].id.toString(),
        );

        return optionIds;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrdersRepository,
          useValue: ordersRepository,
        },
        {
          provide: CartsService,
          useValue: cartsService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cache,
        },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(ordersService).toBeDefined();
  });

  describe('create', () => {
    it('should create a single order', async () => {
      const order = await ordersService.create(
        createOrderDto,
        users[0] as User,
      );

      expect(order.id).toBeDefined();
      expect(order.totalQuantity).toBe(
        (carts[0].totalQuantity as number) + (carts[1].totalQuantity as number),
      );
      expect(order.orderToOptions[0].option).toEqual(options[0]);
      expect(order.orderToOptions[1].option).toEqual(options[2]);
    });

    it('should throw NotFoundException for empty carts', async () => {
      await expect(
        ordersService.create(createOrderDto, users[2] as User),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('find', () => {
    it('should get an array of orders for a user meeting conditions', async () => {
      const pagination: PaginationDto = {
        limit: 10,
        offset: 0,
        skip: 0,
      };

      await ordersService.create(createOrderDto, users[0] as User);
      const page = await ordersService.find(pagination, users[0] as User);

      const orders = page.data;
      const state = page.state;

      expect(state.total).toBe(1);
      expect(state.currentPage).toBe(1);
      expect(orders[0].user.name).toBe(users[0].name);
      expect(orders[0].orderToOptions[0].option).toEqual(options[0]);
      expect(orders[0].orderToOptions[1].option).toEqual(options[2]);
    });

    it('should throw NotFoundException for a page that does not exist', async () => {
      const pagination: PaginationDto = {
        limit: 10,
        offset: 3,
        skip: 0,
      };

      await ordersService.create(createOrderDto, users[0] as User);

      await expect(
        ordersService.find(pagination, users[0] as User),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an order', async () => {
      await ordersService.create(createOrderDto, users[0] as User);
      const order = await ordersService.delete(1, users[0] as User);

      expect(order.id).toBe(1);
      expect(order.orderToOptions[0].option).toEqual(options[0]);
      expect(order.orderToOptions[1].option).toEqual(options[2]);
    });

    it('should throw NotFoundException for an invalid id', async () => {
      await ordersService.create(createOrderDto, users[0] as User);
      await expect(
        ordersService.delete(4541, users[0] as User),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});
