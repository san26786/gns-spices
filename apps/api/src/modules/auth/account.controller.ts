import { Body, Controller, Get, HttpCode, HttpException, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { AccountService, passwordOk, PASSWORD_RULE } from './account.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

const hits = new Map<string, number[]>();
function limit(req: Request, key: string, max: number, windowMs = 15 * 60_000) {
  const id = `${key}:${req.ip}`;
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) throw new HttpException('too_many_requests', 429);
  recent.push(now);
  hits.set(id, recent);
}

const Password = z.string().refine(passwordOk, PASSWORD_RULE.message);
const opt = (max: number) => z.string().trim().max(max).nullable().optional().transform((v) => v || null);

@Controller('auth')
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.account.profile(user.sub);
  }

  @UseGuards(JwtGuard)
  @Patch('me')
  update(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    const dto = z.object({ firstName: opt(80), lastName: opt(80), phone: opt(24) }).parse(body);
    return this.account.updateProfile(user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Post('change-password')
  @HttpCode(200)
  changePassword(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    const dto = z.object({ currentPassword: z.string().min(1), newPassword: Password }).parse(body);
    return this.account.changePassword(user.sub, dto.currentPassword, dto.newPassword);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(200)
  verify(@Body() body: unknown, @Req() req: Request) {
    limit(req, 'verify', 20);
    const dto = z.object({ token: z.string().min(20).max(200) }).parse(body);
    return this.account.verifyEmail(dto.token);
  }

  @UseGuards(JwtGuard)
  @Post('resend-verification')
  @HttpCode(200)
  resend(@CurrentUser() user: AuthUser, @Req() req: Request) {
    limit(req, 'resend', 5);
    return this.account.sendVerification(user.sub);
  }

  @Public()
  @Post('request-password-reset')
  @HttpCode(200)
  requestReset(@Body() body: unknown, @Req() req: Request) {
    limit(req, 'reset-request', 5);
    const dto = z.object({ email: z.string().trim().toLowerCase().email().max(254) }).parse(body);
    return this.account.requestPasswordReset(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(200)
  reset(@Body() body: unknown, @Req() req: Request) {
    limit(req, 'reset', 10);
    const dto = z.object({ token: z.string().min(20).max(200), password: Password }).parse(body);
    return this.account.resetPassword(dto.token, dto.password);
  }
}
