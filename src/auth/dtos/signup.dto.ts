import { Type } from 'class-transformer';
import { IsDate, Matches } from 'class-validator';
import { VALIDATION_ERROR } from '../../utils/constants/validation-error.enum';
import { VALIDATION_REGEX } from '../../utils/constants/validation-regex.enum';

export class SignUpDto {
  @Matches(VALIDATION_REGEX.NAME, {
    message: VALIDATION_ERROR.NAME,
  })
  name: string;

  @Matches(VALIDATION_REGEX.EMAIL, {
    message: VALIDATION_ERROR.EMAIL,
  })
  email: string;

  @Matches(VALIDATION_REGEX.PASSWORD, {
    message: VALIDATION_ERROR.PASSWORD,
  })
  password: string;

  @Matches(VALIDATION_REGEX.PHONE_NUMBER, {
    message: VALIDATION_ERROR.PHONE_NUMBER,
  })
  phoneNumber: string;

  @Type(() => Date)
  @IsDate({ message: VALIDATION_ERROR.BIRTHDAY })
  birthday: Date;
}
