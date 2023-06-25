import { IsString, Matches, MinLength } from 'class-validator';
import { ValidationErrorMessage } from 'src/utils/validation-error-message';

export class RequestCreateOrderDto {
  @IsString({ message: ValidationErrorMessage.STRING_TYPE })
  @MinLength(1, { message: ValidationErrorMessage.STRING_LENGTH })
  name: string;

  @IsString({ message: ValidationErrorMessage.STRING_TYPE })
  @MinLength(1, { message: ValidationErrorMessage.STRING_LENGTH })
  street: string;

  @IsString({ message: ValidationErrorMessage.ADDRESS })
  address: string;

  @Matches(/^[0-9]{5}$/, {
    message: ValidationErrorMessage.ZIPCODE,
  })
  zipcode: string;

  @Matches(/^[\w.+-]+@[\w-]+\.[\w.-]+$/, {
    message: ValidationErrorMessage.EMAIL,
  })
  email: string;

  @Matches(/^([0-9]{3})[-]([0-9]{4})[-][0-9]{4}$/, {
    message: ValidationErrorMessage.PHONE_NUMBER,
  })
  phoneNumber: string;
}
