import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { RequestCreateOrderDto } from './dto/request.create-order.dto';
import { ResponseCreateOrderDto } from './dto/response.create-order.dto';

@Controller('orders')
@UseGuards(AuthGuard())
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('/')
  @UsePipes(ValidationPipe)
  @HttpCode(201)
  createOrder(
    @Body() requestCreateOrderDto: RequestCreateOrderDto,
    @GetUser() user: User,
  ): Promise<ResponseCreateOrderDto> {
    return this.ordersService.createOrder(requestCreateOrderDto, user);
  }
}
