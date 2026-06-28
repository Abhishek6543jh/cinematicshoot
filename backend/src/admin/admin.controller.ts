import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, BookingStatus, ApplicationStatus } from '@prisma/client';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 1. Dashboard Stats
  @Get('dashboard')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER, Role.HR_MANAGER, Role.FINANCE_MANAGER)
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // 2. Bookings Management
  @Get('bookings')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER, Role.FINANCE_MANAGER)
  async getBookings(
    @Query('query') query?: string,
    @Query('status') status?: BookingStatus,
  ) {
    return this.adminService.getBookings(query, status);
  }

  @Patch('bookings/:id/assign')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER)
  async assignPhotographer(
    @Req() req: any,
    @Param('id') bookingId: string,
    @Body('photographerId') photographerId: string,
  ) {
    return this.adminService.assignPhotographer(req.user.id, bookingId, photographerId);
  }

  @Patch('bookings/:id/status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER)
  async updateBookingStatus(
    @Req() req: any,
    @Param('id') bookingId: string,
    @Body('status') status: BookingStatus,
  ) {
    return this.adminService.updateBookingStatusAdmin(req.user.id, bookingId, status);
  }

  @Patch('bookings/:id/reschedule')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER)
  async rescheduleBooking(
    @Req() req: any,
    @Param('id') bookingId: string,
    @Body('slotId') slotId: string,
  ) {
    return this.adminService.rescheduleBooking(req.user.id, bookingId, slotId);
  }

  @Post('bookings/:id/invoice')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER, Role.FINANCE_MANAGER)
  async generateInvoice(@Param('id') bookingId: string) {
    return this.adminService.generateInvoice(bookingId);
  }

  // 3. Photographer Management
  @Get('photographers')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER, Role.HR_MANAGER, Role.FINANCE_MANAGER)
  async getPhotographers() {
    return this.adminService.getPhotographersAdmin();
  }

  @Post('photographers')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR_MANAGER)
  async createPhotographer(@Req() req: any, @Body() body: any) {
    return this.adminService.createPhotographer(req.user.id, body);
  }

  @Patch('photographers/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR_MANAGER)
  async updatePhotographer(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updatePhotographer(req.user.id, id, body);
  }

  @Patch('photographers/:id/status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR_MANAGER)
  async togglePhotographerStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.togglePhotographerStatus(req.user.id, id, isActive);
  }

  @Patch('photographers/:id/approve')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR_MANAGER)
  async approvePhotographer(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.adminService.approvePhotographerAdmin(req.user.id, id);
  }

  // 4. Slots Management
  @Get('slots')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER)
  async getSlots() {
    return this.adminService.getSlotsAdmin();
  }

  @Post('slots')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER)
  async createSlots(
    @Req() req: any,
    @Body('photographerId') photographerId: string,
    @Body('slots') slots: any[],
  ) {
    return this.adminService.createSlotsAdmin(req.user.id, photographerId, slots);
  }

  @Delete('slots/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER)
  async deleteSlot(@Req() req: any, @Param('id') id: string) {
    return this.adminService.deleteSlotAdmin(req.user.id, id);
  }

  @Get('blocked-dates')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER)
  async getBlockedDates() {
    return this.adminService.getBlockedDates();
  }

  @Post('blocked-dates')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER)
  async blockDate(
    @Req() req: any,
    @Body('date') date: string,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.blockDate(req.user.id, date, reason);
  }

  @Delete('blocked-dates/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER)
  async unblockDate(@Req() req: any, @Param('id') id: string) {
    return this.adminService.unblockDate(req.user.id, id);
  }

  // 5. Services & Package Management
  @Get('packages')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CONTENT_MANAGER)
  async getPackages() {
    return this.adminService.getPackagesAdmin();
  }

  @Post('packages')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CONTENT_MANAGER)
  async createPackage(@Req() req: any, @Body() body: any) {
    return this.adminService.createPackageAdmin(req.user.id, body);
  }

  @Patch('packages/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CONTENT_MANAGER)
  async updatePackage(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updatePackageAdmin(req.user.id, id, body);
  }

  @Delete('packages/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CONTENT_MANAGER)
  async deletePackage(@Req() req: any, @Param('id') id: string) {
    return this.adminService.deletePackageAdmin(req.user.id, id);
  }

  // Promo codes
  @Get('promos')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CONTENT_MANAGER, Role.FINANCE_MANAGER)
  async getPromoCodes() {
    return this.adminService.getPromoCodes();
  }

  @Post('promos')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CONTENT_MANAGER, Role.FINANCE_MANAGER)
  async createPromoCode(@Req() req: any, @Body() body: any) {
    return this.adminService.createPromoCode(req.user.id, body);
  }

  @Delete('promos/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CONTENT_MANAGER, Role.FINANCE_MANAGER)
  async deletePromoCode(@Req() req: any, @Param('id') id: string) {
    return this.adminService.deletePromoCode(req.user.id, id);
  }

  // 6. Gallery Management
  @Get('albums')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CONTENT_MANAGER)
  async getAlbums() {
    return this.adminService.getAlbums();
  }

  @Post('albums')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CONTENT_MANAGER)
  async createAlbum(@Req() req: any, @Body() body: any) {
    return this.adminService.createAlbum(req.user.id, body);
  }

  @Patch('albums/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CONTENT_MANAGER)
  async updateAlbum(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updateAlbum(req.user.id, id, body);
  }

  @Delete('albums/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CONTENT_MANAGER)
  async deleteAlbum(@Req() req: any, @Param('id') id: string) {
    return this.adminService.deleteAlbum(req.user.id, id);
  }

  @Post('albums/:id/media')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CONTENT_MANAGER)
  async addMediaToAlbum(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.addMediaToAlbum(req.user.id, id, body);
  }

  // 7. Careers Management
  @Get('jobs')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR_MANAGER)
  async getJobs() {
    return this.adminService.getJobs();
  }

  @Post('jobs')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR_MANAGER)
  async createJob(@Req() req: any, @Body() body: any) {
    return this.adminService.createJob(req.user.id, body);
  }

  @Patch('jobs/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR_MANAGER)
  async updateJob(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updateJob(req.user.id, id, body);
  }

  @Get('applications')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR_MANAGER)
  async getApplications() {
    return this.adminService.getApplications();
  }

  @Patch('applications/:id/status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR_MANAGER)
  async updateApplicationStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('status') status: ApplicationStatus,
  ) {
    return this.adminService.updateApplicationStatus(req.user.id, id, status);
  }

  // 8. Customers Management
  @Get('customers')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER, Role.HR_MANAGER)
  async getCustomers() {
    return this.adminService.getCustomersAdmin();
  }

  @Patch('customers/:id/status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER, Role.HR_MANAGER)
  async toggleCustomerStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.toggleCustomerStatus(req.user.id, id, isActive);
  }

  // 9. Payments Ledger
  @Get('payments')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE_MANAGER)
  async getPayments() {
    return this.adminService.getPaymentsAdmin();
  }

  @Post('payments/:id/refund')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE_MANAGER)
  async refundPayment(@Req() req: any, @Param('id') id: string) {
    return this.adminService.refundPayment(req.user.id, id);
  }

  // 10. CMS Configs
  @Get('cms')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CONTENT_MANAGER)
  async getCmsContent() {
    return this.adminService.getCmsContent();
  }

  @Post('cms')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CONTENT_MANAGER)
  async saveCmsContent(
    @Req() req: any,
    @Body('section') section: string,
    @Body('content') content: any,
  ) {
    return this.adminService.saveCmsContent(req.user.id, section, content);
  }

  // 11. Notification Management Dispatch
  @Post('notifications')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.BOOKING_MANAGER, Role.HR_MANAGER, Role.CONTENT_MANAGER)
  async sendNotification(@Req() req: any, @Body() body: any) {
    return this.adminService.sendNotification(req.user.id, body);
  }

  // 12. Audit Logs
  @Get('audit-logs')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}
