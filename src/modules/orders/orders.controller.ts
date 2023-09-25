import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { OrderDto } from '../../dtos/order.dto';
import { OrdersDto } from '../../dtos/orders.dto';
import { CreateOrderDto } from '../../dtos/create-order.dto';
import { PaginationDto } from '../../dtos/pagination.dto';
import { OrdersService } from './orders.service';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';

@ApiTags('orders')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiNotFoundResponse({
    description: '빈 장바구니.',
  })
  @ApiCreatedResponse({
    description: '주문 생성 성공.',
  })
  @ApiBody({
    type: CreateOrderDto,
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post('')
  async placeOrder(
    @Req() request: RequestWithUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const { user } = request;

    return await this.ordersService.create(createOrderDto, user);
  }

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiNotFoundResponse({
    description: '주문 검색 실패.',
  })
  @ApiOkResponse({
    type: OrderDto,
    description: '주문 검색 성공.',
  })
  @HttpCode(HttpStatus.OK)
  @Serialize(OrderDto)
  @Get('/:id')
  async getOrder(@Param('id', ParseIntPipe) id: number) {
    return await this.ordersService.findOne(id);
  }

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiNotFoundResponse({
    description: '존재하지 않는 페이지.',
  })
  @ApiOkResponse({
    type: OrdersDto,
    description: '주문 목록 검색 성공.',
  })
  @ApiQuery({
    type: PaginationDto,
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @Serialize(OrdersDto)
  @Get('')
  async getOrders(
    @Req() request: RequestWithUser,
    @Query()
    paginationDto: PaginationDto,
  ) {
    const { user } = request;

    return await this.ordersService.find(paginationDto, user);
  }

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능',
  })
  @ApiNotFoundResponse({
    description: '존재하지 않는 주문.',
  })
  @ApiNoContentResponse({
    description: '주문 취소 성공.',
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  async cancelOrder(
    @Req() request: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const { user } = request;

    await this.ordersService.delete(id, user);
  }
}
