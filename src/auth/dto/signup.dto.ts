import {
  //IsDate,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @MinLength(1)
  name: string;

  @Matches(/^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*/, {
    message: 'INVALID_EMAIL',
  })
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,15})/, {
    message: 'INVALID_PASSWORD',
  })
  password: string;

  @Matches(/^([0-9]{3})[-]([0-9]{4})[-][0-9]{4}$/, {
    message: 'INVALID_PHONE_NUMBER',
  })
  phoneNumber: string;

  @IsNotEmpty()
  //@IsDate()
  birthday: Date;
}
