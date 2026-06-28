import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role, BookingStatus, PaymentStatus, JobStatus, ApplicationStatus, GalleryCategory } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // 1. Audit Logging helper
  private async logAction(userId: string | null, action: string, details: any) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        details: JSON.stringify(details),
      },
    });
  }

  // 2. Admin Authentication & RBAC Checks - performed via Guards, but helper roles here:
  async verifyAdminAccess(user: { id: string; role: Role }, allowedRoles: Role[]) {
    if (!allowedRoles.includes(user.role)) {
      throw new BadRequestException('Insufficient privileges');
    }
  }

  // 3. Admin Dashboard
  async getDashboardStats() {
    const totalBookings = await this.prisma.booking.count();
    const pendingBookings = await this.prisma.booking.count({
      where: { status: BookingStatus.PENDING },
    });
    const completedShoots = await this.prisma.booking.count({
      where: { status: BookingStatus.COMPLETED },
    });

    const revenueAggr = await this.prisma.payment.aggregate({
      where: { status: PaymentStatus.SUCCESS },
      _sum: { amount: true },
    });
    const revenue = revenueAggr._sum.amount || 0;

    const activePhotographers = await this.prisma.user.count({
      where: { role: Role.PHOTOGRAPHER, isActive: true },
    });

    const careerApplications = await this.prisma.jobApplication.count();

    // Booking and Revenue trends (last 6 months)
    // For SQLite, we fetch the data and aggregate in JS to prevent native SQL errors
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const bookingsList = await this.prisma.booking.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, totalPrice: true, status: true },
    });

    const monthlyTrends: Record<string, { bookings: number; revenue: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyTrends[label] = { bookings: 0, revenue: 0 };
    }

    bookingsList.forEach((b) => {
      const label = b.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (monthlyTrends[label]) {
        monthlyTrends[label].bookings += 1;
        if (b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CONFIRMED) {
          monthlyTrends[label].revenue += b.totalPrice;
        }
      }
    });

    const trends = Object.keys(monthlyTrends).map((key) => ({
      month: key,
      bookings: monthlyTrends[key].bookings,
      revenue: monthlyTrends[key].revenue,
    }));

    // Recent Activities
    const recentActivities = await this.prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });

    return {
      totalBookings,
      pendingBookings,
      completedShoots,
      revenue,
      activePhotographers,
      careerApplications,
      trends,
      recentActivities: recentActivities.map((log) => ({
        id: log.id,
        adminName: log.user?.name || 'System',
        action: log.action,
        timestamp: log.createdAt,
        details: log.details,
      })),
    };
  }

  // 4. Booking Management
  async getBookings(query?: string, status?: BookingStatus) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (query) {
      where.OR = [
        { customer: { name: { contains: query } } },
        { photographer: { name: { contains: query } } },
        { id: { contains: query } },
      ];
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, phoneNumber: true } },
        photographer: { select: { id: true, name: true, email: true } },
        package: true,
        slot: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignPhotographer(adminId: string, bookingId: string, photographerId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    const prevValue = booking.photographerId;
    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { photographerId },
    });

    await this.logAction(adminId, 'ASSIGN_PHOTOGRAPHER', {
      bookingId,
      previousPhotographerId: prevValue,
      newPhotographerId: photographerId,
    });
    return updated;
  }

  async updateBookingStatusAdmin(adminId: string, bookingId: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    // Release slot if cancelled
    if (status === BookingStatus.CANCELLED && booking.slotId) {
      await this.prisma.slot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });
    }

    await this.logAction(adminId, 'UPDATE_BOOKING_STATUS', {
      bookingId,
      previousStatus: booking.status,
      newStatus: status,
    });
    return updated;
  }

  async rescheduleBooking(adminId: string, bookingId: string, slotId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    const newSlot = await this.prisma.slot.findUnique({ where: { id: slotId } });
    if (!newSlot || newSlot.isBooked) throw new BadRequestException('Slot is unavailable');

    // Free old slot
    if (booking.slotId) {
      await this.prisma.slot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });
    }

    // Book new slot
    await this.prisma.slot.update({
      where: { id: slotId },
      data: { isBooked: true },
    });

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { slotId },
    });

    await this.logAction(adminId, 'RESCHEDULE_BOOKING', {
      bookingId,
      oldSlotId: booking.slotId,
      newSlotId: slotId,
    });
    return updated;
  }

  async generateInvoice(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, package: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const invoiceUrl = `/invoices/${booking.id}_${Date.now()}.pdf`;
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { invoiceUrl },
    });
    return { invoiceUrl };
  }

  // 5. Photographer Management
  async getPhotographersAdmin() {
    return this.prisma.user.findMany({
      where: { role: Role.PHOTOGRAPHER },
      include: { profile: true },
    });
  }

  async createPhotographer(adminId: string, body: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw new BadRequestException('Email already in use');

    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        role: Role.PHOTOGRAPHER,
        phoneNumber: body.phoneNumber,
        isActive: true,
        profile: {
          create: {
            bio: body.bio || '',
            experienceYears: Number(body.experienceYears) || 0,
            portfolioImages: body.portfolioImages ? body.portfolioImages.join(',') : '',
            isApproved: true,
          },
        },
      },
    });

    await this.logAction(adminId, 'CREATE_PHOTOGRAPHER', { photographerId: user.id });
    return user;
  }

  async updatePhotographer(adminId: string, id: string, body: any) {
    const phot = await this.prisma.user.findUnique({ where: { id } });
    if (!phot) throw new NotFoundException('Photographer not found');

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        phoneNumber: body.phoneNumber,
        profile: {
          update: {
            bio: body.bio,
            experienceYears: Number(body.experienceYears) || 0,
            portfolioImages: body.portfolioImages ? body.portfolioImages.join(',') : undefined,
          },
        },
      },
      include: { profile: true },
    });

    await this.logAction(adminId, 'UPDATE_PHOTOGRAPHER', { photographerId: id });
    return user;
  }

  async togglePhotographerStatus(adminId: string, id: string, isActive: boolean) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
    await this.logAction(adminId, 'TOGGLE_PHOTOGRAPHER_STATUS', { photographerId: id, isActive });
    return updated;
  }

  // Approve a self-registered photographer applicant
  async approvePhotographerAdmin(adminId: string, id: string) {
    const updated = await this.prisma.profile.update({
      where: { userId: id },
      data: { isApproved: true },
    });
    await this.logAction(adminId, 'APPROVE_PHOTOGRAPHER', { photographerId: id });
    return updated;
  }

  // 6. Slot Management
  async getSlotsAdmin() {
    return this.prisma.slot.findMany({
      include: { booking: true },
      orderBy: { date: 'asc' },
    });
  }

  async createSlotsAdmin(adminId: string, photographerId: string, slotsData: any[]) {
    const data = slotsData.map((s) => ({
      photographerId,
      date: new Date(s.date),
      timeStart: new Date(s.timeStart),
      timeEnd: new Date(s.timeEnd),
      isBooked: false,
    }));

    const result = await this.prisma.slot.createMany({ data });
    await this.logAction(adminId, 'CREATE_SLOTS', { photographerId, slotsCount: data.length });
    return result;
  }

  async deleteSlotAdmin(adminId: string, id: string) {
    const updated = await this.prisma.slot.delete({ where: { id } });
    await this.logAction(adminId, 'DELETE_SLOT', { slotId: id });
    return updated;
  }

  async getBlockedDates() {
    return this.prisma.blockedDate.findMany();
  }

  async blockDate(adminId: string, dateStr: string, reason?: string) {
    const blocked = await this.prisma.blockedDate.create({
      data: {
        date: new Date(dateStr),
        reason,
      },
    });
    await this.logAction(adminId, 'BLOCK_DATE', { date: dateStr, reason });
    return blocked;
  }

  async unblockDate(adminId: string, id: string) {
    const unblocked = await this.prisma.blockedDate.delete({ where: { id } });
    await this.logAction(adminId, 'UNBLOCK_DATE', { id });
    return unblocked;
  }

  // 7. Service & Packages Management
  async getPackagesAdmin() {
    return this.prisma.package.findMany();
  }

  async createPackageAdmin(adminId: string, body: any) {
    const pkg = await this.prisma.package.create({
      data: {
        photographerId: body.photographerId || 'admin',
        name: body.name,
        description: body.description,
        price: Number(body.price),
        durationMinutes: Number(body.durationMinutes),
        type: body.type,
        isCustom: body.isCustom || false,
      },
    });
    await this.logAction(adminId, 'CREATE_PACKAGE', { packageId: pkg.id });
    return pkg;
  }

  async updatePackageAdmin(adminId: string, id: string, body: any) {
    const pkg = await this.prisma.package.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: Number(body.price),
        durationMinutes: Number(body.durationMinutes),
        type: body.type,
      },
    });
    await this.logAction(adminId, 'UPDATE_PACKAGE', { packageId: id });
    return pkg;
  }

  async deletePackageAdmin(adminId: string, id: string) {
    const deleted = await this.prisma.package.delete({ where: { id } });
    await this.logAction(adminId, 'DELETE_PACKAGE', { packageId: id });
    return deleted;
  }

  // Promo Codes
  async getPromoCodes() {
    return this.prisma.promoCode.findMany();
  }

  async createPromoCode(adminId: string, body: any) {
    const promo = await this.prisma.promoCode.create({
      data: {
        code: body.code.toUpperCase(),
        discount: Number(body.discount),
        expiry: new Date(body.expiry),
        isActive: true,
      },
    });
    await this.logAction(adminId, 'CREATE_PROMO', { code: body.code });
    return promo;
  }

  async deletePromoCode(adminId: string, id: string) {
    const deleted = await this.prisma.promoCode.delete({ where: { id } });
    await this.logAction(adminId, 'DELETE_PROMO', { id });
    return deleted;
  }

  // 8. Gallery / Album Management
  async getAlbums() {
    return this.prisma.album.findMany({
      include: { mediaItems: true },
    });
  }

  async createAlbum(adminId: string, body: any) {
    const album = await this.prisma.album.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category as GalleryCategory,
        isFeatured: body.isFeatured || false,
      },
    });
    await this.logAction(adminId, 'CREATE_ALBUM', { albumId: album.id });
    return album;
  }

  async updateAlbum(adminId: string, id: string, body: any) {
    const album = await this.prisma.album.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category as GalleryCategory,
        isFeatured: body.isFeatured,
      },
    });
    await this.logAction(adminId, 'UPDATE_ALBUM', { albumId: id });
    return album;
  }

  async deleteAlbum(adminId: string, id: string) {
    const deleted = await this.prisma.album.delete({ where: { id } });
    await this.logAction(adminId, 'DELETE_ALBUM', { albumId: id });
    return deleted;
  }

  async addMediaToAlbum(adminId: string, albumId: string, body: any) {
    const media = await this.prisma.mediaItem.create({
      data: {
        albumId,
        url: body.url,
        type: body.type, // "IMAGE" or "VIDEO"
      },
    });
    await this.logAction(adminId, 'ADD_MEDIA', { albumId, mediaId: media.id });
    return media;
  }

  // 9. Career Management
  async getJobs() {
    return this.prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createJob(adminId: string, body: any) {
    const job = await this.prisma.job.create({
      data: {
        title: body.title,
        department: body.department,
        location: body.location,
        type: body.type,
        description: body.description,
        requirements: body.requirements,
        status: JobStatus.OPEN,
      },
    });
    await this.logAction(adminId, 'CREATE_JOB', { jobId: job.id });
    return job;
  }

  async updateJob(adminId: string, id: string, body: any) {
    const job = await this.prisma.job.update({
      where: { id },
      data: {
        title: body.title,
        department: body.department,
        location: body.location,
        type: body.type,
        description: body.description,
        requirements: body.requirements,
        status: body.status as JobStatus,
      },
    });
    await this.logAction(adminId, 'UPDATE_JOB', { jobId: id });
    return job;
  }

  async getApplications() {
    return this.prisma.jobApplication.findMany({
      include: { job: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateApplicationStatus(adminId: string, id: string, status: ApplicationStatus) {
    const updated = await this.prisma.jobApplication.update({
      where: { id },
      data: { status },
    });
    await this.logAction(adminId, 'UPDATE_APPLICATION_STATUS', { applicationId: id, status });
    return updated;
  }

  // 10. Customer Management
  async getCustomersAdmin() {
    return this.prisma.user.findMany({
      where: { role: Role.CUSTOMER },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleCustomerStatus(adminId: string, id: string, isActive: boolean) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
    await this.logAction(adminId, 'TOGGLE_CUSTOMER_STATUS', { customerId: id, isActive });
    return updated;
  }

  // 11. Payment Management
  async getPaymentsAdmin() {
    return this.prisma.payment.findMany({
      include: {
        booking: {
          include: {
            customer: { select: { name: true, email: true } },
            photographer: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async refundPayment(adminId: string, id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.REFUNDED },
    });

    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    await this.logAction(adminId, 'REFUND_PAYMENT', { paymentId: id, amount: payment.amount });
    return updatedPayment;
  }

  // 12. CMS Content Management
  async getCmsContent() {
    return this.prisma.cmsContent.findMany();
  }

  async saveCmsContent(adminId: string, section: string, contentJson: any) {
    const cms = await this.prisma.cmsContent.upsert({
      where: { section },
      update: { content: JSON.stringify(contentJson) },
      create: { section, content: JSON.stringify(contentJson) },
    });
    await this.logAction(adminId, 'SAVE_CMS', { section });
    return cms;
  }

  // 13. Notification Management
  async sendNotification(adminId: string, body: any) {
    // In production: Integrate Twilio, SendGrid or FCM Push Notifications.
    // For this build, we mock the dispatch action and log the output:
    const dispatchDetails = {
      channels: body.channels, // e.g. ["EMAIL", "SMS", "PUSH"]
      targets: body.targets,   // e.g. "ALL_CUSTOMERS", "PHOTOGRAPHERS"
      title: body.title,
      message: body.message,
      timestamp: new Date(),
    };

    await this.logAction(adminId, 'SEND_NOTIFICATIONS', dispatchDetails);
    return { success: true, message: 'Notifications simulated and dispatched successfully', details: dispatchDetails };
  }

  // 14. Audit Logs Retrieval
  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
