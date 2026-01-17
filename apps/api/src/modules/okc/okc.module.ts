import { Module } from '@nestjs/common';
import { OkcController } from './okc.controller';
import { OkcService } from './okc.service';
import { IngenicoService } from './ingenico.service';

@Module({
  controllers: [OkcController],
  providers: [OkcService, IngenicoService],
  exports: [OkcService, IngenicoService],
})
export class OkcModule {}
