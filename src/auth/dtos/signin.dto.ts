import { Matches } from 'class-validator';
import { ValidationErrorMessage } from 'src/utils/validation-error-message';

export class SignInDto {
  @Matches(/^[\w.+-]+@[\w-]+\.[\w.-]+$/, {
    message: ValidationErrorMessage.EMAIL,
  })
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
    message: ValidationErrorMessage.PASSWORD,
  })
  password: string;
}
