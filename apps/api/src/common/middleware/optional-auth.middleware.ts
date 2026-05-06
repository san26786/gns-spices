import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { config } from '../../config';
import type { AuthUser } from '../decorators/current-user.decorator';

/**
 * Silently decodes a JWT from the `gns_at` cookie or Authorization header and
 * attaches the user to `req.user`. Never throws. Auth-required routes use
 * `JwtGuard` on top of this for enforcement.
 */
@Injectable()
export class OptionalAuthMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const token = extract(req);
    if (!token) return next();
    try {
      const payload = jwt.verify(token, config.jwt.accessSecret) as AuthUser;
      (req as any).user = payload;
    } catch {
      // ignore — invalid tokens are treated as "anonymous"
    }
    next();
  }
}

function extract(req: Request): string | undefined {
  const bearer = req.headers.authorization;
  if (bearer?.startsWith('Bearer ')) return bearer.slice(7);
  return (req as any).cookies?.['gns_at'];
}
