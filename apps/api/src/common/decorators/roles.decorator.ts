import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'auth:roles';
/**
 * Role strings follow `staff:<role>` or `business:<role>`. Plain `customer`
 * matches any authenticated user without a staff role.
 */
export type RoleSpec =
  | 'customer'
  | `staff:${'super_admin' | 'ops' | 'support' | 'finance' | 'content' | 'pl_manager'}`
  | `business:${'owner' | 'buyer' | 'approver' | 'viewer'}`;

export const Roles = (...roles: RoleSpec[]) => SetMetadata(ROLES_KEY, roles);
