import { Test, TestingModule } from '@nestjs/testing';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { RequestCreateCartDto } from './dto/request.create-cart.dto';
import { User } from 'src/auth/user.entity';
import { Item } from 'src/items/item.entity';
import { NotFoundException } from '@nestjs/common';
import { Option } from 'src/items/option.entity';
import { ResponseCreateCartDto } from './dto/response.create-cart.dto';
import { Cart } from './cart.entity';
import { RequestUpdateCartDto } from './dto/request.update-cart.dto';

const mockItem1 = {
  id: 1,
  name: '나이키 플렉스 슈즈',
  gender: '남성',
  price: 259000.0,
  discountRate: 0,
  description: '매우 유연한',
  releaseDate: new Date('2012-04-13'),
};

const mockItem2 = {
  id: 2,
  name: '나이키코트 슈즈 블로그',
  gender: '여성',
  price: 189000.0,
  discountRate: 65,
  description: '블로그 테니스화',
  releaseDate: new Date('2023-03-05'),
};

const mockItem3 = {
  id: 3,
  name: '스테판 슈즈 엑스',
  gender: '여성',
  price: 259000.0,
  discountRate: 0,
  description: '환상적인 농구화',
  releaseDate: new Date('2018-01-24'),
};

const mockOption1 = {
  id: 10,
  color: '검정색',
  size: '230',
  stock: 100,
  item: mockItem1,
};

const mockOption2 = {
  id: 11,
  color: '노란색',
  size: '290',
  stock: 70,
  item: mockItem1,
};

const mockOption3 = {
  id: 12,
  color: '파란색',
  size: '255',
  stock: 50,
  item: mockItem1,
};

const mockOption4 = {
  id: 13,
  color: '멀티컬러',
  size: '270',
  stock: 20,
  item: mockItem1,
};

const mockUser = {};

const mockItems = [mockItem1, mockItem2, mockItem3];
const mockOptions = [mockOption1, mockOption2, mockOption3, mockOption4];

const requestCreateCartDto: RequestCreateCartDto = {
  itemId: 1,
  options: ['검정색/230/2', '노란색/290/4'],
};

const limit = 10;
const offset = 1;

describe('CartsController', () => {
  let controller: CartsController;
  let mockCartsService: Partial<CartsService>;

  beforeEach(async () => {
    const mockCarts: Cart[] = [];
    mockCartsService = {
      createCart: async (
        requestCreateCartDto: RequestCreateCartDto,
        user: User,
      ) => {
        const itemId = requestCreateCartDto.itemId;
        const mockItem = mockItems.find(
          (mockItem) => mockItem.id === itemId,
        ) as Item;

        if (!mockItem) {
          throw new NotFoundException(`Item with id ${itemId} not found`);
        }

        const requestOptions = requestCreateCartDto.options;
        const responseCreateCartDto: ResponseCreateCartDto[] = [];

        for (
          let optionIndex = 0;
          optionIndex < requestOptions.length;
          optionIndex++
        ) {
          const optionToArray = requestOptions[optionIndex].split('/');
          const color = optionToArray[0];
          const size = optionToArray[1];
          const quantity = +optionToArray[2];

          const [result] = mockOptions.filter(
            (mockOption) =>
              mockOption.item.id === itemId &&
              mockOption.color === color &&
              mockOption.size === size,
          );

          const mockItem = mockItems.find(
            (mockItem) => mockItem.id === itemId,
          ) as Item;

          const mockCart = {
            id: Math.floor(Math.random() * 10000) + 1,
            totalPrice: quantity * mockItem.price,
            totalQuantity: quantity,
            user: user,
            options: [result as Option],
          } as Cart;

          mockCarts.push(mockCart);

          responseCreateCartDto.push({
            totalPrice: quantity * mockItem.price,
            totalQuantity: quantity,
            option: result as Option,
          });
        }

        return responseCreateCartDto;
      },
      getCarts: async (limit: number, offset: number, _: User) => {
        const total = limit > mockCarts.length ? mockCarts.length : limit;

        return {
          total: total,
          offset: offset,
          carts: mockCarts,
        };
      },
      updateCart: async (
        id: number,
        requestUpdateCartDto: RequestUpdateCartDto,
        _: User,
      ) => {
        const mockCart = mockCarts.find((mockCart) => mockCart.id === id);

        if (!mockCart) {
          throw new NotFoundException(`Cart with id ${id} not found`);
        }

        const price = mockCart.totalPrice / mockCart.totalQuantity;
        mockCart.totalQuantity = requestUpdateCartDto.quantity;
        mockCart.totalPrice = price * mockCart.totalQuantity;

        return {
          id: id,
          totalPrice: mockCart.totalPrice,
          totalQuantity: mockCart.totalQuantity,
        };
      },
      deleteCart: async (id: number, _: User) => {
        const index = mockCarts.findIndex((mockCart) => mockCart.id === id);

        if (index === -1) {
          throw new NotFoundException(`Cart with id ${id} not found`);
        }

        mockCarts.splice(index, 1);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartsController],
      providers: [
        {
          provide: CartsService,
          useValue: mockCartsService,
        },
      ],
    }).compile();

    controller = module.get<CartsController>(CartsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a cart', async () => {
    const dto = await controller.createCart(
      requestCreateCartDto,
      mockUser as User,
    );
    const index = mockItems.findIndex(
      (mockItem) => mockItem.id === requestCreateCartDto.itemId,
    );

    expect(dto[1].totalPrice).toBe(1036000);
    expect(dto[1].totalQuantity).toBe(4);
    expect(dto[1].option).toEqual({
      id: 11,
      color: '노란색',
      size: '290',
      stock: 70,
      item: mockItems[index],
    });
  });

  it('should throw a NotFoundException for an invalid item', async () => {
    const requestCreateCartDto: RequestCreateCartDto = {
      itemId: 100,
      options: ['검정색/230/2', '노란색/290/4'],
    };

    await expect(
      controller.createCart(requestCreateCartDto, mockUser as User),
    ).rejects.toThrowError(NotFoundException);
  });

  it('should get an array of carts', async () => {
    await controller.createCart(requestCreateCartDto, mockUser as User);
    const dto = await controller.getCarts(limit, offset, mockUser as User);
    const carts = dto.carts;

    expect(dto.total).toBe(carts.length);
    expect(dto.offset).toBe(offset);
    expect(carts[0].totalPrice).toBe(518000);
    expect(carts[1].totalPrice).toBe(1036000);
  });

  it('should update a cart', async () => {
    await controller.createCart(requestCreateCartDto, mockUser as User);
    const getCartDto = await controller.getCarts(
      limit,
      offset,
      mockUser as User,
    );

    const carts = getCartDto.carts;
    const id = carts[0].id;
    const requestUpdateCartDto: RequestUpdateCartDto = {
      quantity: 10,
    };

    const updateCartDto = await controller.updateCart(
      id,
      requestUpdateCartDto,
      mockUser as User,
    );

    expect(updateCartDto.totalPrice).toBe(
      carts[0].options[0].item.price * requestUpdateCartDto.quantity,
    );
    expect(updateCartDto.totalQuantity).toBe(requestUpdateCartDto.quantity);
  });

  it('should throw a NotFoundException for updating an invalid cart', async () => {
    await controller.createCart(requestCreateCartDto, mockUser as User);
    const dto = await controller.getCarts(limit, offset, mockUser as User);
    const carts = dto.carts;

    const id = Math.floor(Math.random() * carts.length) + carts.length;
    const requestUpdateCartDto: RequestUpdateCartDto = {
      quantity: 10,
    };

    await expect(
      controller.updateCart(id, requestUpdateCartDto, mockUser as User),
    ).rejects.toThrowError(NotFoundException);
  });

  it('should delete a cart', async () => {
    await controller.createCart(requestCreateCartDto, mockUser as User);
    let getCarts = await controller.getCarts(limit, offset, mockUser as User);

    const cartsBeforeDelete = getCarts.carts;
    const lengthBeforeDelete = cartsBeforeDelete.length;
    const id = cartsBeforeDelete[1].id;

    await controller.deleteCart(id, mockUser as User);

    getCarts = await controller.getCarts(limit, offset, mockUser as User);

    const cartsAfterDelete = getCarts.carts;
    const lengthAfterDelete = cartsAfterDelete.length;

    expect(lengthBeforeDelete).not.toBe(lengthAfterDelete);
  });

  it('should throw a NotFoundException for deleting an invalid cart', async () => {
    await controller.createCart(requestCreateCartDto, mockUser as User);
    const dto = await controller.getCarts(limit, offset, mockUser as User);
    const carts = dto.carts;

    const id = Math.floor(Math.random() * carts.length) + carts.length;

    await expect(
      controller.deleteCart(id, mockUser as User),
    ).rejects.toThrowError(NotFoundException);
  });
});
