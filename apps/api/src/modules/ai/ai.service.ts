import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { Product } from '../../entities/product.entity';
import { Category } from '../../entities/category.entity';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

export interface ExtractedProduct {
  name: string;
  price: number;
  category: string;
  description?: string;
  imageBase64?: string; // Frontend'de kullanıcı tarafından seçilecek
}

export interface MenuParseResult {
  success: boolean;
  products: ExtractedProduct[];
  pageCount: number;
  error?: string;
}

export interface PdfRenderResult {
  success: boolean;
  pages: { pageNum: number; imageBase64: string }[];
  pageCount: number;
  error?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private bedrockClient: BedrockRuntimeClient;

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {
    // AWS Bedrock client - Kiro önerisi: eu-central-1
    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'eu-central-1',
    });
  }

  /**
   * PDF veya görsel dosyasından menü bilgilerini çıkart (fotoğraf seçimi kullanıcıya bırakılıyor)
   */
  async parseMenuFromImage(imageBase64: string, mimeType: string = 'image/png'): Promise<MenuParseResult> {
    try {
      this.logger.log('Starting menu parsing with Claude 4.5 Sonnet Vision...');

      // Claude'a sadece ürün bilgileri için prompt (fotoğraf seçimi kullanıcıya bırakılıyor)
      const prompt = `Bu bir restoran/kafe menüsü görseli. Lütfen bu menüden tüm ürünleri çıkart.

Her ürün için şu bilgileri JSON formatında ver:
- name: Ürün adı (Türkçe)
- price: Fiyat (sadece sayı, TL/₺ olmadan)
- category: Kategori tahmini (Kahveler, Tatlılar, Yiyecekler, İçecekler, Atıştırmalıklar, Ana Yemekler, Salatalar, Çorbalar vb.)
- description: Varsa kısa açıklama

ÖNEMLİ KURALLAR:
1. Fiyat bulamazsan 0 yaz
2. Kategori tahmin et (menü yapısına göre)
3. SADECE JSON array döndür, başka bir şey yazma
4. Türkçe karakterleri doğru kullan

Örnek format:
[
  {"name": "Latte", "price": 45, "category": "Kahveler", "description": "Sütlü espresso"},
  {"name": "Cheesecake", "price": 65, "category": "Tatlılar", "description": "New York usulü"}
]`;

      // Claude 4.5 Sonnet - EU Cross-Region Inference Profile
      // eu. prefix ile inference profile kullanılıyor (on-demand desteklenmiyor)
      // EU inference profile: eu-central-1, eu-west-1, eu-west-3 arasında route eder
      const modelId = 'eu.anthropic.claude-sonnet-4-5-20250929-v1:0';
      
      const requestBody = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      };

      const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(requestBody),
      });

      const response = await this.bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      const content = responseBody.content?.[0]?.text || '[]';
      
      // JSON'u çıkart
      let jsonStr = content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      let products: ExtractedProduct[] = JSON.parse(jsonStr);
      
      this.logger.log(`Extracted ${products.length} products from menu`);

      return {
        success: true,
        products,
        pageCount: 1,
      };
    } catch (error) {
      this.logger.error('Menu parsing failed:', error);
      return {
        success: false,
        products: [],
        pageCount: 0,
        error: error.message,
      };
    }
  }

  /**
   * Ürün açıklamasını AI ile zenginleştir
   */
  async enrichProductDescription(productName: string, category: string, currentDescription?: string): Promise<string> {
    try {
      this.logger.log(`Enriching description for: ${productName}`);

      const prompt = `Sen bir restoran/kafe menü yazarısın. Aşağıdaki ürün için kısa, çekici ve iştah açıcı bir Türkçe açıklama yaz.

Ürün: ${productName}
Kategori: ${category}
${currentDescription ? `Mevcut açıklama: ${currentDescription}` : ''}

KURALLAR:
- Maksimum 15-20 kelime
- Müşterinin iştahını kabartacak, çekici bir dil kullan
- Malzemeleri veya hazırlanış şeklini vurgula
- Samimi ama profesyonel bir ton
- Sadece açıklamayı yaz, başka bir şey ekleme
- Tırnak işareti kullanma

Örnek açıklamalar:
- "Taze çekilmiş espresso üzerine kadifemsi süt köpüğü"
- "Ev yapımı karamel sos ile taçlandırılmış, çıtır waffle"
- "Izgara tavuk, avokado ve akdeniz yeşillikleri ile"`;

      const modelId = 'eu.anthropic.claude-sonnet-4-5-20250929-v1:0';
      
      const requestBody = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      };

      const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(requestBody),
      });

      const response = await this.bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      const description = responseBody.content?.[0]?.text?.trim() || '';
      
      this.logger.log(`Generated description: ${description}`);
      return description;
    } catch (error) {
      this.logger.error('Description enrichment failed:', error);
      throw error;
    }
  }

  /**
   * Çıkarılan ürünleri veritabanına kaydet
   * @param products - Kaydedilecek ürünler
   * @param menuId - Opsiyonel menü ID'si (kategoriler bu menüye bağlanır)
   */
  async saveExtractedProducts(products: ExtractedProduct[], menuId?: string): Promise<{ saved: number; categories: number }> {
    let savedCount = 0;
    const categoryCache = new Map<string, string>();

    // Mevcut kategorileri cache'e al
    const existingCategories = await this.categoryRepository.find();
    existingCategories.forEach(cat => {
      categoryCache.set(cat.name.toLowerCase(), cat.id);
    });

    for (const product of products) {
      try {
        // Kategori bul veya oluştur
        let categoryId = categoryCache.get(product.category.toLowerCase());
        
        if (!categoryId) {
          // Yeni kategori oluştur - menuId varsa ekle
          const newCategory = this.categoryRepository.create({ 
            name: product.category,
            menuId: menuId || null,
          });
          const saved = await this.categoryRepository.save(newCategory);
          categoryId = saved.id;
          categoryCache.set(product.category.toLowerCase(), categoryId);
        }

        // Ürünü kaydet
        const newProduct = this.productRepository.create({
          name: product.name,
          price: product.price,
          categoryId,
          description: product.description || null,
          imageUrl: product.imageBase64 || null,
        });

        await this.productRepository.save(newProduct);
        savedCount++;
      } catch (err) {
        this.logger.warn(`Failed to save product ${product.name}:`, err.message);
      }
    }

    return {
      saved: savedCount,
      categories: categoryCache.size - existingCategories.length,
    };
  }

  /**
   * PDF dosyasını sayfa sayfa görüntülere çevir (Ghostscript kullanarak - en güvenilir yöntem)
   */
  async renderPdfToImages(pdfBuffer: Buffer): Promise<PdfRenderResult> {
    try {
      this.logger.log('Starting PDF to images conversion with Ghostscript...');
      
      // Geçici dosya oluştur
      const tempDir = os.tmpdir();
      const timestamp = Date.now();
      const tempPdfPath = path.join(tempDir, `menu-${timestamp}.pdf`);
      const outputPattern = path.join(tempDir, `menu-${timestamp}-page-%d.png`);
      
      fs.writeFileSync(tempPdfPath, pdfBuffer);
      this.logger.log(`Temp PDF saved to: ${tempPdfPath}`);
      
      // Önce PDF'in kaç sayfa olduğunu öğren
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pageCount = pdfDoc.getPageCount();
      this.logger.log(`PDF has ${pageCount} pages`);
      
      // Ghostscript ile PDF'i PNG'lere çevir
      // -dNOPAUSE: Her sayfa sonrası duraklamayı kapat
      // -dBATCH: İşlem bitince çık
      // -sDEVICE=png16m: 24-bit RGB PNG
      // -r150: 150 DPI çözünürlük
      // -dTextAlphaBits=4 -dGraphicsAlphaBits=4: Anti-aliasing
      const gsCommand = `/opt/homebrew/bin/gs -dNOPAUSE -dBATCH -sDEVICE=png16m -r150 -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -sOutputFile="${outputPattern}" "${tempPdfPath}"`;
      
      this.logger.log(`Running Ghostscript: ${gsCommand}`);
      
      try {
        execSync(gsCommand, { stdio: 'pipe' });
        this.logger.log('Ghostscript conversion completed');
      } catch (gsError) {
        this.logger.error('Ghostscript error:', gsError.message);
        throw new Error(`Ghostscript failed: ${gsError.message}`);
      }
      
      const pages: { pageNum: number; imageBase64: string }[] = [];
      const errors: string[] = [];
      
      // Oluşturulan PNG dosyalarını oku
      for (let i = 1; i <= pageCount; i++) {
        const pagePath = path.join(tempDir, `menu-${timestamp}-page-${i}.png`);
        
        try {
          if (fs.existsSync(pagePath)) {
            const imageBuffer = fs.readFileSync(pagePath);
            const base64 = imageBuffer.toString('base64');
            
            pages.push({
              pageNum: i,
              imageBase64: `data:image/png;base64,${base64}`,
            });
            this.logger.log(`Read page ${i}/${pageCount} successfully (${Math.round(imageBuffer.length / 1024)}KB)`);
            
            // Dosyayı temizle
            fs.unlinkSync(pagePath);
          } else {
            const errMsg = `Page ${i}: Output file not found at ${pagePath}`;
            this.logger.warn(errMsg);
            errors.push(errMsg);
          }
        } catch (pageErr) {
          const errMsg = `Page ${i}: ${pageErr.message}`;
          this.logger.error(`Failed to read page ${i}:`, pageErr);
          errors.push(errMsg);
        }
      }
      
      // Geçici PDF'i temizle
      try {
        fs.unlinkSync(tempPdfPath);
      } catch (cleanupErr) {
        this.logger.warn('Cleanup failed:', cleanupErr.message);
      }
      
      // Hiç sayfa dönüştürülemediyse hata döndür
      if (pages.length === 0) {
        const errorMsg = errors.length > 0 
          ? `PDF dönüştürme başarısız: ${errors.join('; ')}`
          : 'PDF sayfaları dönüştürülemedi. Ghostscript kurulu olduğundan emin olun.';
        this.logger.error(errorMsg);
        return {
          success: false,
          pages: [],
          pageCount,
          error: errorMsg,
        };
      }
      
      this.logger.log(`Successfully converted ${pages.length}/${pageCount} pages`);
      
      return {
        success: true,
        pages,
        pageCount,
      };
    } catch (error) {
      this.logger.error('PDF rendering failed:', error);
      return {
        success: false,
        pages: [],
        pageCount: 0,
        error: error.message,
      };
    }
  }
}
