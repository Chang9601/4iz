import {
  Body,
  Controller,
  HttpCode,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/signup.dto';
import { SignInDto } from './dtos/signin.dto';
import { JwtToken } from './jwt-token.interface';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @HttpCode(201)
  async signUp(@Body(ValidationPipe) signUpDto: SignUpDto): Promise<User> {
    return this.authService.signUp(signUpDto);
  }

  @Post('/signin')
  @HttpCode(200)
  async signIn(@Body(ValidationPipe) signInDto: SignInDto): Promise<JwtToken> {
    return this.authService.signIn(signInDto);
  }
}
