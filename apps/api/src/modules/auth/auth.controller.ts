import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { AccountService, isDisposable, passwordOk, PASSWORD_RULE } from './account.service';
import { Public } from '../../common/decorators/public.decorator';
import { config } from '../../config';

const RegisterDto = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().refine(passwordOk, PASSWORD_RULE.message),
  firstName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(24).optional(),
  region: z.enum(['GB', 'IN', 'AE', 'SA', 'US', 'EU']).optional(),
  /** Honeypot: must stay empty. */
  website: z.string().optional(),
  /** Epoch ms when the form was opened; bots submit instantly. */
  formOpenedAt: z.coerce.number().optional(),
});

const LoginDto = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly account: AccountService) {}

  @Public()
  @Post('register')
  @HttpCode(201)
  async register(@Body() body: unknown, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const dto = RegisterDto.parse(body);
    // Bots: fill the honeypot or submit within 1.5s of opening the form. Reject quietly.
    if (dto.website || (dto.formOpenedAt !== undefined && Date.now() - dto.formOpenedAt < 1500)) {
      throw new BadRequestException('registration_rejected');
    }
    if (isDisposable(dto.email)) throw new BadRequestException('disposable_email');
    const tokens = await this.auth.register(dto);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    await this.account.sendVerification(tokens.user.sub);
    return { user: tokens.user };
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const dto = LoginDto.parse(body);
    const tokens = await this.auth.login(dto.email, dto.password);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return { user: tokens.user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.['gns_rt'];
    if (!raw) throw new UnauthorizedException('no_refresh');
    const tokens = await this.auth.refresh(raw, {
      userAgent: req.get('user-agent') ?? undefined,
      ip: req.ip,
    });
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return { user: tokens.user };
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.cookies?.['gns_rt']);
    res.clearCookie('gns_at', { domain: config.cookie.domain });
    res.clearCookie('gns_rt', { domain: config.cookie.domain, path: '/v1/auth' });
  }

  private setCookies(res: Response, access: string, refresh: string) {
    const common = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: config.cookie.secure,
      domain: config.cookie.domain,
      path: '/',
    };
    res.cookie('gns_at', access, {
      ...common,
      maxAge: config.jwt.accessTtlSec * 1000,
    });
    res.cookie('gns_rt', refresh, {
      ...common,
      maxAge: config.jwt.refreshTtlSec * 1000,
      path: '/v1/auth', // refresh cookie limited to auth routes
    });
  }
}
