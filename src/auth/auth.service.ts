import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dtos/signup.dto';
import * as bcrypt from 'bcryptjs';
import { SignInDto } from './dtos/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtToken } from './jwt-token.interface';
import { UsersRepository } from './users.repository';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtSerivce: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
    const { name, email, password, phoneNumber, birthday } = signUpDto;

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    return this.usersRepository.createUser(
      name,
      email,
      hashedPassword,
      phoneNumber,
      birthday,
    );
  }

  async signIn(signInDto: SignInDto): Promise<JwtToken> {
    const { email, password } = signInDto;
    const [user] = await this.usersRepository.find({ where: { email: email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email };
      const accessToken = this.jwtSerivce.sign(payload);

      return { accessToken };
    } else {
      throw new BadRequestException('Invalid credentials');
    }
  }
}
