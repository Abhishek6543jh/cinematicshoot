import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BookingStatus, Role } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAdminAnalytics() {
    // Booking counts by status
    const bookingCounts = await this.prisma.booking.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Total revenue from successful payments
    const successfulPayments = await this.prisma.payment.aggregate({
      where: {
        status: 'SUCCESS',
      },
      _sum: {
        amount: true,
      },
    });

    // Total active photographers and customers
    const userRoleCounts = await this.prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    // Recent audit logs
    const recentLogs = await this.prisma.auditLog.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      totalRevenue: successfulPayments._sum.amount || 0,
      bookingsByStatus: bookingCounts.reduce((acc, current) => {
        acc[current.status] = current._count.id;
        return acc;
      }, {} as Record<string, number>),
      usersCount: userRoleCounts.reduce((acc, current) => {
        acc[current.role] = current._count.id;
        return acc;
      }, {} as Record<string, number>),
      recentLogs,
    };
  }

  async getPhotographerAnalytics(photographerId: string) {
    // Photographer booking counts by status
    const bookingCounts = await this.prisma.booking.groupBy({
      where: { photographerId },
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Total completed earnings
    const completedBookings = await this.prisma.booking.aggregate({
      where: {
        photographerId,
        status: BookingStatus.COMPLETED,
        payment: {
          status: 'SUCCESS',
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Total slots and availability count
    const totalSlotsCount = await this.prisma.slot.count({
      where: { photographerId },
    });
    const availableSlotsCount = await this.prisma.slot.count({
      where: { photographerId, isBooked: false },
    });

    // Get current rating
    const profile = await this.prisma.profile.findUnique({
      where: { userId: photographerId },
      select: { rating: true },
    });

    return {
      totalEarnings: completedBookings._sum.totalPrice || 0,
      bookingsByStatus: bookingCounts.reduce((acc, current) => {
        acc[current.status] = current._count.id;
        return acc;
      }, {} as Record<string, number>),
      slots: {
        total: totalSlotsCount,
        available: availableSlotsCount,
      },
      rating: profile?.rating || 0.0,
    };
  }
}
