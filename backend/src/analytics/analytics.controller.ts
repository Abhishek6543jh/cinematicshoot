import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  async getAdminAnalytics() {
    return this.analyticsService.getAdminAnalytics();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PHOTOGRAPHER, Role.ADMIN)
  @Get('photographer')
  async getPhotographerAnalytics(@Req() req: any) {
    return this.analyticsService.getPhotographerAnalytics(req.user.id);
  }
}
