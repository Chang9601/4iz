import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { Cart } from './cart.entity';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post('/')
  @UsePipes(ValidationPipe)
  @HttpCode(201)
  createCart(@Body() createCartDto: CreateCartDto): Promise<Cart[]> {
    return this.cartsService.createCart(createCartDto);
  }

  @Delete('/:id')
  @HttpCode(204)
  deleteCart(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.cartsService.deleteCart(id);
  }
}
