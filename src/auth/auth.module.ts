import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmExModule } from 'src/db/typeorm-ex.module';
import { UserRepository } from './user.repository';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([UserRepository])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
