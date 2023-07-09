import { Matches } from 'class-validator';
import { VALIDATION_ERROR } from '../../utils/constants/validation-error.enum';

export class SignInDto {
  @Matches(/^[\w.+-]+@[\w-]+\.[\w.-]+$/, {
    message: VALIDATION_ERROR.EMAIL,
  })
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
    message: VALIDATION_ERROR.PASSWORD,
  })
  password: string;
}
