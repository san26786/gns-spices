import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { OrdersService } from './orders.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

const PlaceDto = z.object({
  billingAddressId: z.string().uuid(),
  shippingAddressId: z.string().uuid(),
  notes: z.string().max(1000).optional(),
});

@Controller('orders')
@UseGuards(JwtGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  place(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    const dto = PlaceDto.parse(body);
    return this.orders.place(user, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('cursor') cursor?: string) {
    return this.orders.listMine(user, cursor);
  }

  @Get(':id')
  detail(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orders.getMine(user, id);
  }
}
