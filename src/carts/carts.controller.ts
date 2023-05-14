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
import { Cart } from './cart.entity';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { GetCartsDto } from './dto/get-carts-dto';
import { Pagination } from 'src/constants/pagination';
import { ResponseCreateCartDto } from './dto/response.create-cart.dto';

@Controller('carts')
@UseGuards(AuthGuard())
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post('/')
  @UsePipes(ValidationPipe)
  @HttpCode(201)
  createCart(
    @Body() requestCreateCartDto: RequestCreateCartDto,
    @GetUser() user: User,
  ): Promise<ResponseCreateCartDto[]> {
    return this.cartsService.createCart(requestCreateCartDto, user);
  }

  // Response DTO
  @Get('/')
  @HttpCode(200)
  getCarts(
    @Query('limit') limit: number = Pagination.LIMIT,
    @Query('offset') offset: number = Pagination.OFFSET,
    @GetUser() user: User,
  ): Promise<GetCartsDto> {
    return this.cartsService.getCarts(limit, offset, user);
  }

  @Delete('/:id')
  @HttpCode(204)
  deleteCart(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.cartsService.deleteCart(id, user);
  }

  // Response DTO
  @Patch('/:id')
  @UsePipes(ValidationPipe)
  @HttpCode(200)
  updateCart(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCartDto: UpdateCartDto,
    @GetUser() user: User,
  ): Promise<Cart> {
    return this.cartsService.updateCart(id, updateCartDto, user);
  }
}
