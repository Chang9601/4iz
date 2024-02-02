import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { PaginationDto } from '../../dtos/pagination.dto';
import { PageStateDto } from '../../dtos/page-state.dto';
import { PageDto } from '../../dtos/page.dto';
import { CreateOrderDto } from '../../dtos/create-order.dto';
import { Order } from '../../entities/order.entity';
import { User } from '../../entities/user.entity';
import { Cart } from '../../entities/cart.entity';
import { Option } from '../../entities/option.entity';
import { OrderToOption } from '../../entities/order-option.entity';
import { OrderStatus } from '../../entities/order-status.entity';
import { OrderState } from '../../common/enums/common.enum';

export class OrdersRepository extends Repository<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    // TypeORM이 제공하는 DataSource 객체.
    private dataSource: DataSource,
  ) {
    super(
      ordersRepository.target,
      ordersRepository.manager,
      ordersRepository.queryRunner,
    );
  }

  // TypeORM 트랙잭션 처리 방법.
  //   1. QueryRunner 적용.
  //   2. transaction 함수를 직접 사용하여 적용.
  async createOne(createOrderDto: CreateOrderDto, user: User) {
    const { streetAddress, address, zipcode } = createOrderDto;

    const queryRunner = this.dataSource.createQueryRunner();
    // QueryRunner를 DB에 연결한 후 트랜잭션을 시작한다.
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const carts = await queryRunner.manager.find(Cart, {
        where: {
          user: {
            id: user.id,
          },
        },
        relations: ['options'],
        order: {
          id: 'asc',
        },
      });

      if (carts.length <= 0) {
        throw new NotFoundException('빈 장바구니.');
      }

      const [orderStatus] = await queryRunner.manager.find(OrderStatus, {
        where: {
          status: OrderState.PAID,
        },
      });

      const orderNumber = randomUUID();

      const options = carts.map((cart) => cart.options[0]);

      for (let index = 0; index < carts.length; index++) {
        const stock = options[index].stock;
        const quantity = carts[index].totalQuantity;

        if (stock - quantity < 0) {
          throw new NotFoundException(`옵션 ${options[index].id} 재고 없음.`);
        }

        options[index].stock -= carts[index].totalQuantity;
      }

      const { totalPrice, totalQuantity } = carts.reduce(
        (total, cart) => ({
          totalPrice: total.totalPrice + cart.totalPrice,
          totalQuantity: total.totalQuantity + cart.totalQuantity,
        }),
        {
          totalPrice: 0,
          totalQuantity: 0,
        },
      );

      const order = queryRunner.manager.create(Order, {
        streetAddress,
        address,
        zipcode,
        totalPrice,
        totalQuantity,
        options,
        orderNumber,
        orderStatus,
        user,
      });

      await queryRunner.manager.save(Order, order);
      await queryRunner.manager.save(Option, options);
      await queryRunner.manager.remove(Cart, carts);

      const orderToOptions: OrderToOption[] = [];

      for (let index = 0; index < carts.length; index++) {
        const option = options[index];
        const totalQuantity = carts[index].totalQuantity;

        const orderToOption = queryRunner.manager.create(OrderToOption, {
          option,
          order,
          totalQuantity,
        });
        orderToOptions.push(orderToOption);
      }

      await queryRunner.manager.save(OrderToOption, orderToOptions);

      // 트랜잭션을 커밋하여 영속화(persistence)를 수행한다.
      await queryRunner.commitTransaction();

      return order;
    } catch (error) {
      // 오류 발생 시 트랜잭션을 롤백한다.
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOrders(paginationDto: PaginationDto, user: User) {
    const { limit: take, skip } = paginationDto;

    const [orders, total] = await this.ordersRepository.findAndCount({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: ['orderStatus', 'options'],
      select: [
        'id',
        'streetAddress',
        'address',
        'zipcode',
        'totalPrice',
        'totalQuantity',
        'orderDate',
        'orderNumber',
      ],
      order: {
        id: 'ASC',
      },
      take,
      skip,
    });

    const pageStateDto = new PageStateDto(total, paginationDto);

    if (pageStateDto.lastPage < pageStateDto.currentPage) {
      throw new NotFoundException('존재하지 않는 페이지.');
    }

    return new PageDto(pageStateDto, orders);
  }

  async deleteOne(id: number, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [foundOrder] = await queryRunner.manager.find(Order, {
        where: {
          id,
          user: {
            id: user.id,
          },
        },
        relations: ['options'],
        order: {
          options: {
            id: {
              direction: 'asc',
            },
          },
        },
      });

      if (!foundOrder) {
        throw new NotFoundException('아이디에 해당하는 주문 없음.');
      }

      const orderToOptions = await queryRunner.manager.find(OrderToOption, {
        where: {
          order: {
            id: foundOrder.id,
          },
        },
        order: {
          option: {
            id: 'asc',
          },
        },
      });

      const options = foundOrder.options;

      for (let index = 0; index < options.length; index++) {
        options[index].stock += orderToOptions[index].totalQuantity;
      }

      await queryRunner.manager.remove(OrderToOption, orderToOptions);
      await queryRunner.manager.save(Option, options);
      const order = await queryRunner.manager.remove(Order, foundOrder);

      await queryRunner.commitTransaction();

      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 데이터베이스 구조 수정 필요.
  // 상품의 아이디 배열을 반환한다.
  async findAll(id: number) {
    const [order] = await this.ordersRepository.find({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('아이디에 해당하는 주문 없음.');
    }

    const orderToOptions = await this.ordersRepository.manager.find(
      OrderToOption,
      {
        where: { order: { id: order.id } },
        relations: ['option'],
      },
    );

    if (!orderToOptions) {
      throw new NotFoundException('아이디에 해당하는 주문-옵션 없음.');
    }

    const optionIds = orderToOptions.map(
      (orderToOption) => orderToOption.option.id,
    );
    const itemIds: string[] = [];

    for (const optionId of optionIds) {
      const [foundOption] = await this.ordersRepository.manager.find(Option, {
        where: {
          id: optionId,
        },
        relations: ['item'],
      });

      itemIds.push(foundOption.item.id.toString());
    }

    return itemIds;
  }
}
