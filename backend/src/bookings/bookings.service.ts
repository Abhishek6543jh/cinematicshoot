import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role, BookingStatus, PackageType } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  // Photographers & Profiles
  async listPhotographers() {
    return this.prisma.user.findMany({
      where: {
        role: Role.PHOTOGRAPHER,
        profile: {
          isApproved: true,
        },
      },
      include: {
        profile: true,
      },
    });
  }

  async createPhotographerProfile(
    userId: string,
    data: { bio?: string; experienceYears?: number; portfolioImages?: string[]; resumeUrl?: string },
  ) {
    return this.prisma.profile.upsert({
      where: { userId },
      update: {
        bio: data.bio,
        experienceYears: data.experienceYears,
        portfolioImages: data.portfolioImages ? data.portfolioImages.join(',') : null,
        resumeUrl: data.resumeUrl,
      },
      create: {
        userId,
        bio: data.bio,
        experienceYears: data.experienceYears || 0,
        portfolioImages: data.portfolioImages ? data.portfolioImages.join(',') : null,
        resumeUrl: data.resumeUrl,
        isApproved: false, // requires admin verification
      },
    });
  }

  // Packages
  async createPackage(
    photographerId: string,
    data: { name: string; description: string; price: number; durationMinutes: number; type: PackageType },
  ) {
    return this.prisma.package.create({
      data: {
        photographerId,
        name: data.name,
        description: data.description,
        price: data.price,
        durationMinutes: data.durationMinutes,
        type: data.type,
      },
    });
  }

  async getPackages(photographerId: string) {
    return this.prisma.package.findMany({
      where: { photographerId },
    });
  }

  // Slots
  async createSlots(photographerId: string, slots: Array<{ date: string; timeStart: string; timeEnd: string }>) {
    const data = slots.map((s) => ({
      photographerId,
      date: new Date(s.date),
      timeStart: new Date(s.timeStart),
      timeEnd: new Date(s.timeEnd),
      isBooked: false,
    }));

    return this.prisma.slot.createMany({
      data,
    });
  }

  async getPhotographerSlots(photographerId: string, availableOnly = true) {
    return this.prisma.slot.findMany({
      where: {
        photographerId,
        ...(availableOnly ? { isBooked: false } : {}),
      },
      orderBy: {
        timeStart: 'asc',
      },
    });
  }

  // Bookings
  async createBooking(
    customerId: string,
    data: { photographerId: string; packageId: string; slotId: string; notes?: string },
  ) {
    // Validate slot
    const slot = await this.prisma.slot.findUnique({
      where: { id: data.slotId },
    });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }
    if (slot.isBooked) {
      throw new BadRequestException('Slot is already booked');
    }
    if (slot.photographerId !== data.photographerId) {
      throw new BadRequestException('Slot does not belong to specified photographer');
    }

    // Validate package
    const pkg = await this.prisma.package.findUnique({
      where: { id: data.packageId },
    });

    if (!pkg || pkg.photographerId !== data.photographerId) {
      throw new BadRequestException('Invalid service package selected');
    }

    // Lock the slot
    await this.prisma.slot.update({
      where: { id: slot.id },
      data: { isBooked: true },
    });

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        customerId,
        photographerId: data.photographerId,
        packageId: data.packageId,
        slotId: data.slotId,
        totalPrice: pkg.price,
        notes: data.notes,
        status: BookingStatus.PENDING,
      },
      include: {
        slot: true,
        package: true,
      },
    });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        userId: customerId,
        action: 'CREATE_BOOKING',
        details: JSON.stringify({ bookingId: booking.id, totalPrice: booking.totalPrice }),
      },
    });

    return booking;
  }

  async getBookings(userId: string, role: Role) {
    if (role === Role.ADMIN) {
      return this.prisma.booking.findMany({
        include: { customer: true, photographer: true, slot: true, package: true, payment: true },
      });
    } else if (role === Role.PHOTOGRAPHER) {
      return this.prisma.booking.findMany({
        where: { photographerId: userId },
        include: { customer: true, slot: true, package: true, payment: true },
      });
    } else {
      return this.prisma.booking.findMany({
        where: { customerId: userId },
        include: { photographer: true, slot: true, package: true, payment: true },
      });
    }
  }

  async updateBookingStatus(userId: string, role: Role, bookingId: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Authorization checks
    if (role !== Role.ADMIN && booking.photographerId !== userId && booking.customerId !== userId) {
      throw new ForbiddenException('Not authorized to modify this booking');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    // If cancelled, free up slot
    if (status === BookingStatus.CANCELLED && booking.slotId) {
      await this.prisma.slot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: `UPDATE_BOOKING_STATUS_${status}`,
        details: JSON.stringify({ bookingId, prevStatus: booking.status, newStatus: status }),
      },
    });

    return updated;
  }

  // Reviews
  async submitReview(customerId: string, bookingId: string, rating: number, comment?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.customerId !== customerId) {
      throw new ForbiddenException('Only the customer who booked can review');
    }
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Can only review completed bookings');
    }

    const review = await this.prisma.review.create({
      data: {
        bookingId,
        rating,
        comment,
      },
    });

    // Update photographer average rating
    const reviews = await this.prisma.review.findMany({
      where: {
        booking: {
          photographerId: booking.photographerId,
        },
      },
    });

    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    if (booking.photographerId) {
      await this.prisma.profile.update({
        where: { userId: booking.photographerId },
        data: { rating: avgRating },
      });
    }

    return review;
  }
}
