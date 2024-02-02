import { IsString } from 'class-validator';

import { ValidationError } from '../common/enums/common.enum';

// whitelist: true 설정으로 인해 불가피하게 데코레이터를 사용한다.
export class OAuthAuthorizationCodeDto {
  @IsString({ message: ValidationError.STRING_TYPE })
  code: string;

  @IsString({ message: ValidationError.STRING_TYPE })
  error: string;

  @IsString({ message: ValidationError.STRING_TYPE })
  state?: string;
}
