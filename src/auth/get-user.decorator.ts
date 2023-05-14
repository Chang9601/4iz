import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from './user.entity';

export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext): User => {
    data = data;
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
