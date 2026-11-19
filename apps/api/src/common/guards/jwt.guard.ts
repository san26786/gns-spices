import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { config } from '../../config';
import type { AuthUser } from '../decorators/current-user.decorator';

/**
 * Applied via `@UseGuards(JwtGuard)` on controllers that require authentication.
 * Public routes simply don't apply this guard and rely on the OptionalAuthMiddleware
 * to populate req.user when a token is present.
 */
@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();

    // Middleware may have already decoded and attached the user.
    if ((req as any).user) return true;

    const token = this.extract(req);
    if (!token) throw new UnauthorizedException('missing_auth');

    try {
      const payload = jwt.verify(token, config.jwt.accessSecret) as AuthUser;
      (req as any).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('invalid_auth');
    }
  }

  private extract(req: Request): string | undefined {
    const bearer = req.headers.authorization;
    if (bearer?.startsWith('Bearer ')) return bearer.slice(7);
    return (req as any).cookies?.['gns_at'];
  }
}
