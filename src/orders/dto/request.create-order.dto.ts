import { IsString, Matches } from 'class-validator';

export class RequestCreateOrderDto {
  @IsString({ message: 'INVALID_NAME' })
  name: string;

  @IsString({ message: 'INVALID_STREET' })
  street: string;

  @IsString({ message: 'INVALID_ADDRESS' })
  address: string;

  @IsString({ message: 'INVALID_ZIPCODE' })
  zipcode: string;

  @Matches(/^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*/, {
    message: 'INVALID_EMAIL',
  })
  email: string;

  @Matches(/^([0-9]{3})[-]([0-9]{4})[-][0-9]{4}$/, {
    message: 'INVALID_PHONE_NUMBER',
  })
  phoneNumber: string;
}
