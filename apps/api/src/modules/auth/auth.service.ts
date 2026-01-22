import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Store } from '../../entities/store.entity';

export interface JwtPayload {
  sub: string; // user id
  storeId: string | null;
  role: string;
  name: string;
}

export interface AuthResponse {
  user: Partial<User>;
  store: Partial<Store> | null;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * PIN ile giriş (POS/Waiter için)
   */
  async loginWithPin(pin: string, storeId: string): Promise<AuthResponse> {
    // Store kontrolü
    const store = await this.storeRepository.findOne({ where: { id: storeId, isActive: true } });
    if (!store) {
      throw new NotFoundException('Store bulunamadı');
    }

    if (store.status === 'suspended' || store.status === 'cancelled') {
      throw new UnauthorizedException('Bu işletme aktif değil');
    }

    // Bu store'daki kullanıcıları bul
    const users = await this.userRepository.find({
      where: { storeId, isActive: true },
    });

    // PIN eşleştir
    let matchedUser: User | null = null;
    for (const user of users) {
      const isMatch = await bcrypt.compare(pin, user.pin);
      if (isMatch) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      throw new UnauthorizedException('Geçersiz PIN');
    }

    // Son giriş zamanını güncelle
    matchedUser.lastLoginAt = new Date();
    await this.userRepository.save(matchedUser);

    // JWT oluştur
    const payload: JwtPayload = {
      sub: matchedUser.id,
      storeId: matchedUser.storeId,
      role: matchedUser.role,
      name: matchedUser.name,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: matchedUser.id,
        name: matchedUser.name,
        role: matchedUser.role,
        avatarUrl: matchedUser.avatarUrl,
      },
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        logoUrl: store.logoUrl,
      },
      accessToken,
    };
  }

  /**
   * Super Admin girişi (email + password)
   */
  async loginSuperAdmin(email: string, password: string): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email, role: 'super_admin', isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }

    // Password kontrolü (PIN alanını password olarak kullanıyoruz)
    const isMatch = await bcrypt.compare(password, user.pin);
    if (!isMatch) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }

    // Son giriş zamanını güncelle
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // JWT oluştur
    const payload: JwtPayload = {
      sub: user.id,
      storeId: null,
      role: user.role,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      store: null,
      accessToken,
    };
  }

  /**
   * Token doğrula
   */
  async validateToken(token: string): Promise<JwtPayload | null> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  /**
   * Kullanıcı bilgilerini getir
   */
  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['store'],
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      storeId: user.storeId,
    };
  }

  /**
   * Varsayılan super admin oluştur
   */
  async seedSuperAdmin(): Promise<User | null> {
    const existing = await this.userRepository.findOne({
      where: { role: 'super_admin' },
    });

    if (existing) {
      return null;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const superAdmin = this.userRepository.create({
      name: 'Super Admin',
      email: 'admin@pixpos.cloud',
      pin: hashedPassword,
      role: 'super_admin',
      storeId: null,
      isActive: true,
    });

    return this.userRepository.save(superAdmin);
  }
}
