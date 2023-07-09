import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmExModule } from '../repository/typeorm-ex.module';
import { UsersRepository } from './users.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET_KEY,
        signOptions: { expiresIn: 60 * 60 },
      }),
    }),
    TypeOrmExModule.forCustomRepository([UsersRepository]),
  ],
  controllers: [AuthController],
  // Register JwtStrategy in Auth module
  providers: [AuthService, JwtStrategy],
  // Register JwtStrategy and PassportModule so that they can be used in other modules
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
