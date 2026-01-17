# 📸 Fotoğraf ve Video Yönetim Sistemi

## Temel Prensip

**Amatör fotoğraftan profesyonel videoya kadar tam entegrasyon.**
QR menüde müşteri talebiyle video oynatılabilir.

---

## 📊 FOTOĞRAF/VİDEO SEVİYELERİ

### Seviye 1: Amatör Fotoğraf (Başlangıç)

```
┌─────────────────────────────────────────────────────────────────────┐
│  AMATÖR FOTOĞRAF                                                    │
│                                                                      │
│  Cihaz: Telefon kamerası                                            │
│  Kalite: 1080p (Full HD)                                            │
│  Format: JPEG                                                       │
│  Boyut: 2-5 MB                                                      │
│                                                                      │
│  Çekim:                                                             │
│  ├── İşletme sahibi çeker                                           │
│  ├── Doğal ışık                                                     │
│  ├── Basit kompozisyon                                              │
│  └── Hızlı upload                                                   │
│                                                                      │
│  İşleme:                                                            │
│  ├── Otomatik crop (1:1, 4:3, 16:9)                                │
│  ├── Otomatik renk düzeltme                                         │
│  ├── Otomatik arka plan temizleme (AI)                             │
│  └── Watermark ekleme (opsiyonel)                                   │
│                                                                      │
│  Maliyet: ₺0 (dahil)                                                │
└─────────────────────────────────────────────────────────────────────┘
```

### Seviye 2: Profesyonel Fotoğraf (HD)

```
┌─────────────────────────────────────────────────────────────────────┐
│  PROFESYONEL FOTOĞRAF (HD)                                          │
│                                                                      │
│  Cihaz: DSLR / Mirrorless kamera                                    │
│  Kalite: 4K (3840x2160)                                             │
│  Format: RAW → JPEG/WebP                                            │
│  Boyut: 10-20 MB (RAW), 3-5 MB (optimized)                         │
│                                                                      │
│  Çekim:                                                             │
│  ├── Profesyonel fotoğrafçı                                         │
│  ├── Stüdyo ışığı / Softbox                                         │
│  ├── Ürün styling                                                   │
│  └── Çoklu açı                                                      │
│                                                                      │
│  İşleme:                                                            │
│  ├── RAW processing (Lightroom/Capture One)                         │
│  ├── Renk grading                                                   │
│  ├── Retouching                                                     │
│  ├── Multiple format export                                         │
│  │   ├── WebP (web için)                                            │
│  │   ├── JPEG (genel)                                               │
│  │   └── AVIF (modern tarayıcılar)                                  │
│  └── Responsive sizes (thumbnail, medium, large)                    │
│                                                                      │
│  Maliyet: ₺50-150/ürün (fotoğrafçı ücreti)                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Seviye 3: Video (Temel)

```
┌─────────────────────────────────────────────────────────────────────┐
│  VİDEO (TEMEL)                                                      │
│                                                                      │
│  Cihaz: Telefon / Action camera                                     │
│  Kalite: 1080p 30fps                                                │
│  Format: MP4 (H.264)                                                │
│  Süre: 10-30 saniye                                                 │
│  Boyut: 20-50 MB                                                    │
│                                                                      │
│  Çekim:                                                             │
│  ├── Ürün hazırlık süreci                                           │
│  ├── Servis anı                                                     │
│  ├── Close-up çekimler                                              │
│  └── Basit kurgu                                                    │
│                                                                      │
│  İşleme:                                                            │
│  ├── Trim/cut                                                       │
│  ├── Renk düzeltme                                                  │
│  ├── Müzik ekleme                                                   │
│  ├── Text overlay                                                   │
│  └── Compression (web için)                                         │
│                                                                      │
│  Maliyet: ₺100-300/ürün                                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Seviye 4: Profesyonel Video

```
┌─────────────────────────────────────────────────────────────────────┐
│  PROFESYONEL VİDEO                                                  │
│                                                                      │
│  Cihaz: Cinema camera / DSLR                                        │
│  Kalite: 4K 60fps / 1080p 120fps (slow-motion)                     │
│  Format: MP4 (H.265/HEVC)                                           │
│  Süre: 30-60 saniye                                                 │
│  Boyut: 50-150 MB (raw), 10-30 MB (optimized)                      │
│                                                                      │
│  Çekim:                                                             │
│  ├── Profesyonel video ekibi                                        │
│  ├── Çoklu kamera açısı                                             │
│  ├── Gimbal/stabilizer                                              │
│  ├── Profesyonel ışık                                               │
│  └── Ses kaydı                                                      │
│                                                                      │
│  İşleme:                                                            │
│  ├── Professional editing (Premiere/Final Cut)                      │
│  ├── Color grading (DaVinci Resolve)                               │
│  ├── Motion graphics                                                │
│  ├── Sound design                                                   │
│  ├── Multiple format export                                         │
│  │   ├── 4K (showcase)                                              │
│  │   ├── 1080p (web)                                                │
│  │   └── 720p (mobile)                                              │
│  └── Adaptive bitrate streaming (HLS)                               │
│                                                                      │
│  Maliyet: ₺500-2,000/ürün                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ TEKNİK MİMARİ

### Medya Upload ve İşleme Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MEDYA İŞLEME PIPELINE                            │
│                                                                      │
│  1. UPLOAD                                                          │
│     ├── Boss Panel / Mobil App                                      │
│     ├── Drag & drop veya kamera                                     │
│     ├── Progress bar                                                │
│     └── S3 bucket (mega-pos-media)                                  │
│                                                                      │
│  2. PROCESSING (Otomatik)                                           │
│     ├── Lambda function tetiklenir                                  │
│     ├── AI ile ürün tespiti                                         │
│     ├── Arka plan temizleme (optional)                              │
│     ├── Renk düzeltme                                               │
│     └── Multiple size generation                                    │
│                                                                      │
│  3. OPTIMIZATION                                                    │
│     ├── Image: WebP, AVIF, JPEG                                     │
│     ├── Video: H.265, VP9, AV1                                      │
│     ├── Adaptive bitrate (HLS)                                      │
│     └── CDN distribution (CloudFront)                               │
│                                                                      │
│  4. STORAGE                                                         │
│     ├── S3 Standard (sık erişilen)                                  │
│     ├── S3 IA (eski medya)                                          │
│     └── Metadata: DynamoDB                                          │
└─────────────────────────────────────────────────────────────────────┘
```

### Kod Örneği

```typescript
// Medya upload servisi
class MediaService {
  async uploadProductMedia(
    productId: string,
    file: File,
    type: 'image' | 'video'
  ): Promise<Media> {
    // 1. S3'e upload
    const key = `products/${productId}/${Date.now()}-${file.name}`;
    await this.s3.upload({
      Bucket: 'mega-pos-media',
      Key: key,
      Body: file,
      ContentType: file.type
    });
    
    // 2. Processing job başlat
    const job = await this.startProcessingJob({
      key: key,
      type: type,
      productId: productId
    });
    
    // 3. Metadata kaydet
    const media = await this.saveMedia({
      id: generateId(),
      productId: productId,
      type: type,
      originalUrl: `https://cdn.megapos.io/${key}`,
      status: 'processing',
      jobId: job.id
    });
    
    return media;
  }
  
  async processImage(key: string): Promise<ProcessedMedia> {
    // Lambda function içinde çalışır
    
    // 1. S3'ten indir
    const image = await this.s3.getObject({ Bucket: 'mega-pos-media', Key: key });
    
    // 2. Sharp ile işle
    const sharp = require('sharp');
    const buffer = await image.Body.transformToByteArray();
    
    // 3. Multiple size oluştur
    const sizes = {
      thumbnail: await sharp(buffer).resize(150, 150).webp().toBuffer(),
      medium: await sharp(buffer).resize(600, 600).webp().toBuffer(),
      large: await sharp(buffer).resize(1200, 1200).webp().toBuffer()
    };
    
    // 4. AI ile arka plan temizle (Bedrock)
    const cleaned = await this.removeBackground(buffer);
    
    // 5. S3'e kaydet
    for (const [size, data] of Object.entries(sizes)) {
      await this.s3.upload({
        Bucket: 'mega-pos-media',
        Key: `${key}-${size}.webp`,
        Body: data,
        ContentType: 'image/webp'
      });
    }
    
    return {
      thumbnail: `https://cdn.megapos.io/${key}-thumbnail.webp`,
      medium: `https://cdn.megapos.io/${key}-medium.webp`,
      large: `https://cdn.megapos.io/${key}-large.webp`
    };
  }
  
  async processVideo(key: string): Promise<ProcessedMedia> {
    // FFmpeg ile işle
    const ffmpeg = require('fluent-ffmpeg');
    
    // 1. S3'ten indir
    const video = await this.downloadFromS3(key);
    
    // 2. Multiple quality oluştur
    const qualities = ['1080p', '720p', '480p'];
    
    for (const quality of qualities) {
      await new Promise((resolve, reject) => {
        ffmpeg(video)
          .output(`${key}-${quality}.mp4`)
          .videoCodec('libx265')
          .size(quality)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });
      
      // S3'e upload
      await this.uploadToS3(`${key}-${quality}.mp4`);
    }
    
    // 3. HLS streaming oluştur
    await this.createHLSStream(key);
    
    return {
      hls: `https://cdn.megapos.io/${key}/playlist.m3u8`,
      mp4_1080p: `https://cdn.megapos.io/${key}-1080p.mp4`,
      mp4_720p: `https://cdn.megapos.io/${key}-720p.mp4`
    };
  }
}
```

---

## 📱 QR MENÜ VİDEO ENTEGRASYONU

### Kullanıcı Deneyimi

```
┌───────────────────────┐
│  QR MENÜ (Mobil)      │
├───────────────────────┤
│                       │
│  ┌─────────────────┐  │
│  │  📷 Fotoğraf    │  │
│  │                 │  │
│  │  Belçika        │  │
│  │  Waffle         │  │
│  │                 │  │
│  │  [▶️ Video İzle]│  │ ← Müşteri tıklar
│  │                 │  │
│  │  ₺120    [+]    │  │
│  └─────────────────┘  │
│                       │
└───────────────────────┘

Video Modal:
┌───────────────────────┐
│  ✕                    │
│  ┌─────────────────┐  │
│  │                 │  │
│  │   🎬 VIDEO      │  │
│  │                 │  │
│  │   [▶️]          │  │
│  │                 │  │
│  │   00:15 / 00:30 │  │
│  └─────────────────┘  │
│                       │
│  Belçika Waffle       │
│  Taze hamur, çikolata │
│  sos, taze meyveler   │
│                       │
│  [Sepete Ekle]        │
└───────────────────────┘
```

### Video Player Özellikleri

```typescript
// Video player component
const ProductVideo = ({ videoUrl, poster }: Props) => {
  return (
    <video
      src={videoUrl}
      poster={poster}
      controls
      playsInline
      preload="metadata"
      style={{
        width: '100%',
        maxHeight: '400px',
        borderRadius: '8px'
      }}
    >
      <source src={videoUrl} type="video/mp4" />
      Your browser does not support video.
    </video>
  );
};

// Özellikler:
// • Otomatik kalite seçimi (network speed)
// • Thumbnail preview
// • Tam ekran desteği
// • Mobil optimize
// • Düşük data kullanımı
```

---

## 💰 MALİYET ANALİZİ

### Medya İşleme Maliyetleri

| Seviye | Çekim | İşleme | Storage (Yıllık) | Toplam/Ürün |
|--------|-------|--------|------------------|-------------|
| Amatör Foto | ₺0 | ₺0 | ₺0.50 | ₺0.50 |
| Pro Foto (HD) | ₺50-150 | ₺5 | ₺2 | ₺57-157 |
| Video (Temel) | ₺100-300 | ₺10 | ₺10 | ₺120-320 |
| Pro Video | ₺500-2,000 | ₺50 | ₺30 | ₺580-2,080 |

### AWS Maliyetleri (100 ürün, 1000 görüntüleme/gün)

| Servis | Kullanım | Maliyet/Ay |
|--------|----------|------------|
| S3 Storage | 50 GB | ₺3 |
| CloudFront | 100 GB transfer | ₺25 |
| Lambda (processing) | 1000 invocation | ₺1 |
| **TOPLAM** | | **₺29/ay** |

---

**Sonuç:** Amatör fotoğraftan profesyonel videoya kadar tüm seviyeleri destekliyoruz. QR menüde video oynatma entegre. AWS ile otomatik işleme ve CDN dağıtımı.
