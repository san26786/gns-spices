import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  sub: string;
  email: string;
  staffRole?: string;
  region: string;
  currency: string;
  businessId?: string;
  businessRole?: string;
}

/** Pulls the user attached by JwtGuard. Returns undefined if unauthenticated. */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
