import { Body, Controller, Get, Headers, HttpCode, Module, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { CheckoutService } from './checkout.service';
import { PricingModule } from '../pricing/pricing.module';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

const req = (max: number) => z.string().trim().min(1).max(max);
const opt = (max: number) => z.string().trim().max(max).optional().nullable().transform((v) => v || null);
const Address = z.object({
  contactName: req(120), phone: opt(24), line1: req(200), line2: opt(200),
  city: req(120), state: opt(120), postcode: req(24), country: z.string().trim().length(2).toUpperCase(),
});

@Controller()
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  /** Totals for the current cart, optionally with a coupon. Nothing is charged. */
  @UseGuards(JwtGuard)
  @Post('checkout/quote')
  @HttpCode(200)
  async quote(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    const dto = z.object({ couponCode: z.string().trim().max(40).optional() }).parse(body ?? {});
    return this.checkout.serializeQuote(await this.checkout.quote(user, dto.couponCode || undefined));
  }

  /** Creates a pending order and a Stripe Checkout Session; returns the URL to redirect to. */
  @UseGuards(JwtGuard)
  @Post('checkout/session')
  @HttpCode(201)
  session(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    const dto = z.object({
      shipping: Address,
      billing: Address.optional(),
      couponCode: z.string().trim().max(40).optional(),
      notes: z.string().trim().max(1000).optional(),
    }).parse(body);
    return this.checkout.createSession(user, { ...dto, couponCode: dto.couponCode || undefined });
  }

  @UseGuards(JwtGuard)
  @Get('checkout/session/:id')
  confirm(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.checkout.confirm(user, id);
  }

  @Public()
  @Post('stripe/webhook')
  @HttpCode(200)
  webhook(@Req() request: RawBodyRequest<Request>, @Headers('stripe-signature') signature?: string) {
    return this.checkout.handleWebhook(request.rawBody, signature);
  }
}

@Module({ imports: [PricingModule], controllers: [CheckoutController], providers: [CheckoutService] })
export class CheckoutModule {}
