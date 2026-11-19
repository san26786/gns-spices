import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = 'auth:public';
/** Marks a route as accessible without a valid JWT (still attaches user if one is present). */
export const Public = () => SetMetadata(PUBLIC_KEY, true);
