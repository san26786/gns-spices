import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { OptionalAuthMiddleware } from './common/middleware/optional-auth.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MailModule } from './modules/mail/mail.service';
import { PublicFormsModule } from './modules/public-forms/public-forms.controller';
import { AdminModule } from './modules/admin/admin-ops.controller';
import { CheckoutModule } from './modules/checkout/checkout.controller';
import { HealthController } from './modules/health/health.controller';
import { JwtGuard } from './common/guards/jwt.guard';

// Guards are applied per-controller via @UseGuards rather than APP_GUARD.
// This keeps public routes (like product listing and health checks) untouched
// by auth middleware and avoids a tsx/decorator-metadata edge case with
// APP_GUARD's Reflector injection.
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CatalogModule,
    PricingModule,
    CartModule,
    OrdersModule,
    MailModule,
    PublicFormsModule,
    AdminModule,
    CheckoutModule,
  ],
  controllers: [HealthController],
  // RolesGuard is instantiated via a factory (see common/guards/roles.guard.ts)
  // so it's not a DI provider.
  providers: [JwtGuard, OptionalAuthMiddleware],
  exports: [JwtGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Runs on every request: decodes JWT into req.user if present, never throws.
    consumer.apply(OptionalAuthMiddleware).forRoutes('*');
  }
}
