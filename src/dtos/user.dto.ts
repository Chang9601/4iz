import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import * as moment from 'moment';
import { Moment } from 'moment';

import { Role } from '../common/enums/common.enum';

export class UserDto {
  id: number;

  @ApiProperty({
    example: '박선심',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'sunshim@naver.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    example: '010-1111-2222',
  })
  @Expose()
  phoneNumber: string;

  @ApiProperty({
    type: Date,
    example: '1999-01-01',
  })
  @Transform(({ value }) => moment(value).format('YYYY-MM-DD'))
  @Type(() => Date)
  @Expose()
  birthday: Moment;

  // @Type(() => Role[])
  @Expose()
  roles: Role[];

  constructor(email: string, phoneNumber: string) {
    this.email = email;
    this.phoneNumber = phoneNumber;
  }
}
