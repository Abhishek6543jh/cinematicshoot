import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, BookingStatus, PackageType } from '@prisma/client';

@Controller('api')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Public: List approved photographers
  @Get('photographers')
  async listPhotographers() {
    return this.bookingsService.listPhotographers();
  }

  // Public: List slots of a photographer
  @Get('photographers/:id/slots')
  async getSlots(@Param('id') id: string) {
    return this.bookingsService.getPhotographerSlots(id, true);
  }

  // Photographer only: Create calendar availability slots
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PHOTOGRAPHER, Role.ADMIN)
  @Post('photographers/slots')
  async createSlots(
    @Req() req: any,
    @Body() body: { slots: Array<{ date: string; timeStart: string; timeEnd: string }> },
  ) {
    return this.bookingsService.createSlots(req.user.id, body.slots);
  }

  // Photographer only: Add packages
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PHOTOGRAPHER, Role.ADMIN)
  @Post('photographers/packages')
  async createPackage(
    @Req() req: any,
    @Body() data: { name: string; description: string; price: number; durationMinutes: number; type: PackageType },
  ) {
    return this.bookingsService.createPackage(req.user.id, data);
  }

  // Public/User: Get photographer packages
  @Get('photographers/:id/packages')
  async getPackages(@Param('id') id: string) {
    return this.bookingsService.getPackages(id);
  }

  // Customer only: Create profile or update profile (e.g. photographer application)
  @UseGuards(JwtAuthGuard)
  @Post('users/profile')
  async updateProfile(
    @Req() req: any,
    @Body() data: { bio?: string; experienceYears?: number; portfolioImages?: string[]; resumeUrl?: string },
  ) {
    return this.bookingsService.createPhotographerProfile(req.user.id, data);
  }

  // Authenticated: Create booking (Customers can book photographers)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.ADMIN)
  @Post('bookings')
  async createBooking(
    @Req() req: any,
    @Body() data: { photographerId: string; packageId: string; slotId: string; notes?: string },
  ) {
    return this.bookingsService.createBooking(req.user.id, data);
  }

  // Authenticated: Get history (filtered inside service by user role)
  @UseGuards(JwtAuthGuard)
  @Get('bookings')
  async getBookings(@Req() req: any) {
    return this.bookingsService.getBookings(req.user.id, req.user.role);
  }

  // Authenticated: Cancel or approve booking status
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('bookings/:id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { status: BookingStatus },
  ) {
    return this.bookingsService.updateBookingStatus(req.user.id, req.user.role, id, body.status);
  }

  // Customer: Leave a review after completed shoot
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post('bookings/:id/review')
  async submitReview(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { rating: number; comment?: string },
  ) {
    return this.bookingsService.submitReview(req.user.id, id, body.rating, body.comment);
  }
}
