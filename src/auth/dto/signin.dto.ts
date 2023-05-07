import { Matches } from 'class-validator';

export class SignInDto {
  @Matches(/^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*/, {
    message: 'INVALID_EMAIL',
  })
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,15})/, {
    message: 'INVALID_PASSWORD',
  })
  password: string;
}
