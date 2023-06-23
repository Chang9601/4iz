import { Type } from 'class-transformer';
import { IsDate, IsString, Matches, MinLength } from 'class-validator';
import { ValidationErrorMessage } from 'src/utils/validation-error-message';

export class SignUpDto {
  @IsString({ message: ValidationErrorMessage.NAME_TYPE })
  @MinLength(1, { message: ValidationErrorMessage.NAME_LENGTH })
  name: string;

  @Matches(/^[\w.+-]+@[\w-]+\.[\w.-]+$/, {
    message: ValidationErrorMessage.EMAIL,
  })
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
    message: ValidationErrorMessage.PASSWORD,
  })
  password: string;

  @Matches(/^([0-9]{3})[-]([0-9]{4})[-][0-9]{4}$/, {
    message: ValidationErrorMessage.PHONE_NUMBER,
  })
  phoneNumber: string;

  @Type(() => Date)
  @IsDate({ message: ValidationErrorMessage.BIRTHDAY })
  birthday: Date;
}
