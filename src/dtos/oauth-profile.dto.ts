import { Role } from '../common/enums/common.enum';

export class OAuthProfileDto {
  name: string;

  email: string;

  password: string;

  phoneNumber: string;

  birthday: Date;

  role: Role;

  oAuthProvider: string;

  oAuthProviderId: string;

  oAuthProviderRefreshToken: string;
}
