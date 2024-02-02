import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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

import { CreateCartDto } from '../../dtos/create-cart.dto';
import { PaginationDto } from '../../dtos/pagination.dto';
import { CartDto } from '../../dtos/cart.dto';
import { CartsDto } from '../../dtos/carts.dto';
import { UpdateCartDto } from '../../dtos/update-cart.dto';
import { CartsService } from './carts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { Serialize } from '../../interceptors/serialize.interceptor';

@ApiTags('carts')
@UseGuards(JwtAuthGuard)
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiNotFoundResponse({
    description: '존재하지 않는 상품.',
  })
  @ApiCreatedResponse({
    description: '장바구니 생성 성공.',
  })
  @ApiBody({
    type: CreateCartDto,
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post('')
  async createCart(
    @Req() request: RequestWithUser,
    @Body() createCartDto: CreateCartDto,
  ) {
    const { user } = request;

    return await this.cartsService.create(createCartDto, user);
  }

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiNotFoundResponse({
    description: '존재하지 않는 페이지.',
  })
  @ApiOkResponse({
    type: CartsDto,
    description: '장바구니 목록 검색 성공.',
  })
  @ApiQuery({
    type: PaginationDto,
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @Serialize(CartsDto)
  @Get('')
  async getCarts(
    @Req() request: RequestWithUser,
    @Query() pagiantionDto: PaginationDto,
  ) {
    const { user } = request;

    return await this.cartsService.find(pagiantionDto, user);
  }

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiNotFoundResponse({
    description: '존재하지 않는 장바구니.',
  })
  @ApiOkResponse({
    type: CartDto,
    description: '장바구니 갱신 성공.',
  })
  @ApiBody({
    type: UpdateCartDto,
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @Serialize(CartDto)
  @Patch('/:id')
  async updateCart(
    @Req() request: RequestWithUser,
    @Param('id') id: number,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    const { user } = request;

    return this.cartsService.update(id, updateCartDto, user);
  }

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiNotFoundResponse({
    description: '존재하지 않는 장바구니.',
  })
  @ApiNoContentResponse({
    description: '장바구니 삭제 성공.',
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  async deleteCart(@Req() request: RequestWithUser, @Param('id') id: number) {
    const { user } = request;

    await this.cartsService.delete(id, user);
  }
}
