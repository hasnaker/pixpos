import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
   * Tüm kullanıcıları getir
   */
  async findAll(includeInactive = false): Promise<User[]> {
    const where = includeInactive ? {} : { isActive: true };
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
      select: ['id', 'name', 'role', 'isActive', 'lastLoginAt', 'avatarUrl', 'createdAt'],
    });
    if (!user) {
      throw new NotFoundException(`Kullanıcı bulunamadı: ${id}`);
    }
    return user;
  }

  /**
   * PIN ile kullanıcı bul (login için)
   */
  async findByPin(pin: string): Promise<User | null> {
    const users = await this.userRepository.find({
      where: { isActive: true },
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
   * Yeni kullanıcı oluştur
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // PIN benzersiz mi kontrol et
    const existingUser = await this.findByPin(createUserDto.pin);
    if (existingUser) {
      throw new ConflictException('Bu PIN zaten kullanılıyor');
    }

    // PIN'i hashle
    const hashedPin = await bcrypt.hash(createUserDto.pin, 10);

    const user = this.userRepository.create({
      ...createUserDto,
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
      const existingUser = await this.findByPin(updateUserDto.pin);
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
   * PIN ile giriş yap
   */
  async login(pin: string): Promise<User> {
    const user = await this.findByPin(pin);
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
   * Varsayılan admin kullanıcısı oluştur (ilk kurulum için)
   */
  async seedDefaultUser(): Promise<User | null> {
    const count = await this.userRepository.count();
    if (count > 0) {
      return null; // Zaten kullanıcı var
    }

    return this.create({
      name: 'Yönetici',
      pin: '0000',
      role: 'admin',
    });
  }
}
