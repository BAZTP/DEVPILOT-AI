import { Injectable, UnauthorizedException, ConflictException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, name: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Ya existe una cuenta con este correo");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        accounts: {
          create: {
            provider: "credentials",
            providerAccountId: email,
            accessToken: passwordHash, // Almacenamos el hash como accessToken para credentials
          },
        },
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    this.logger.log(`Nuevo usuario registrado: ${email}`);
    return this.signTokens(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        accounts: { where: { provider: "credentials" } },
      },
    });

    if (!user || user.accounts.length === 0) {
      throw new UnauthorizedException("Credenciales incorrectas");
    }

    const account = user.accounts[0];
    if (!account?.accessToken) {
      throw new UnauthorizedException("Credenciales incorrectas");
    }

    const valid = await bcrypt.compare(password, account.accessToken);
    if (!valid) {
      throw new UnauthorizedException("Credenciales incorrectas");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.signTokens(user.id, user.email);
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }

  private signTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: { id: userId, email },
    };
  }
}
