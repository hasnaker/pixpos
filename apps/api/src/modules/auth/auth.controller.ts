import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService, AuthResponse } from './auth.service';
import { Request } from 'express';

class PinLoginDto {
  pin: string;
  storeId: string;
}

class SuperAdminLoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * PIN ile giriş (POS/Waiter için)
   * POST /api/auth/login
   */
  @Post('login')
  async loginWithPin(@Body() dto: PinLoginDto): Promise<AuthResponse> {
    return this.authService.loginWithPin(dto.pin, dto.storeId);
  }

  /**
   * Super Admin girişi
   * POST /api/auth/super-admin/login
   */
  @Post('super-admin/login')
  async loginSuperAdmin(@Body() dto: SuperAdminLoginDto): Promise<AuthResponse> {
    return this.authService.loginSuperAdmin(dto.email, dto.password);
  }

  /**
   * Profil bilgilerini getir
   * GET /api/auth/profile
   */
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.getProfile(user.sub);
  }

  /**
   * Token doğrula
   * GET /api/auth/verify
   */
  @Get('verify')
  @UseGuards(AuthGuard('jwt'))
  async verifyToken(@Req() req: Request) {
    return { valid: true, user: req.user };
  }

  /**
   * Varsayılan super admin oluştur (sadece development)
   * POST /api/auth/seed-super-admin
   */
  @Post('seed-super-admin')
  async seedSuperAdmin() {
    const result = await this.authService.seedSuperAdmin();
    if (result) {
      return { message: 'Super admin oluşturuldu', email: 'admin@pixpos.cloud' };
    }
    return { message: 'Super admin zaten mevcut' };
  }
}
