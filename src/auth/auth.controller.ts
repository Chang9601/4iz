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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @HttpCode(201)
  async signUp(@Body(ValidationPipe) signUpDto: SignUpDto): Promise<void> {
    return this.authService.signUp(signUpDto);
  }

  @Post('/signin')
  async signIn(
    @Body(ValidationPipe) signInDto: SignInDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(signInDto);
  }
}
