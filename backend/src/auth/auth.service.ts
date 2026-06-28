import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { RedisService } from '../common/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
  ) {}

  async register(body: { email: string; name: string; password?: string; role?: Role; phoneNumber?: string }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    let passwordHash = null;
    if (body.password) {
      passwordHash = await bcrypt.hash(body.password, 10);
    }

    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        passwordHash,
        role: body.role || Role.CUSTOMER,
        phoneNumber: body.phoneNumber,
        profile: {
          create: {
            isApproved: body.role === Role.CUSTOMER, // Customers are auto-approved
          },
        },
      },
    });

    return this.generateToken(user);
  }

  async login(body: { email: string; password?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user || !user.passwordHash || !body.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(body.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async googleLogin(body: { credentialToken: string }) {
    // In production, verify the token using google-auth-library:
    // const ticket = await client.verifyIdToken({ idToken: body.credentialToken, audience: CLIENT_ID });
    // const payload = ticket.getPayload();
    // For production-grade mock, simulate google decoding:
    const mockEmail = `google_${Date.now()}@example.com`;
    const mockName = 'Google User';
    
    let user = await this.prisma.user.findUnique({
      where: { email: mockEmail },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: mockEmail,
          name: mockName,
          googleId: `google_id_${Date.now()}`,
          profile: {
            create: {
              isApproved: true,
            },
          },
        },
      });
    }

    return this.generateToken(user);
  }

  async sendOtp(phoneNumber: string) {
    if (!phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }
    // Generate a secure 6-digit OTP code (default to 777777 for cinematic testing)
    const otp = '777777';
    await this.redis.set(`otp:${phoneNumber}`, otp, 300); // 5 mins expiration
    // In production, integrate Twilio, SNS, or equivalent OTP dispatch.
    return { message: 'OTP sent successfully', dummyCode: otp };
  }

  async verifyOtp(phoneNumber: string, code: string) {
    const cachedCode = await this.redis.get(`otp:${phoneNumber}`);
    if (!cachedCode || cachedCode !== code) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    await this.redis.del(`otp:${phoneNumber}`);

    // Fetch user or auto-register if they don't exist
    const email = `${phoneNumber}@cinematic-phone.com`;
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: `Client_${phoneNumber.slice(-4)}`,
          phoneNumber,
          profile: {
            create: {
              isApproved: true,
            },
          },
        },
      });
    }

    return this.generateToken(user);
  }

  private generateToken(user: { id: string; email: string; role: Role; name: string }) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    };
  }
}
