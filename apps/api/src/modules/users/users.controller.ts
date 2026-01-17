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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, LoginDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Tüm kullanıcıları listele
   * GET /api/users
   * GET /api/users?includeInactive=true
   * GET /api/users?role=waiter
   */
  @Get()
  findAll(
    @Query('includeInactive') includeInactive?: string,
    @Query('role') role?: string,
  ) {
    return this.usersService.findAll(includeInactive === 'true', role);
  }

  /**
   * PIN ile giriş yap
   * POST /api/users/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto.pin);
  }

  /**
   * Varsayılan kullanıcı oluştur (ilk kurulum)
   * POST /api/users/seed
   */
  @Post('seed')
  seed() {
    return this.usersService.seedDefaultUser();
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
   * Yeni kullanıcı oluştur
   * POST /api/users
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
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
   * Kullanıcı sil (soft delete)
   * DELETE /api/users/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
