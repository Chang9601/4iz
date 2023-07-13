import { Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { User } from '../../src/auth/user.entity';
import { RequestCreateOrderDto } from './dto/request.create-order.dto';
import { ResponseCreateOrderDto } from './dto/response.create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async createOrder(
    requestCreateOrderDto: RequestCreateOrderDto,
    user: User,
  ): Promise<ResponseCreateOrderDto> {
    return this.orderRepository.createOrder(requestCreateOrderDto, user);
  }
}
