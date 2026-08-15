import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPrincipal } from '../strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPrincipal => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
