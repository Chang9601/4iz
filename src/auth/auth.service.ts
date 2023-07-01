import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { SignUpDto } from './dtos/signup.dto';
import * as bcrypt from 'bcryptjs';
import { SignInDto } from './dtos/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtToken } from './jwt-token';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSerivce: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<void> {
    return this.userRepository.createUser(signUpDto);
  }

  async signIn(signInDto: SignInDto): Promise<JwtToken> {
    const { email, password } = signInDto;
    const [user] = await this.userRepository.find({ where: { email: email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email };
      const accessToken = this.jwtSerivce.sign(payload);

      return { accessToken };
    } else {
      throw new UnauthorizedException('Login failed');
    }
  }
}
