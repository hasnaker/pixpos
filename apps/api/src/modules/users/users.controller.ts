import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, LoginDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Tüm kullanıcıları listele (store bazlı)
   * GET /api/users
   * GET /api/users?includeInactive=true
   * GET /api/users?role=waiter
   */
  @Get()
  findAll(
    @Req() req: Request,
    @Query('includeInactive') includeInactive?: string,
    @Query('role') role?: string,
  ) {
    const storeId = (req as any).storeId || null;
    return this.usersService.findAll(storeId, includeInactive === 'true', role);
  }

  /**
   * PIN ile giriş yap (store bazlı)
   * POST /api/users/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Req() req: Request, @Body() loginDto: LoginDto) {
    const storeId = (req as any).storeId || null;
    return this.usersService.login(loginDto.pin, storeId);
  }

  /**
   * Varsayılan kullanıcı oluştur (ilk kurulum) - store bazlı
   * POST /api/users/seed
   */
  @Post('seed')
  seed(@Req() req: Request) {
    const storeId = (req as any).storeId || null;
    return this.usersService.seedDefaultUser(storeId);
  }

  /**
   * Kullanıcı detayı
   * GET /api/users/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Yeni kullanıcı oluştur (store bazlı)
   * POST /api/users
   */
  @Post()
  create(@Req() req: Request, @Body() createUserDto: CreateUserDto) {
    const storeId = (req as any).storeId || null;
    return this.usersService.create(storeId, createUserDto);
  }

  /**
   * Kullanıcı güncelle
   * PUT /api/users/:id
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Kullanıcı sil (hard delete - veritabanından tamamen sil)
   * DELETE /api/users/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.hardRemove(id);
  }
}
