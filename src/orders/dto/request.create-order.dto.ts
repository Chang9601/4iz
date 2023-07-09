import { Matches } from 'class-validator';
import { VALIDATION_ERROR } from '../../utils/constants/validation-error.enum';
import { VALIDATION_REGEX } from '../../utils/constants/validation-regex.enum';

export class RequestCreateOrderDto {
  @Matches(VALIDATION_REGEX.NAME, { message: VALIDATION_ERROR.NAME })
  name: string;

  @Matches(VALIDATION_REGEX.STREET, { message: VALIDATION_ERROR.STREET })
  street: string;

  @Matches(VALIDATION_REGEX.ADDRESS, { message: VALIDATION_ERROR.ADDRESS })
  address: string;

  @Matches(VALIDATION_REGEX.ZIPCODE, {
    message: VALIDATION_ERROR.ZIPCODE,
  })
  zipcode: string;

  @Matches(VALIDATION_REGEX.EMAIL, {
    message: VALIDATION_ERROR.EMAIL,
  })
  email: string;

  @Matches(VALIDATION_REGEX.PHONE_NUMBER, {
    message: VALIDATION_ERROR.PHONE_NUMBER,
  })
  phoneNumber: string;
}
