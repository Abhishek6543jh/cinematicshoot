import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private razorpayClient: Razorpay;

  constructor(private prisma: PrismaService) {
    this.razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret',
    });
  }

  async createCheckoutSession(
    userId: string,
    body: { bookingId: string; provider: 'STRIPE' | 'RAZORPAY' },
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: body.bookingId },
      include: { customer: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.customerId !== userId) {
      throw new BadRequestException('Booking does not belong to user');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking is already processed or cancelled');
    }

    let transactionId = '';
    let checkoutUrl = '';

    if (body.provider === 'RAZORPAY') {
      try {
        const order = await this.razorpayClient.orders.create({
          amount: Math.round(booking.totalPrice * 100), // amount in paise
          currency: 'INR',
          receipt: booking.id,
        });
        transactionId = order.id;
      } catch (err) {
        console.error('[RAZORPAY] Error creating order:', err);
        throw new BadRequestException('Failed to generate Razorpay order');
      }
    } else {
      // Fallback/Mock provider
      transactionId = `txn_mock_${Date.now()}`;
      checkoutUrl = `/checkout/mock?session_id=${transactionId}&booking_id=${booking.id}`;
    }

    // Create or update pending payment record
    const payment = await this.prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        transactionId,
        provider: body.provider,
        status: PaymentStatus.PENDING,
        amount: booking.totalPrice,
      },
      create: {
        bookingId: booking.id,
        transactionId,
        provider: body.provider,
        status: PaymentStatus.PENDING,
        amount: booking.totalPrice,
      },
    });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: `INITIATE_PAYMENT_${body.provider}`,
        details: JSON.stringify({ bookingId: booking.id, transactionId, amount: booking.totalPrice }),
      },
    });

    return {
      checkoutUrl,
      paymentId: payment.id,
      transactionId,
      amount: booking.totalPrice,
      currency: 'INR',
    };
  }

  async verifyRazorpaySignature(body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret';
    const shasum = crypto.createHmac('sha256', keySecret);
    shasum.update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== body.razorpay_signature) {
      throw new BadRequestException('Invalid Razorpay signature verification failed');
    }

    return this.handlePaymentSuccess(body.razorpay_order_id);
  }

  // Webhook/Callback controllers
  async handlePaymentSuccess(transactionId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { transactionId },
      include: { booking: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment transaction not found');
    }

    // Transition Payment to SUCCESS
    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.SUCCESS },
    });

    // Transition Booking to CONFIRMED
    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.CONFIRMED },
    });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        userId: payment.booking.customerId,
        action: 'PAYMENT_SUCCESS',
        details: JSON.stringify({ bookingId: payment.bookingId, transactionId }),
      },
    });

    return { status: 'success', payment: updatedPayment };
  }

  async handlePaymentFailed(transactionId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { transactionId },
    });

    if (!payment) {
      throw new NotFoundException('Payment transaction not found');
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'PAYMENT_FAILED',
        details: JSON.stringify({ bookingId: payment.bookingId, transactionId }),
      },
    });

    return { status: 'failed', payment: updatedPayment };
  }
}
