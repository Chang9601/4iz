import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';

import { CreateUserDto } from '../../dtos/create-user.dto';
import { UserDto } from '../../dtos/user.dto';
import { SignInDto } from '../../dtos/signin.dto';
import { OAuthAuthorizationCodeDto } from '../../dtos/oauth-authorization-code.dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { Token } from '../../common/enums/common.enum';
import { createCookieOptions } from '../../common/factories/common.factory';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  // DI는 IoC 컨테이너가 객체의 생명주기를 관리하는 방식이다.
  constructor(
    private readonly authService: AuthService,
    private readonly usersSerivce: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @ApiConflictResponse({
    description: '이미 회원가입된 이메일로 회원가입 시도.',
  })
  @ApiCreatedResponse({
    type: UserDto,
    description: '회원가입 성공.',
  })
  @ApiBody({
    type: CreateUserDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @Serialize(UserDto)
  @Post('/signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto);
  }

  @ApiBadRequestResponse({
    description: '잘못된 이메일 혹은 잘못된 비밀번호로 로그인 시도.',
  })
  @ApiOkResponse({
    type: UserDto,
    description: '로그인 성공.',
  })
  @ApiBody({
    type: SignInDto,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async signIn(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user } = request;
    const { token: accessToken } = await this.authService.createToken(
      user.id,
      Token.ACCESS_TOKEN,
    );
    const { token: refreshToken } = await this.authService.createToken(
      user.id,
      Token.REFRESH_TOKEN,
    );

    await this.usersSerivce.setRefreshToken(refreshToken, user.id);

    const accessTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') as string,
    );
    const refreshTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') as string,
    );

    const { email, phoneNumber } = user;
    const userDto = new UserDto(email, phoneNumber);

    response
      .cookie(`access_token`, accessToken, accessTokenOptions)
      .cookie(`refresh_token`, refreshToken, refreshTokenOptions)
      .send(userDto);
  }

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiNoContentResponse({
    description: '로그아웃 성공.',
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Post('/signout')
  async signOut(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.usersSerivce.removeRefreshToken(request.user.id);

    response.clearCookie('access_token').clearCookie('refresh_token');
  }

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiOkResponse({
    type: UserDto,
    description: '접근 토큰 갱신.',
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Post('/refresh')
  async refreshToken(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user } = request;
    const { token: accessToken } = await this.authService.createToken(
      user.id,
      Token.ACCESS_TOKEN,
    );

    const accessTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') as string,
    );

    const { email, phoneNumber } = user;
    const userDto = new UserDto(email, phoneNumber);

    response
      .cookie('access_token', accessToken, accessTokenOptions)
      .send(userDto);
  }

  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiOkResponse({
    type: UserDto,
    description: '인증된 사용자 반환.',
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @Serialize(UserDto)
  @UseGuards(JwtAuthGuard)
  @Get('/whoami')
  async whoAmI(@Req() request: RequestWithUser) {
    const { user } = request;

    return user;
  }

  @Get('/google')
  async signInWithGoogle(
    @Res({ passthrough: true }) response: Response,
    @Query() oAuthAuthorizationCodeDto: OAuthAuthorizationCodeDto,
  ) {
    const user = await this.authService.findOrCreateGoogle(
      oAuthAuthorizationCodeDto,
    );

    const { token: accessToken } = await this.authService.createToken(
      user.id,
      Token.ACCESS_TOKEN,
    );
    const { token: refreshToken } = await this.authService.createToken(
      user.id,
      Token.REFRESH_TOKEN,
    );

    await this.usersSerivce.setRefreshToken(refreshToken, user.id);

    const accessTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') as string,
    );
    const refreshTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') as string,
    );

    response
      .cookie(`access_token`, accessToken, accessTokenOptions)
      .cookie(`refresh_token`, refreshToken, refreshTokenOptions)
      .redirect('/');
  }

  @Get('/naver')
  async signInWithNaver(
    @Res({ passthrough: true }) response: Response,
    @Query() oAuthAuthorizationCodeDto: OAuthAuthorizationCodeDto,
  ) {
    const user = await this.authService.findOrCreateNaver(
      oAuthAuthorizationCodeDto,
    );

    const { token: accessToken } = await this.authService.createToken(
      user.id,
      Token.ACCESS_TOKEN,
    );
    const { token: refreshToken } = await this.authService.createToken(
      user.id,
      Token.REFRESH_TOKEN,
    );

    await this.usersSerivce.setRefreshToken(refreshToken, user.id);

    const accessTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') as string,
    );
    const refreshTokenOptions = createCookieOptions(
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') as string,
    );

    response
      .cookie(`access_token`, accessToken, accessTokenOptions)
      .cookie(`refresh_token`, refreshToken, refreshTokenOptions)
      .redirect('/');
  }
}
