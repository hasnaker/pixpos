import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { Category } from '../../entities/category.entity';
import { CreateProductDto, UpdateProductDto } from './dto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';

@Injectable()
export class ProductsService {
  private readonly s3Client: S3Client;
  private readonly S3_BUCKET = 'pixpos-assets-986906625644';
  private readonly S3_REGION = 'eu-central-1';
  private readonly CLOUDFRONT_DOMAIN = 'dh8ksnk9abt8f.cloudfront.net';

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {
    this.s3Client = new S3Client({ region: this.S3_REGION });
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['category'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findFeatured(): Promise<Product[]> {
    return this.productRepository.find({
      where: { isFeatured: true, isActive: true },
      relations: ['category'],
      order: { sortOrder: 'ASC' },
      take: 12,
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Verify category exists
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });
    if (!category) {
      throw new BadRequestException(`Category with ID ${createProductDto.categoryId} not found`);
    }

    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Verify category exists if updating categoryId
    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(`Category with ID ${updateProductDto.categoryId} not found`);
      }
    }

    // Update using query builder to ensure it works
    await this.productRepository.update(id, updateProductDto);
    
    // Return fresh product with relations
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async removeAll(): Promise<void> {
    // Transaction ile önce order_items'daki product referanslarını temizle
    await this.dataSource.transaction(async (manager) => {
      // order_items tablosundaki product_id'leri NULL yap
      await manager.query('UPDATE order_items SET product_id = NULL');
      // Sonra tüm ürünleri sil
      await manager.query('DELETE FROM products');
    });
  }

  async updateImage(id: string, imageUrl: string): Promise<Product> {
    const product = await this.findOne(id);
    product.imageUrl = imageUrl;
    return this.productRepository.save(product);
  }

  /**
   * Migrate all base64 images to S3 and update DB with CloudFront URLs
   */
  async migrateImagesToS3(): Promise<{ migrated: number; failed: number; errors: string[] }> {
    // Find products with base64 images
    const products = await this.productRepository
      .createQueryBuilder('product')
      .where("product.imageUrl LIKE 'data:image%'")
      .getMany();

    let migrated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const product of products) {
      try {
        const base64Data = product.imageUrl;
        if (!base64Data) continue;

        // Parse base64
        const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
          errors.push(`${product.name}: Invalid base64 format`);
          failed++;
          continue;
        }

        const [, imageType, base64Content] = matches;
        const buffer = Buffer.from(base64Content, 'base64');

        // Generate unique filename
        const hash = crypto.createHash('md5').update(product.id).digest('hex').slice(0, 8);
        const filename = `products/${hash}-${product.id}.${imageType}`;

        // Upload to S3
        await this.s3Client.send(new PutObjectCommand({
          Bucket: this.S3_BUCKET,
          Key: filename,
          Body: buffer,
          ContentType: `image/${imageType}`,
          CacheControl: 'max-age=31536000', // 1 year cache
        }));

        // Update DB with CloudFront URL
        const cdnUrl = `https://${this.CLOUDFRONT_DOMAIN}/${filename}`;
        await this.productRepository.update(product.id, { imageUrl: cdnUrl });

        migrated++;
      } catch (err) {
        errors.push(`${product.name}: ${err.message}`);
        failed++;
      }
    }

    return { migrated, failed, errors };
  }
}
