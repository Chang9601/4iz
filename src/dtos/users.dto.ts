import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import * as moment from 'moment';

import { PageStateDto } from './page-state.dto';
import { User } from '../entities/user.entity';

export class UsersDto {
  @ApiProperty({
    example: {
      total: 30,
      limit: 10,
      offset: 1,
      currentPage: 1,
      lastPage: 3,
      isPreviousPageValid: false,
      isNextPageValid: true,
    },
  })
  @Transform(({ obj }) => obj.state)
  @Type(() => PageStateDto)
  @Expose()
  pageState: PageStateDto;

  @ApiProperty({
    example: [
      {
        id: 1,
        name: '박선심',
        email: 'sunshim@naver.com',
        phoneNumber: '010-1234-5678',
        birthday: '1966-01-31',
        roles: 'user',
      },
    ],
  })
  @Transform(({ obj }) =>
    obj.data.map((user: User) => ({
      ...user,
      birthday: moment(user.birthday).format('YYYY-MM-DD'),
    })),
  )
  @Type(() => User)
  @Expose()
  // 아이디 외에 전달하는 것의 성능과 아이디만 전달하고 API 호출하는 성능 중 어느 것이 더 좋은지 비교가 필요하다.
  //   obj.data.map((cart: Cart) => ({
  //     ...cart,
  //     options: cart.options.map((option: Option) => option.id),
  //   })),
  // )
  users: User[];
}
