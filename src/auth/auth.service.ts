import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async signUp(signUpDto: SignUpDto) {
    return this.userRepository.createUser(signUpDto);
  }
}
