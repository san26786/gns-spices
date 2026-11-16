import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  controllers: [AuthController, AccountController],
  providers: [AuthService, AccountService],
  exports: [AuthService],
})
export class AuthModule {}
