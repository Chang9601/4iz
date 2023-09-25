import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { PageStateDto } from './page-state.dto';
import { Order } from '../entities/order.entity';
import { Option } from '../entities/option.entity';

export class OrdersDto {
  @ApiProperty({
    example: {
      total: 3,
      limit: 10,
      offset: 1,
      currentPage: 1,
      lastPage: 1,
      isPreviousPageValid: false,
      isNextPageValid: false,
    },
  })
  @Transform(({ obj }) => obj.state)
  @Type(() => PageStateDto)
  @Expose()
  pageState: PageStateDto;

  @ApiProperty({
    example: [
      {
        id: 37,
        zipcode: '46044',
        totalQuantity: 12,
        totalPrice: 2148000,
        streetAddress: '부산광역시 기장군 일광읍 기장대로 692',
        address: '4층 정장계',
        orderNumber: 'ff04d44b-baf1-4b23-92cd-07952d286c49',
        orderDate: '2023-10-31T08:15:54.000Z',
        orderStatus: '결제완료',
        options: [2135, 2855, 3665],
      },
    ],
  })
  @Transform(({ obj }) =>
    obj.data.map((order: Order) => ({
      ...order,
      // name: order.user.name,
      // phoneNumber: order.user.phoneNumber,
      // email: order.user.email,
      orderStatus: order.orderStatus.status,
      options: order.options.map((option: Option) => option.id),
    })),
  )
  @Type(() => Order)
  @Expose()
  orders: Order[];
}
