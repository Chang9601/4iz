import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';

import { CreateUserDto } from '../../dtos/create-user.dto';
import { OAuthProfileDto } from '../../dtos/oauth-profile.dto';
import { OAuthAuthorizationCodeDto } from '../../dtos/oauth-authorization-code.dto';
import { OAuthAcessTokenDto } from '../../dtos/oauth-access-token.dto';
import { UsersService } from '../users/users.service';
import { TokenPayload } from './interfaces/token-payload.interface';
import { OAuthProvider, Token } from '../../common/enums/common.enum';
import { buildOption } from '../../common/factories/common.factory';

// 프로바이더는 별도의 스코프를 지정하지 않으면 싱글톤 인스턴스로 생성된다.
// 요청별 캐싱이 필요하거나 요청을 추적하거나 멀티테넌시(하나의 애플리케이션 인스턴스가 여러 사용자에게 각각 다르게 동작하도록 하는 아키텍처)를 지원하기 위해서는 요청 기반으로 생명 주기를 제한해야 한다.

// DEFAULT(권장)
// 싱글톤 인스턴스가 애플리케이션 전체에 공유된다.
// 인스턴스의 수명은 애플리케이션 생명 주기와 동일하다.
// 애플리케이션의 부트스트랩 과정이 끝나면 모든 싱글톤 프로바이더의 인스턴스가 생성된다.
// 인스턴스를 캐시할 수 있고 초기화가 애플리케이션 시작 시 한 번만 발생하므로 메모리와 동작 성능을 향상시킬 수 있기 때문에 권장된다.

// REQUEST
// 들어오는 요청마다 별도의 인스턴스가 생성된다.
// 요청이 끝나면 인스턴스는 가비지 컬렉션에 의해 수거된다.

// TRANSIENT
// 인스턴스가 공유되지 않는다.
// 프로바이더를 주입하는 컴포넌트는 새로 생성된 전용 인스턴스를 주입받는다.

// 연관된 컴포넌트들이 서로 다른 스코프를 가진다면 종속성을 가진 컴포넌트들의 스코프를 따라간다.
// AppController → AppService → AppRepository
// AppService만 REQUEST 스코프이고 나머지는 모두 DEFAULT 라면 AppController는 AppService에 의존적이므로 스코프가 REQUEST로 변경된다.
// 하지만 AppRepository의 경우 AppService에 의존적이지 않으므로 그대로 DEFAULT를 유지한다.
@Injectable({ scope: Scope.DEFAULT })
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  async createToken(id: number, type: Token) {
    const payload: TokenPayload = { id };
    const tokenSecret =
      type === Token.ACCESS_TOKEN
        ? 'JWT_ACCESS_TOKEN_SECRET'
        : 'JWT_REFRESH_TOKEN_SECRET';
    const tokenExpiresIn =
      type === Token.ACCESS_TOKEN
        ? 'JWT_ACCESS_TOKEN_EXPIRATION'
        : 'JWT_REFRESH_TOKEN_EXPIRATION';

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>(tokenSecret),
      expiresIn: this.configService.get<string>(tokenExpiresIn),
    });

    return { token };
  }

  async validateCredentials(email: string, password: string) {
    const option = buildOption({ email });

    try {
      const user = await this.usersService.findOne(option);
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new BadRequestException();
      }

      return user;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw new BadRequestException(
          '유효하지 않은 이메일 혹은 유효하지 않은 비밀번호.',
        );
      }

      throw error;
    }
  }

  async findOrCreateGoogle(
    oAuthAuthorizationCodeDto: OAuthAuthorizationCodeDto,
  ) {
    const { code, error } = oAuthAuthorizationCodeDto;

    if (error) {
      throw new Error(error);
    }

    const clientId = this.configService.get<string>(
      'GOOGLE_CLIENT_ID',
    ) as string;
    const clientSecret = this.configService.get<string>(
      'GOOGLE_CLIENT_SECRET',
    ) as string;
    const callbackUri = this.configService.get<string>(
      'GOOGLE_CALLBACK_URI',
    ) as string;

    const grantType = 'authorization_code';

    const oAuthAcessTokenDto: OAuthAcessTokenDto = {
      grant_type: grantType,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUri,
      code,
    };

    const accessTokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      oAuthAcessTokenDto,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        responseType: 'json',
      },
    );

    const { access_token: accessToken, refresh_token: refreshToken } =
      accessTokenResponse.data;

    const fields = 'names,emailAddresses,phoneNumbers,birthdays,metadata';

    const profileResponse = await axios.get(
      'https://people.googleapis.com/v1/people/me',
      {
        params: {
          personFields: fields,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    const { data } = profileResponse;
    const { names, emailAddresses, phoneNumbers, birthdays, metadata } = data;

    const oAuthProviderId = metadata.sources[0].id;
    const oAuthProvider = OAuthProvider.GOOGLE;
    const oAuthProviderRefreshToken = refreshToken;
    const name = names[0].displayName;
    const email = emailAddresses[0].value;
    const phoneNumber = phoneNumbers[0].value;
    const birthday = new Date(
      `${birthdays[0].date.year}-${birthdays[0].date.month}-${birthdays[0].date.day}`,
    );

    const oAuthProfileDto: Partial<OAuthProfileDto> = {
      name,
      email,
      phoneNumber,
      birthday,
      oAuthProvider,
      oAuthProviderId,
      oAuthProviderRefreshToken,
    };

    const option = buildOption({ email });

    const exist = await this.usersService.exist(option);

    if (exist) {
      const user = await this.usersService.findOne(option);

      if (user.oAuthProvider !== OAuthProvider.GOOGLE) {
        throw new ConflictException('이메일 사용 중.');
      }

      return user;
    }

    return await this.usersService.createWithOAuth(
      oAuthProfileDto as OAuthProfileDto,
    );
  }

  async findOrCreateNaver(
    oAuthAuthorizationCodeDto: OAuthAuthorizationCodeDto,
  ) {
    const { code, error: codeError, state } = oAuthAuthorizationCodeDto;

    if (codeError) {
      throw new Error(codeError);
    }

    const clientId = this.configService.get<string>(
      'NAVER_CLIENT_ID',
    ) as string;
    const clientSecret = this.configService.get<string>(
      'NAVER_CLIENT_SECRET',
    ) as string;
    const grantType = 'authorization_code';

    const oAuthAcessTokenDto: OAuthAcessTokenDto = {
      grant_type: grantType,
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state,
    };

    const accessTokenResponse = await axios.post(
      'https://nid.naver.com/oauth2.0/token',
      oAuthAcessTokenDto,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        responseType: 'json',
      },
    );

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      error: tokenError,
    } = accessTokenResponse.data;

    if (tokenError) {
      throw new Error(tokenError);
    }

    const profileResponse = await axios.get(
      'https://openapi.naver.com/v1/nid/me',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const { response: profile } = profileResponse.data;

    const {
      id: oAuthProviderId,
      name,
      email,
      birthday,
      birthyear,
      mobile: phoneNumber,
    } = profile;

    const oAuthProvider = OAuthProvider.NAVER;
    const oAuthProviderRefreshToken = refreshToken;

    const option = buildOption({ email });

    const exist = await this.usersService.exist(option);

    if (exist) {
      const user = await this.usersService.findOne(option);

      if (user.oAuthProvider !== OAuthProvider.NAVER) {
        throw new ConflictException('이메일 사용 중.');
      } else {
        return await this.usersService.updateOAuthProviderRefreshToken(
          user.id,
          refreshToken,
        );
      }
    }

    const oAuthProfileDto: Partial<OAuthProfileDto> = {
      name,
      email,
      phoneNumber,
      birthday: new Date(`${birthyear}-${birthday}`),
      oAuthProvider,
      oAuthProviderId,
      oAuthProviderRefreshToken,
    };

    return await this.usersService.createWithOAuth(
      oAuthProfileDto as OAuthProfileDto,
    );
  }
}
