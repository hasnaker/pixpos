import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './modules/categories';
import { ProductsModule } from './modules/products';
import { TablesModule } from './modules/tables';
import { OrdersModule } from './modules/orders';
import { KitchenModule } from './modules/kitchen';
import { PaymentsModule } from './modules/payments';
import { PrintersModule } from './modules/printers';
import { ReportsModule } from './modules/reports';
import { WebsocketModule } from './modules/websocket';
import { MenuModule } from './modules/menu';
import { MenusModule } from './modules/menus/menus.module';
import { AiModule } from './modules/ai';
import { ZonesModule } from './modules/zones';
import { UsersModule } from './modules/users';
import { OkcModule } from './modules/okc/okc.module';
import { SettingsModule } from './modules/settings';
import { StoresModule } from './modules/stores/stores.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { Store } from './entities/store.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'megapos'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false, // Production'da false - migration kullan
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? {
          rejectUnauthorized: false
        } : false,
      }),
    }),
    CategoriesModule,
    ProductsModule,
    TablesModule,
    OrdersModule,
    KitchenModule,
    PaymentsModule,
    PrintersModule,
    ReportsModule,
    WebsocketModule,
    MenuModule,
    MenusModule,
    AiModule,
    ZonesModule,
    UsersModule,
    OkcModule,
    SettingsModule,
    StoresModule,
    AuthModule,
    TypeOrmModule.forFeature([Store]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Tenant middleware disabled for now - single tenant mode
    // consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
