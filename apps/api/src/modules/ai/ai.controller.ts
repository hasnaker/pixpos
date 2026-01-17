import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService, ExtractedProduct } from './ai.service';

interface ParseMenuDto {
  imageBase64: string;
  mimeType?: string;
}

interface SaveProductsDto {
  products: ExtractedProduct[];
  menuId?: string;
}

interface EnrichDescriptionDto {
  productName: string;
  category: string;
  currentDescription?: string;
}

interface RenderPdfDto {
  pdfBase64: string;
}

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  /**
   * PDF/Görsel'den menü parse et
   * POST /api/ai/parse-menu
   */
  @Post('parse-menu')
  async parseMenu(@Body() dto: ParseMenuDto) {
    if (!dto.imageBase64) {
      throw new HttpException('imageBase64 is required', HttpStatus.BAD_REQUEST);
    }

    this.logger.log('Received menu parse request');

    // Base64 prefix'i temizle (data:image/png;base64, gibi)
    let base64Data = dto.imageBase64;
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1];
    }

    // MIME type'ı belirle
    let mimeType = dto.mimeType || 'image/png';
    if (dto.imageBase64.startsWith('data:')) {
      const match = dto.imageBase64.match(/data:([^;]+);/);
      if (match) {
        mimeType = match[1];
      }
    }

    const result = await this.aiService.parseMenuFromImage(base64Data, mimeType);

    if (!result.success) {
      throw new HttpException(
        result.error || 'Menu parsing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result;
  }

  /**
   * Parse edilen ürünleri kaydet
   * POST /api/ai/save-products
   */
  @Post('save-products')
  async saveProducts(@Body() dto: SaveProductsDto) {
    if (!dto.products || !Array.isArray(dto.products)) {
      throw new HttpException('products array is required', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`Saving ${dto.products.length} extracted products${dto.menuId ? ` to menu ${dto.menuId}` : ''}`);

    const result = await this.aiService.saveExtractedProducts(dto.products, dto.menuId);

    return {
      success: true,
      message: `${result.saved} ürün ve ${result.categories} yeni kategori kaydedildi`,
      ...result,
    };
  }

  /**
   * Ürün açıklamasını AI ile zenginleştir
   * POST /api/ai/enrich-description
   */
  @Post('enrich-description')
  async enrichDescription(@Body() dto: EnrichDescriptionDto) {
    if (!dto.productName || !dto.category) {
      throw new HttpException('productName and category are required', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`Enriching description for: ${dto.productName}`);

    try {
      const description = await this.aiService.enrichProductDescription(
        dto.productName,
        dto.category,
        dto.currentDescription,
      );

      return {
        success: true,
        description,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Description enrichment failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * PDF dosyasını sayfa sayfa görüntülere çevir (server-side rendering)
   * POST /api/ai/render-pdf
   */
  @Post('render-pdf')
  async renderPdf(@Body() dto: RenderPdfDto) {
    if (!dto.pdfBase64) {
      throw new HttpException('pdfBase64 is required', HttpStatus.BAD_REQUEST);
    }

    this.logger.log('Received PDF render request');

    // Base64 prefix'i temizle
    let base64Data = dto.pdfBase64;
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1];
    }

    // Base64'ü Buffer'a çevir
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    const result = await this.aiService.renderPdfToImages(pdfBuffer);

    if (!result.success) {
      throw new HttpException(
        result.error || 'PDF rendering failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result;
  }

  /**
   * PDF dosyası yükle ve render et (multipart/form-data)
   * POST /api/ai/render-pdf-upload
   */
  @Post('render-pdf-upload')
  @UseInterceptors(FileInterceptor('file'))
  async renderPdfUpload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('PDF file is required', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`Received PDF upload: ${file.originalname}, size: ${file.size}`);

    const result = await this.aiService.renderPdfToImages(file.buffer);

    if (!result.success) {
      throw new HttpException(
        result.error || 'PDF rendering failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result;
  }
}
