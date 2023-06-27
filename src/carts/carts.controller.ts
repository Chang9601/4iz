import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { RequestCreateCartDto } from './dto/request.create-cart.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { GetCartsDto } from './dto/get-carts.dto';
import { ResponseCreateCartDto } from './dto/response.create-cart.dto';
import { RequestUpdateCartDto } from './dto/request.update-cart.dto';
import { ResponseUpdateCartDto } from './dto/response.update-cart.dto';
import { PAGINATION } from 'src/utils/constants/pagination.enum';

@Controller('carts')
@UseGuards(AuthGuard())
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post('/')
  @UsePipes(ValidationPipe)
  @HttpCode(201)
  async createCart(
    @Body() requestCreateCartDto: RequestCreateCartDto,
    @GetUser() user: User,
  ): Promise<ResponseCreateCartDto[]> {
    return this.cartsService.createCart(requestCreateCartDto, user);
  }

  @Get('/')
  @HttpCode(200)
  async getCarts(
    @Query('limit') limit: number = PAGINATION.LIMIT,
    @Query('offset') offset: number = PAGINATION.OFFSET,
    @GetUser() user: User,
  ): Promise<GetCartsDto> {
    return this.cartsService.getCarts(limit, offset, user);
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteCart(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.cartsService.deleteCart(id, user);
  }

  @Patch('/:id')
  @UsePipes(ValidationPipe)
  @HttpCode(200)
  async updateCart(
    @Param('id', ParseIntPipe) id: number,
    @Body() requestUpdateCartDto: RequestUpdateCartDto,
    @GetUser() user: User,
  ): Promise<ResponseUpdateCartDto> {
    return this.cartsService.updateCart(id, requestUpdateCartDto, user);
  }
}
