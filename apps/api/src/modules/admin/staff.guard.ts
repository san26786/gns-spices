import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

/** Allows any signed-in staff member (super_admin, ops, support, finance, content, pl_manager). */
@Injectable()
export class StaffGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const user = ctx.switchToHttp().getRequest().user as AuthUser | undefined;
    if (!user?.staffRole) throw new ForbiddenException('staff_only');
    return true;
  }
}

export const money = (d: { toString(): string } | null | undefined) => (d == null ? null : Number(d.toString()));
