import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('healthz')
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { ok: true, service: 'gns-api', ts: new Date().toISOString() };
  }
}
