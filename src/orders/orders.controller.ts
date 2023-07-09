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
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { RequestCreateOrderDto } from './dto/request.create-order.dto';
import { ResponseCreateOrderDto } from './dto/response.create-order.dto';

@Controller('orders')
@UseGuards(AuthGuard())
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('/')
  @UsePipes(ValidationPipe)
  @HttpCode(201)
  async createOrder(
    @Body() requestCreateOrderDto: RequestCreateOrderDto,
    @GetUser() user: User,
  ): Promise<ResponseCreateOrderDto> {
    return this.ordersService.createOrder(requestCreateOrderDto, user);
  }
}
