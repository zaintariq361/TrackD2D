import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<TokenPair & { user: Record<string, unknown> }> {
    const { email, password, firstName, lastName, organizationName } = input;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const slug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);

    const uniqueSlug = await this.uniqueSlug(slug);

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: organizationName,
          slug: uniqueSlug,
        },
      });

      const user = await tx.user.create({
        data: {
          organizationId: org.id,
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: UserRole.ADMIN,
          isEmailVerified: false,
        },
      });

      return { org, user };
    });

    const tokens = await this.generateTokens(
      result.user.id,
      result.user.organizationId,
      result.user.email,
      result.user.role,
    );

    logger.info(`New registration: ${email} (org: ${organizationName})`);

    return { ...tokens, user: this.sanitizeUser(result.user) };
  }

  async login(input: LoginInput): Promise<TokenPair & { user: Record<string, unknown> }> {
    const { email, password } = input;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401);
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.organizationId,
      user.email,
      user.role,
    );

    logger.info(`Login: ${email}`);

    return { ...tokens, user: this.sanitizeUser(user) };
  }

  async refreshToken(token: string): Promise<TokenPair> {
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await prisma.user.findFirst({
      where: { id: stored.userId, isActive: true },
    });
    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Rotate: delete old, issue new
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.generateTokens(user.id, user.organizationId, user.email, user.role);
  }

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  async getProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, logo: true, plan: true },
        },
      },
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return this.sanitizeUser(user);
  }

  async generateTokens(
    userId: string,
    orgId: string,
    email: string,
    role: UserRole,
  ): Promise<TokenPair> {
    const payload = { userId, organizationId: orgId, email, role };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });

    const refreshTokenValue = jwt.sign(
      { userId, type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: '30d' },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: refreshTokenValue };
  }

  sanitizeUser(user: Record<string, unknown>): Record<string, unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = user as { password: string } & Record<string, unknown>;
    return safe;
  }

  private async uniqueSlug(base: string): Promise<string> {
    let slug = base;
    let counter = 1;
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }
}

export const authService = new AuthService();
export default authService;
