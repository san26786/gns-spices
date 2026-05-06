import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { CartService } from './cart.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

const AddDto = z.object({
  variantId: z.string().uuid(),
  qty: z.number().int().min(1).max(10_000),
});

const UpdateDto = z.object({
  qty: z.number().int().min(1).max(10_000),
});

@Controller('cart')
@UseGuards(JwtGuard)
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  view(@CurrentUser() user: AuthUser) {
    return this.cart.view(user);
  }

  @Post('items')
  add(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    const dto = AddDto.parse(body);
    return this.cart.addItem(user, dto.variantId, dto.qty);
  }

  @Patch('items/:id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    const dto = UpdateDto.parse(body);
    return this.cart.updateItem(user, id, dto.qty);
  }

  @Delete('items/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cart.removeItem(user, id);
  }

  @Delete()
  clear(@CurrentUser() user: AuthUser) {
    return this.cart.clear(user);
  }
}
