import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { PaginationDto } from '../../dtos/pagination.dto';
import { CreateOrderDto } from '../../dtos/create-order.dto';
import { User } from '../../entities/user.entity';
import { CartsService } from '../carts/carts.service';
import { OrdersRepository } from './orders.repository';
import { createCachekey } from '../../common/factories/common.factory';

@Injectable()
export class OrdersService {
  constructor(
    private readonly cartsService: CartsService,
    private readonly ordersRepository: OrdersRepository,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  // 주문 완료 및 주문 취소 시 옵션의 재고 수가 변하기 때문에 상품 페이지의 캐시를 무효화한다.
  private async invalidateCache(ids: string[], keyName: string) {
    for (const id of ids) {
      const key = createCachekey(keyName, id);
      const value = await this.cache.get(key);

      if (value) {
        await this.cache.del(key);
      }
    }
  }

  async create(createOrderDto: CreateOrderDto, user: User) {
    const itemIds = await this.cartsService.findAll(user);

    await this.invalidateCache(itemIds, 'items');

    return await this.ordersRepository.createOne(createOrderDto, user);
  }

  async findOne(id: number) {
    try {
      const order = this.ordersRepository.findOne({
        where: { id },
        relations: ['orderStatus', 'orderToOptions', 'options'],
      });

      if (!order) {
        throw new NotFoundException('아이디에 해당하는 주문 없음.');
      }

      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        '아이디로 주문 검색 중 오류 발생.',
      );
    }
  }

  async find(paginationDto: PaginationDto, user: User) {
    return await this.ordersRepository.findOrders(paginationDto, user);
  }

  async delete(id: number, user: User) {
    const itemIds = await this.ordersRepository.findAll(id);

    await this.invalidateCache(itemIds, 'items');

    return await this.ordersRepository.deleteOne(id, user);
  }
}
