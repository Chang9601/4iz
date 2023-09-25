import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { PageStateDto } from './page-state.dto';
import { Cart } from '../entities/cart.entity';
// import { Option } from '../entities/option.entity';

export class CartsDto {
  @ApiProperty({
    example: {
      total: 2,
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
        id: 121,
        totalQuantity: 2,
        totalPrice: 358000,
        options: [{ id: 2855, color: '회색', size: '245', stock: 100 }],
      },
      {
        id: 122,
        totalQuantity: 4,
        totalPrice: 716000,
        options: [{ id: 2135, color: '흰색', size: '220', stock: 100 }],
      },
    ],
  })
  @Transform(({ obj }) => obj.data)
  @Type(() => Cart)
  @Expose()
  // 아이디 외에 전달하는 것의 성능과 아이디만 전달하고 API 호출하는 성능 중 어느 것이 더 좋은지 비교가 필요하다.
  //   obj.data.map((cart: Cart) => ({
  //     ...cart,
  //     options: cart.options.map((option: Option) => option.id),
  //   })),
  // )
  carts: Cart[];
}
