import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { RoleSpec } from '../decorators/roles.decorator';
import type { AuthUser } from '../decorators/current-user.decorator';

/**
 * Minimal role enforcer — used as `@UseGuards(makeRolesGuard('staff:ops'))`.
 * We avoid Reflector / metadata here so it works reliably under tsx transpilation.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly allowed: RoleSpec[]) {}

  canActivate(ctx: ExecutionContext): boolean {
    const user = ctx.switchToHttp().getRequest().user as AuthUser | undefined;
    if (!user) throw new ForbiddenException('forbidden');
    for (const spec of this.allowed) {
      if (spec === 'customer' && !user.staffRole) return true;
      if (spec.startsWith('staff:')    && `staff:${user.staffRole}` === spec) return true;
      if (spec.startsWith('business:') && `business:${user.businessRole}` === spec) return true;
    }
    throw new ForbiddenException('insufficient_role');
  }
}

/** Factory: `@UseGuards(roles('staff:ops','staff:super_admin'))`. */
export const roles = (...allowed: RoleSpec[]) => {
  return { canActivate: (ctx: ExecutionContext) => new RolesGuard(allowed).canActivate(ctx) };
};
