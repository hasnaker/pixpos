import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Tüm kullanıcıları getir (store bazlı)
   */
  async findAll(storeId: string | null, includeInactive = false, role?: string): Promise<User[]> {
    const where: any = {
      storeId: storeId ?? IsNull(),
    };
    
    if (!includeInactive) {
      where.isActive = true;
    }
    
    if (role) {
      where.role = role;
    }
    
    return this.userRepository.find({
      where,
      order: { name: 'ASC' },
      select: ['id', 'name', 'role', 'isActive', 'lastLoginAt', 'avatarUrl', 'createdAt'],
    });
  }

  /**
   * ID ile kullanıcı getir
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'role', 'isActive', 'lastLoginAt', 'avatarUrl', 'createdAt', 'storeId'],
    });
    if (!user) {
      throw new NotFoundException(`Kullanıcı bulunamadı: ${id}`);
    }
    return user;
  }

  /**
   * PIN ile kullanıcı bul (login için) - store bazlı
   */
  async findByPin(pin: string, storeId: string | null): Promise<User | null> {
    const users = await this.userRepository.find({
      where: { isActive: true, storeId: storeId ?? IsNull() },
    });

    for (const user of users) {
      const isMatch = await bcrypt.compare(pin, user.pin);
      if (isMatch) {
        return user;
      }
    }
    return null;
  }

  /**
   * Yeni kullanıcı oluştur (store bazlı)
   */
  async create(storeId: string | null, createUserDto: CreateUserDto): Promise<User> {
    // PIN benzersiz mi kontrol et (aynı store içinde)
    const existingUser = await this.findByPin(createUserDto.pin, storeId);
    if (existingUser) {
      throw new ConflictException('Bu PIN zaten kullanılıyor');
    }

    // PIN'i hashle
    const hashedPin = await bcrypt.hash(createUserDto.pin, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      storeId,
      pin: hashedPin,
    });

    const saved = await this.userRepository.save(user);
    
    // PIN'i response'dan çıkar
    const { pin, ...result } = saved;
    return result as User;
  }

  /**
   * Kullanıcı güncelle
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Kullanıcı bulunamadı: ${id}`);
    }

    // PIN değişiyorsa hashle ve benzersizlik kontrol et
    if (updateUserDto.pin) {
      const existingUser = await this.findByPin(updateUserDto.pin, user.storeId);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Bu PIN zaten kullanılıyor');
      }
      updateUserDto.pin = await bcrypt.hash(updateUserDto.pin, 10);
    }

    Object.assign(user, updateUserDto);
    const saved = await this.userRepository.save(user);
    
    const { pin, ...result } = saved;
    return result as User;
  }

  /**
   * Kullanıcı sil (soft delete - isActive = false)
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.userRepository.save(user);
  }

  /**
   * Kullanıcı sil (hard delete)
   */
  async hardRemove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Kullanıcı bulunamadı: ${id}`);
    }
  }

  /**
   * PIN ile giriş yap (store bazlı)
   */
  async login(pin: string, storeId: string | null): Promise<User> {
    const user = await this.findByPin(pin, storeId);
    if (!user) {
      throw new UnauthorizedException('Geçersiz PIN');
    }

    // Son giriş zamanını güncelle
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const { pin: _, ...result } = user;
    return result as User;
  }

  /**
   * Varsayılan admin kullanıcısı oluştur (ilk kurulum için) - store bazlı
   */
  async seedDefaultUser(storeId: string | null): Promise<User | null> {
    const count = await this.userRepository.count({
      where: { storeId: storeId ?? IsNull() },
    });
    if (count > 0) {
      return null; // Zaten kullanıcı var
    }

    return this.create(storeId, {
      name: 'Yönetici',
      pin: '0000',
      role: 'admin',
    });
  }
}
