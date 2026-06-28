import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(
    @Req() req: any,
    @Body() body: { bookingId: string; provider: 'STRIPE' | 'RAZORPAY' },
  ) {
    return this.paymentsService.createCheckoutSession(req.user.id, body);
  }

  @Post('verify')
  async verifySignature(
    @Body() body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    return this.paymentsService.verifyRazorpaySignature(body);
  }

  // Simulation Webhook endpoint
  @Post('webhook/:action')
  async webhook(
    @Param('action') action: 'success' | 'failed',
    @Body() body: { transactionId: string },
  ) {
    if (action === 'success') {
      return this.paymentsService.handlePaymentSuccess(body.transactionId);
    } else {
      return this.paymentsService.handlePaymentFailed(body.transactionId);
    }
  }
}
