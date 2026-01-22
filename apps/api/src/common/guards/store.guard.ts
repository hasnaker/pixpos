import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const REQUIRE_STORE_KEY = 'requireStore';
export const RequireStore = () => Reflect.metadata(REQUIRE_STORE_KEY, true);

@Injectable()
export class StoreGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireStore = this.reflector.getAllAndOverride<boolean>(REQUIRE_STORE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireStore) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    if (!request.storeId) {
      throw new ForbiddenException('Bu işlem için store gerekli');
    }

    return true;
  }
}
