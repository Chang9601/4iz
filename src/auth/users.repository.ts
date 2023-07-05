import { CustomRepository } from '../repository/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

@CustomRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser(
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    birthday: Date,
  ): Promise<User> {
    const user = this.create({
      name,
      email,
      password,
      phoneNumber,
      birthday,
    });

    try {
      return this.save(user);
    } catch (error) {
      if (error.errno === 1062) {
        throw new ConflictException(`User with email ${email} already exists`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
