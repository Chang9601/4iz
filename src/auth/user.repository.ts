import { CustomRepository } from 'src/repository/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { SignUpDto } from './dtos/signup.dto';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@CustomRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(signUpDto: SignUpDto): Promise<void> {
    const { name, email, password, phoneNumber, birthday } = signUpDto;

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      birthday,
    });

    try {
      await this.save(user);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`User with email ${email} already exists`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
