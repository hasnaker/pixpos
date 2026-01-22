import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Upload, Download, X, Image, Search, FolderPlus, Camera, Sparkles, FileText, Loader2, Check, AlertCircle, ChevronLeft, ChevronRight, Crop, BookOpen, Star, ChevronDown, Printer } from 'lucide-react';
import { productsApi, categoriesApi, aiApi, menusApi, printersApi } from '@/services/api';
import type { Product, Category, ExtractedProduct, Menu, Printer as PrinterType } from '@/services/api';
import { cardStyle } from '../styles';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import * as XLSX from 'xlsx';

interface PdfPage {
  pageNum: number;
  imageBase64: string;
  selected: boolean;
  processed: boolean;
  products: ExtractedProduct[];
}

export default function MenuTab() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({ name: '', price: '', categoryId: '', description: '', imageUrl: '', menuId: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', menuId: '', printerId: '' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Import mapping states
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [importData, setImportData] = useState<{ headers: string[]; rows: string[][]; preview: any[] }>({ headers: [], rows: [], preview: [] });
  const [columnMapping, setColumnMapping] = useState<{ name: string; category: string; price: string; description: string; menu: string; imageUrl: string; sortOrder: string }>({ name: '', category: '', price: '', description: '', menu: '', imageUrl: '', sortOrder: '' });
  const [isImporting, setIsImporting] = useState(false);

  // AI Menu Parse states
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'uploading' | 'loading-pdf' | 'selecting' | 'analyzing' | 'done' | 'error'>('idle');
  const [aiProducts, setAiProducts] = useState<ExtractedProduct[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSaving, setAiSaving] = useState(false);
  
  // PDF Page states
  const [pdfPages, setPdfPages] = useState<PdfPage[]>([]);
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0);
  const [processingPage, setProcessingPage] = useState<number | null>(null);
  const [processedCount, setProcessedCount] = useState(0);

  // Image Crop states
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropProductIndex, setCropProductIndex] = useState<number | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const cropImageRef = useRef<HTMLImageElement>(null);
  const cropFileInputRef = useRef<HTMLInputElement>(null);

  // Description enrichment state
  const [enrichingIndex, setEnrichingIndex] = useState<number | null>(null);

  // Delete confirmation states
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Menu states
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [menuForm, setMenuForm] = useState({ name: '', description: '', isDefault: false });

  // Bulk transfer states
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showBulkTransferModal, setShowBulkTransferModal] = useState(false);
  const [bulkTargetMenuId, setBulkTargetMenuId] = useState<string>('');
  const [bulkTargetCategoryId, setBulkTargetCategoryId] = useState<string>('');
  const [isBulkTransferring, setIsBulkTransferring] = useState(false);

  // Inline category editing
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Queries
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: productsApi.getAll });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll });
  const { data: menus = [] } = useQuery({ queryKey: ['menus'], queryFn: menusApi.getAll });
  const { data: printers = [] } = useQuery({ queryKey: ['printers'], queryFn: printersApi.getAll });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); closeProductModal(); },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); closeProductModal(); },
  });

  const deleteProductMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const createCategoryMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); closeCategoryModal(); },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoriesApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); closeCategoryModal(); },
  });

  // Menu mutations
  const createMenuMutation = useMutation({
    mutationFn: menusApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['menus'] }); closeMenuModal(); },
  });

  const updateMenuMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => menusApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['menus'] }); closeMenuModal(); },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: menusApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menus'] }),
  });

  // Filter products - now also by menu
  const filteredCategories = categories.filter(c => !selectedMenu || c.menuId === selectedMenu);
  const filteredProducts = products.filter(p => {
    const category = categories.find(c => c.id === p.categoryId);
    const matchesMenu = !selectedMenu || category?.menuId === selectedMenu;
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMenu && matchesCategory && matchesSearch;
  });

  // Helpers
  const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || 'Kategorisiz';
  const getMenuName = (menuId: string | null | undefined) => menus.find(m => m.id === menuId)?.name || 'Menüsüz';

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm({ name: '', price: '', categoryId: '', description: '', imageUrl: '', menuId: '' });
    setImagePreview(null);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', menuId: '', printerId: '' });
  };

  const closeMenuModal = () => {
    setShowMenuModal(false);
    setEditingMenu(null);
    setMenuForm({ name: '', description: '', isDefault: false });
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    const category = categories.find(c => c.id === product.categoryId);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      categoryId: product.categoryId,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      menuId: category?.menuId || '',
    });
    setImagePreview(product.imageUrl || null);
    setShowProductModal(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, menuId: category.menuId || '', printerId: category.printerId || '' });
    setShowCategoryModal(true);
  };

  const openEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    setMenuForm({ name: menu.name, description: menu.description || '', isDefault: menu.isDefault });
    setShowMenuModal(true);
  };

  const handleProductSubmit = () => {
    const data = {
      name: productForm.name,
      price: parseFloat(productForm.price),
      categoryId: productForm.categoryId,
      description: productForm.description || undefined,
      imageUrl: productForm.imageUrl || undefined,
    };
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setProductForm({ ...productForm, imageUrl: base64 });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCategorySubmit = () => {
    const data = {
      name: categoryForm.name,
      menuId: categoryForm.menuId || undefined,
      printerId: categoryForm.printerId || undefined,
    };
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  // Inline category name edit
  const startEditingCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
  };

  const saveInlineCategoryName = async () => {
    if (!editingCategoryId || !editingCategoryName.trim()) {
      setEditingCategoryId(null);
      return;
    }
    try {
      await categoriesApi.update(editingCategoryId, { name: editingCategoryName.trim() });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      console.error('Kategori güncelleme hatası:', err);
    }
    setEditingCategoryId(null);
  };

  const handleMenuSubmit = () => {
    const data = {
      name: menuForm.name,
      description: menuForm.description || undefined,
      isDefault: menuForm.isDefault,
    };
    if (editingMenu) {
      updateMenuMutation.mutate({ id: editingMenu.id, data });
    } else {
      createMenuMutation.mutate(data);
    }
  };

  // Bulk transfer functions
  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const selectAllFilteredProducts = () => {
    const newSelected = new Set(selectedProducts);
    filteredProducts.forEach(p => newSelected.add(p.id));
    setSelectedProducts(newSelected);
  };

  const clearSelection = () => {
    setSelectedProducts(new Set());
  };

  const openBulkTransferModal = () => {
    if (selectedProducts.size === 0) return;
    setBulkTargetMenuId('');
    setBulkTargetCategoryId('');
    setShowBulkTransferModal(true);
  };

  const closeBulkTransferModal = () => {
    setShowBulkTransferModal(false);
    setBulkTargetMenuId('');
    setBulkTargetCategoryId('');
  };

  const handleBulkTransfer = async () => {
    if (!bulkTargetCategoryId || selectedProducts.size === 0) return;
    
    setIsBulkTransferring(true);
    try {
      const promises = Array.from(selectedProducts).map(productId =>
        productsApi.update(productId, { categoryId: bulkTargetCategoryId })
      );
      await Promise.all(promises);
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeBulkTransferModal();
      setSelectedProducts(new Set());
      setBulkMode(false);
    } catch (err) {
      alert('Toplu taşıma hatası: ' + (err as Error).message);
    } finally {
      setIsBulkTransferring(false);
    }
  };

  // Excel Import - Smart Column Detection
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          alert('Dosyada yeterli veri yok');
          return;
        }
        
        // CSV parsing - virgül ve tırnak içindeki virgülleri doğru işle
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };
        
        const headers = parseCSVLine(lines[0]);
        const rows = lines.slice(1).map(line => parseCSVLine(line));
        const preview = rows.slice(0, 3); // İlk 3 satır önizleme
        
        // Akıllı kolon eşleştirme - otomatik tahmin
        const autoMapping = { name: '', category: '', price: '', description: '', menu: '', imageUrl: '', sortOrder: '' };
        const lowerHeaders = headers.map(h => h.toLowerCase());
        
        // Ürün adı tahminleri
        const nameKeywords = ['ürün', 'urun', 'name', 'isim', 'ad', 'product', 'item', 'ürün adı', 'ürün ismi', 'malzeme'];
        for (const kw of nameKeywords) {
          const idx = lowerHeaders.findIndex(h => h.includes(kw));
          if (idx !== -1) { autoMapping.name = headers[idx]; break; }
        }
        
        // Kategori tahminleri
        const catKeywords = ['kategori', 'category', 'grup', 'group', 'tür', 'type', 'bölüm'];
        for (const kw of catKeywords) {
          const idx = lowerHeaders.findIndex(h => h.includes(kw));
          if (idx !== -1) { autoMapping.category = headers[idx]; break; }
        }
        
        // Fiyat tahminleri
        const priceKeywords = ['fiyat', 'price', 'tutar', 'ücret', 'bedel', 'satış', 'birim fiyat'];
        for (const kw of priceKeywords) {
          const idx = lowerHeaders.findIndex(h => h.includes(kw));
          if (idx !== -1) { autoMapping.price = headers[idx]; break; }
        }
        
        // Açıklama tahminleri
        const descKeywords = ['açıklama', 'aciklama', 'description', 'not', 'detay', 'bilgi', 'içerik'];
        for (const kw of descKeywords) {
          const idx = lowerHeaders.findIndex(h => h.includes(kw));
          if (idx !== -1) { autoMapping.description = headers[idx]; break; }
        }
        
        // Menü tahminleri
        const menuKeywords = ['menü', 'menu', 'liste'];
        for (const kw of menuKeywords) {
          const idx = lowerHeaders.findIndex(h => h.includes(kw));
          if (idx !== -1) { autoMapping.menu = headers[idx]; break; }
        }
        
        // Resim URL tahminleri
        const imageKeywords = ['resim', 'image', 'foto', 'görsel', 'url', 'link'];
        for (const kw of imageKeywords) {
          const idx = lowerHeaders.findIndex(h => h.includes(kw));
          if (idx !== -1) { autoMapping.imageUrl = headers[idx]; break; }
        }
        
        // Sıralama tahminleri
        const sortKeywords = ['sıra', 'sıralama', 'sort', 'order'];
        for (const kw of sortKeywords) {
          const idx = lowerHeaders.findIndex(h => h.includes(kw));
          if (idx !== -1) { autoMapping.sortOrder = headers[idx]; break; }
        }
        
        setImportData({ headers, rows, preview });
        setColumnMapping(autoMapping);
        setShowMappingModal(true);
      } catch (err) {
        alert('Dosya okuma hatası: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Execute import with mapping - Tam kapsamlı (Menü, Resim URL, Sıralama dahil)
  const executeImport = async () => {
    if (!columnMapping.name || !columnMapping.price) {
      alert('Ürün adı ve fiyat kolonları zorunludur');
      return;
    }
    
    setIsImporting(true);
    try {
      const { headers, rows } = importData;
      const nameIdx = headers.indexOf(columnMapping.name);
      const catIdx = columnMapping.category ? headers.indexOf(columnMapping.category) : -1;
      const priceIdx = headers.indexOf(columnMapping.price);
      const descIdx = columnMapping.description ? headers.indexOf(columnMapping.description) : -1;
      const menuIdx = columnMapping.menu ? headers.indexOf(columnMapping.menu) : -1;
      const imageIdx = columnMapping.imageUrl ? headers.indexOf(columnMapping.imageUrl) : -1;
      const sortIdx = columnMapping.sortOrder ? headers.indexOf(columnMapping.sortOrder) : -1;
      
      // Menü cache'i - aynı menüyü tekrar oluşturmamak için
      const menuCache = new Map<string, string>();
      // Kategori cache'i - menü+kategori kombinasyonu için
      const categoryCache = new Map<string, string>();
      
      let imported = 0;
      let createdMenus = 0;
      let createdCategories = 0;
      
      for (const row of rows) {
        const name = row[nameIdx]?.trim();
        const priceStr = row[priceIdx]?.replace(/[^\d.,]/g, '').replace(',', '.');
        const price = parseFloat(priceStr) || 0;
        
        if (!name || price <= 0) continue;
        
        // Menü bul veya oluştur
        let menuId: string | undefined = undefined;
        const menuName = menuIdx !== -1 ? row[menuIdx]?.trim() : '';
        
        if (menuName) {
          if (menuCache.has(menuName)) {
            menuId = menuCache.get(menuName);
          } else {
            // Mevcut menülerde ara
            let existingMenu = menus.find(m => m.name.toLowerCase() === menuName.toLowerCase());
            if (!existingMenu) {
              // Yeni menü oluştur
              const newMenu = await menusApi.create({ name: menuName });
              menuId = newMenu.id;
              createdMenus++;
              queryClient.invalidateQueries({ queryKey: ['menus'] });
            } else {
              menuId = existingMenu.id;
            }
            menuCache.set(menuName, menuId!);
          }
        }
        
        // Kategori bul veya oluştur
        let categoryId = '';
        const catName = catIdx !== -1 ? row[catIdx]?.trim() : '';
        const cacheKey = `${menuId || 'default'}_${catName.toLowerCase()}`;
        
        if (catName) {
          if (categoryCache.has(cacheKey)) {
            categoryId = categoryCache.get(cacheKey)!;
          } else {
            // Mevcut kategorilerde ara (aynı menüde)
            let cat = categories.find(c => 
              c.name.toLowerCase() === catName.toLowerCase() && 
              (menuId ? c.menuId === menuId : !c.menuId)
            );
            if (!cat) {
              // Yeni kategori oluştur
              const newCat = await categoriesApi.create({ name: catName, menuId });
              categoryId = newCat.id;
              createdCategories++;
              queryClient.invalidateQueries({ queryKey: ['categories'] });
            } else {
              categoryId = cat.id;
            }
            categoryCache.set(cacheKey, categoryId);
          }
        } else if (categories.length > 0) {
          categoryId = categories[0].id;
        } else {
          // Varsayılan kategori oluştur
          const newCat = await categoriesApi.create({ name: 'Genel', menuId });
          categoryId = newCat.id;
          createdCategories++;
          queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
        
        const description = descIdx !== -1 ? row[descIdx]?.trim() || '' : '';
        const imageUrl = imageIdx !== -1 ? row[imageIdx]?.trim() || '' : '';
        const sortOrder = sortIdx !== -1 ? parseInt(row[sortIdx]) || 0 : 0;
        
        await productsApi.create({ 
          name, 
          price, 
          categoryId, 
          description: description || undefined,
          imageUrl: imageUrl || undefined,
          sortOrder
        });
        imported++;
      }
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      setShowMappingModal(false);
      
      let message = `${imported} ürün başarıyla içe aktarıldı!`;
      if (createdMenus > 0) message += `\n${createdMenus} yeni menü oluşturuldu.`;
      if (createdCategories > 0) message += `\n${createdCategories} yeni kategori oluşturuldu.`;
      alert(message);
    } catch (err) {
      alert('İçe aktarma hatası: ' + (err as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  // Export dropdown state
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Excel/CSV Export - Tam kapsamlı (Menü, Kategori, Ürün, Resim URL dahil)
  const handleExport = (format: 'xlsx' | 'csv') => {
    setShowExportMenu(false);
    
    // Base64 resimleri kısalt (Excel 32767 karakter limiti var)
    const truncateImageUrl = (url: string | undefined): string => {
      if (!url) return '';
      // Base64 ise ve çok uzunsa, sadece başlangıcını göster + uyarı
      if (url.startsWith('data:image') && url.length > 500) {
        return '[BASE64_IMAGE - Çok uzun, dışa aktarılamadı]';
      }
      // Normal URL ise aynen döndür
      return url;
    };
    
    // Veriyi hazırla
    const data = products.map(p => {
      const category = categories.find(c => c.id === p.categoryId);
      const menuName = category ? getMenuName(category.menuId) : 'Menüsüz';
      const categoryName = category?.name || 'Kategorisiz';
      
      return {
        'Menü': menuName,
        'Kategori': categoryName,
        'Ürün': p.name,
        'Fiyat': p.price,
        'Açıklama': p.description || '',
        'Resim URL': truncateImageUrl(p.imageUrl),
        'Sıralama': p.sortOrder || 0
      };
    });

    const fileName = `menu_${new Date().toISOString().split('T')[0]}`;

    if (format === 'xlsx') {
      // Excel formatı
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Menü');
      
      // Kolon genişliklerini ayarla
      ws['!cols'] = [
        { wch: 15 }, // Menü
        { wch: 20 }, // Kategori
        { wch: 30 }, // Ürün
        { wch: 10 }, // Fiyat
        { wch: 50 }, // Açıklama
        { wch: 50 }, // Resim URL
        { wch: 10 }, // Sıralama
      ];
      
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    } else {
      // CSV formatı
      const escapeCSV = (str: string | number | undefined | null): string => {
        if (str === undefined || str === null) return '';
        const s = String(str);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };

      const headers = ['Menü,Kategori,Ürün,Fiyat,Açıklama,Resim URL,Sıralama'];
      const rows = data.map(row => 
        [
          escapeCSV(row['Menü']),
          escapeCSV(row['Kategori']),
          escapeCSV(row['Ürün']),
          row['Fiyat'],
          escapeCSV(row['Açıklama']),
          escapeCSV(row['Resim URL']),
          row['Sıralama']
        ].join(',')
      );
      
      const csv = [...headers, ...rows].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // PDF'i sayfalara ayır - Server-side rendering (ImageMagick)
  const convertPdfToImages = async (file: File): Promise<PdfPage[]> => {
    // Dosyayı base64'e çevir
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Server-side rendering API'yi çağır
    const result = await aiApi.renderPdf(base64);
    
    if (!result.success || result.pages.length === 0) {
      throw new Error('PDF render edilemedi');
    }

    // API sonucunu PdfPage formatına çevir
    const pages: PdfPage[] = result.pages.map(p => ({
      pageNum: p.pageNum,
      imageBase64: p.imageBase64,
      selected: p.pageNum <= 5, // İlk 5 sayfa varsayılan seçili
      processed: false,
      products: [],
    }));
    
    return pages;
  };

  // Seçili sayfaları işle
  const processSelectedPages = async () => {
    const selectedPages = pdfPages.filter(p => p.selected && !p.processed);
    if (selectedPages.length === 0) {
      setAiError('Lütfen işlenecek sayfa seçin');
      return;
    }
    
    setAiStatus('analyzing');
    setProcessedCount(0);
    const allProducts: ExtractedProduct[] = [...aiProducts];
    
    for (let i = 0; i < selectedPages.length; i++) {
      const page = selectedPages[i];
      setProcessingPage(page.pageNum);
      
      try {
        const result = await aiApi.parseMenu(page.imageBase64);
        
        if (result.success && result.products.length > 0) {
          // Sayfa numarasını ürün açıklamasına ekle
          const productsWithPage = result.products.map(p => ({
            ...p,
            description: p.description ? `${p.description} (Sayfa ${page.pageNum})` : `Sayfa ${page.pageNum}`,
          }));
          allProducts.push(...productsWithPage);
          
          // Sayfayı işlenmiş olarak işaretle
          setPdfPages(prev => prev.map(p => 
            p.pageNum === page.pageNum 
              ? { ...p, processed: true, products: productsWithPage }
              : p
          ));
        }
        
        setProcessedCount(i + 1);
      } catch (err) {
        console.error(`Sayfa ${page.pageNum} işlenemedi:`, err);
      }
    }
    
    setProcessingPage(null);
    setAiProducts(allProducts);
    setAiStatus('done');
  };

  // AI Menu Parse - PDF/Image
  const handleAiMenuParse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`Dosya çok büyük! Maksimum 50MB. Dosyanız: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      e.target.value = '';
      return;
    }

    setShowAiModal(true);
    setAiError(null);
    setAiProducts([]);
    setPdfPages([]);
    setProcessedCount(0);

    // PDF mi kontrol et
    if (file.type === 'application/pdf') {
      setAiStatus('loading-pdf');
      
      try {
        const pages = await convertPdfToImages(file);
        setPdfPages(pages);
        setCurrentPreviewPage(0);
        setAiStatus('selecting');
      } catch (err) {
        setAiError('PDF yüklenemedi: ' + (err as Error).message);
        setAiStatus('error');
      }
    } else {
      // Tek görsel - direkt işle
      setAiStatus('uploading');
      
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const base64 = event.target?.result as string;
            setAiStatus('analyzing');

            const result = await aiApi.parseMenu(base64);

            if (result.success && result.products.length > 0) {
              setAiProducts(result.products);
              setAiStatus('done');
            } else {
              setAiError(result.error || 'Menüde ürün bulunamadı');
              setAiStatus('error');
            }
          } catch (err) {
            const errorMsg = (err as Error).message;
            if (errorMsg.includes('413') || errorMsg.includes('too large')) {
              setAiError('Dosya çok büyük! Lütfen daha küçük bir dosya yükleyin.');
            } else {
              setAiError(errorMsg);
            }
            setAiStatus('error');
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setAiError((err as Error).message);
        setAiStatus('error');
      }
    }
    e.target.value = '';
  };

  // Sayfa seçimini toggle et
  const togglePageSelection = (pageNum: number) => {
    setPdfPages(prev => prev.map(p => 
      p.pageNum === pageNum ? { ...p, selected: !p.selected } : p
    ));
  };

  // Tüm sayfaları seç/kaldır
  const toggleAllPages = (selected: boolean) => {
    setPdfPages(prev => prev.map(p => ({ ...p, selected })));
  };

  // AI ürünlerini kaydet
  const handleSaveAiProducts = async () => {
    if (aiProducts.length === 0) return;
    
    setAiSaving(true);
    try {
      // Seçili menü varsa menuId'yi gönder
      const result = await aiApi.saveProducts(aiProducts, selectedMenu || undefined);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowAiModal(false);
      alert(`${result.saved} ürün ve ${result.categories} yeni kategori kaydedildi!`);
    } catch (err) {
      alert('Kaydetme hatası: ' + (err as Error).message);
    } finally {
      setAiSaving(false);
    }
  };

  // AI ürün düzenleme
  const updateAiProduct = (index: number, field: keyof ExtractedProduct, value: string | number) => {
    const updated = [...aiProducts];
    updated[index] = { ...updated[index], [field]: value };
    setAiProducts(updated);
  };

  // AI ürün silme
  const removeAiProduct = (index: number) => {
    setAiProducts(aiProducts.filter((_, i) => i !== index));
  };

  // Crop modal aç - PDF sayfasını otomatik yükle
  const openCropModal = (productIndex: number) => {
    setCropProductIndex(productIndex);
    setCrop(undefined);
    setCompletedCrop(undefined);
    
    // Ürünün açıklamasından sayfa numarasını bul
    const product = aiProducts[productIndex];
    const pageMatch = product.description?.match(/Sayfa (\d+)/);
    const pageNum = pageMatch ? parseInt(pageMatch[1]) : null;
    
    // İlgili PDF sayfasını otomatik yükle
    if (pageNum && pdfPages.length > 0) {
      const page = pdfPages.find(p => p.pageNum === pageNum);
      if (page) {
        setCropImageSrc(page.imageBase64);
      } else if (pdfPages.length > 0) {
        // Sayfa bulunamazsa ilk sayfayı göster
        setCropImageSrc(pdfPages[0].imageBase64);
      } else {
        setCropImageSrc(null);
      }
    } else if (pdfPages.length > 0) {
      // Sayfa bilgisi yoksa ilk sayfayı göster
      setCropImageSrc(pdfPages[0].imageBase64);
    } else {
      setCropImageSrc(null);
    }
    
    setShowCropModal(true);
  };

  // Crop için görsel yükle
  const handleCropImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setCropImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Görsel yüklendiğinde varsayılan crop ayarla
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const cropSize = Math.min(width, height) * 0.8;
    const newCrop = centerCrop(
      makeAspectCrop({ unit: 'px', width: cropSize }, 1, width, height),
      width,
      height
    );
    setCrop(newCrop);
  }, []);

  // Crop tamamlandığında base64'e çevir
  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !cropImageRef.current || cropProductIndex === null) return;
    
    const image = cropImageRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    
    // Ürüne fotoğrafı ekle
    const updated = [...aiProducts];
    updated[cropProductIndex] = { ...updated[cropProductIndex], imageBase64: base64 };
    setAiProducts(updated);
    
    // Modal kapat
    setShowCropModal(false);
    setCropImageSrc(null);
    setCropProductIndex(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [completedCrop, cropProductIndex, aiProducts]);

  // PDF sayfasından crop için görsel seç
  const selectPageForCrop = (pageIndex: number) => {
    if (pdfPages[pageIndex]) {
      setCropImageSrc(pdfPages[pageIndex].imageBase64);
    }
  };

  // Ürün açıklamasını AI ile zenginleştir
  const handleEnrichDescription = async (productIndex: number) => {
    const product = aiProducts[productIndex];
    if (!product) return;

    setEnrichingIndex(productIndex);
    try {
      // Sayfa bilgisini açıklamadan çıkar (varsa)
      const pageMatch = product.description?.match(/\(Sayfa \d+\)/);
      const pageInfo = pageMatch ? pageMatch[0] : '';
      const cleanDescription = product.description?.replace(/\s*\(Sayfa \d+\)/, '').trim();

      const result = await aiApi.enrichDescription(
        product.name,
        product.category,
        cleanDescription || undefined
      );

      if (result.success && result.description) {
        // Yeni açıklamayı sayfa bilgisiyle birleştir
        const newDescription = pageInfo ? `${result.description} ${pageInfo}` : result.description;
        updateAiProduct(productIndex, 'description', newDescription);
      }
    } catch (err) {
      console.error('Açıklama zenginleştirme hatası:', err);
    } finally {
      setEnrichingIndex(null);
    }
  };

  // Kategori ve içindeki ürünleri sil
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    setIsDeleting(true);
    try {
      // Önce kategorideki tüm ürünleri sil
      const categoryProducts = products.filter(p => p.categoryId === categoryToDelete.id);
      for (const product of categoryProducts) {
        try {
          await productsApi.delete(product.id);
        } catch (e) {
          // Ürün zaten silinmiş olabilir, devam et
        }
      }
      
      // Sonra kategoriyi sil
      try {
        await categoriesApi.delete(categoryToDelete.id);
      } catch (e) {
        // Kategori zaten silinmiş olabilir
      }
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      setShowDeleteCategoryModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error('Kategori silme hatası:', err);
      alert('Kategori silinirken hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  // Tüm menüyü sil (tüm ürünler ve kategoriler)
  const handleDeleteAllMenu = async () => {
    setIsDeleting(true);
    try {
      // Önce tüm ürünleri toplu sil
      await productsApi.deleteAll();
      
      // Sonra tüm kategorileri toplu sil
      await categoriesApi.deleteAll();
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      setShowDeleteAllModal(false);
    } catch (err) {
      console.error('Menü silme hatası:', err);
      alert('Menü silinirken hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  // Download Template - Real Excel format
  const handleDownloadTemplate = () => {
    // Create Excel XML format (works without external libraries)
    const excelContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Size="12"/>
      <Interior ss:Color="#0A84FF" ss:Pattern="Solid"/>
      <Font ss:Color="#FFFFFF"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Menü Şablonu">
    <Table>
      <Column ss:Width="150"/>
      <Column ss:Width="120"/>
      <Column ss:Width="80"/>
      <Column ss:Width="200"/>
      <Row>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Ürün</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Kategori</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Fiyat</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Açıklama</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Latte</Data></Cell>
        <Cell><Data ss:Type="String">Kahveler</Data></Cell>
        <Cell><Data ss:Type="Number">45</Data></Cell>
        <Cell><Data ss:Type="String">Sütlü espresso</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Cappuccino</Data></Cell>
        <Cell><Data ss:Type="String">Kahveler</Data></Cell>
        <Cell><Data ss:Type="Number">50</Data></Cell>
        <Cell><Data ss:Type="String">Köpüklü kahve</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Cheesecake</Data></Cell>
        <Cell><Data ss:Type="String">Tatlılar</Data></Cell>
        <Cell><Data ss:Type="Number">65</Data></Cell>
        <Cell><Data ss:Type="String">New York usulü</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Brownie</Data></Cell>
        <Cell><Data ss:Type="String">Tatlılar</Data></Cell>
        <Cell><Data ss:Type="Number">55</Data></Cell>
        <Cell><Data ss:Type="String">Çikolatalı</Data></Cell>
      </Row>
    </Table>
  </Worksheet>
</Workbook>`;
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu-sablonu.xls';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatPrice = (n: number | string) => `₺${Number(n).toFixed(2)}`;

  return (
    <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 200px)', minHeight: '600px' }}>
      {/* Left Sidebar - Menu Types & Categories */}
      <div style={{ 
        width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px',
        background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '16px',
        border: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto',
      }}>
        {/* Menu Types */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Menü Tipleri
            </span>
            <button onClick={() => setShowMenuModal(true)} style={{
              padding: '4px 8px', borderRadius: '6px', background: 'rgba(10,132,255,0.1)',
              border: 'none', color: '#0A84FF', fontSize: '11px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <Plus size={12} /> Ekle
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => { setSelectedMenu(null); setSelectedCategory(null); }}
              style={{
                padding: '10px 12px', borderRadius: '8px', textAlign: 'left',
                background: !selectedMenu ? 'rgba(10,132,255,0.15)' : 'transparent',
                border: 'none', color: !selectedMenu ? '#0A84FF' : 'rgba(255,255,255,0.7)',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <span>Tüm Menüler</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                {products.length}
              </span>
            </button>
            {menus.map(menu => (
              <div key={menu.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => { setSelectedMenu(menu.id); setSelectedCategory(null); }}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px', textAlign: 'left',
                    background: selectedMenu === menu.id ? 'rgba(10,132,255,0.15)' : 'transparent',
                    border: 'none', color: selectedMenu === menu.id ? '#0A84FF' : 'rgba(255,255,255,0.7)',
                    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {menu.isDefault && <Star size={12} style={{ color: '#FF9F0A' }} />}
                    {menu.name}
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    {products.filter(p => categories.find(c => c.id === p.categoryId)?.menuId === menu.id).length}
                  </span>
                </button>
                {selectedMenu === menu.id && (
                  <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '2px' }}>
                    <button onClick={(e) => { e.stopPropagation(); openEditMenu(menu); }} style={{
                      padding: '4px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                    }}>
                      <Pencil size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

        {/* Categories */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Kategoriler
            </span>
            <button onClick={() => setShowCategoryModal(true)} style={{
              padding: '4px 8px', borderRadius: '6px', background: 'rgba(48,209,88,0.1)',
              border: 'none', color: '#30D158', fontSize: '11px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <Plus size={12} /> Ekle
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '10px 12px', borderRadius: '8px', textAlign: 'left',
                background: !selectedCategory ? 'rgba(48,209,88,0.15)' : 'transparent',
                border: 'none', color: !selectedCategory ? '#30D158' : 'rgba(255,255,255,0.7)',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <span>Tüm Kategoriler</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                {filteredCategories.length}
              </span>
            </button>
            {filteredCategories.map(cat => (
              <div key={cat.id} style={{ position: 'relative' }}>
                {editingCategoryId === cat.id ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 8px',
                    background: 'rgba(48,209,88,0.15)', borderRadius: '8px',
                  }}>
                    <input
                      type="text"
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveInlineCategoryName();
                        if (e.key === 'Escape') setEditingCategoryId(null);
                      }}
                      onBlur={saveInlineCategoryName}
                      autoFocus
                      style={{
                        flex: 1, padding: '4px 8px', borderRadius: '4px',
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(48,209,88,0.4)',
                        color: '#fff', fontSize: '13px', outline: 'none', minWidth: 0,
                      }}
                    />
                    <button onClick={saveInlineCategoryName} style={{
                      padding: '4px', background: 'rgba(48,209,88,0.2)', border: 'none',
                      borderRadius: '4px', color: '#30D158', cursor: 'pointer',
                    }}>
                      <Check size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    onDoubleClick={() => startEditingCategory(cat)}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px', textAlign: 'left',
                      background: selectedCategory === cat.id ? 'rgba(48,209,88,0.15)' : 'transparent',
                      border: 'none', color: selectedCategory === cat.id ? '#30D158' : 'rgba(255,255,255,0.7)',
                      fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{cat.name}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {products.filter(p => p.categoryId === cat.id).length}
                    </span>
                  </button>
                )}
                {selectedCategory === cat.id && editingCategoryId !== cat.id && (
                  <div style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '2px' }}>
                    <button onClick={(e) => { e.stopPropagation(); startEditingCategory(cat); }} style={{
                      padding: '4px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                    }} title="Düzenle (veya çift tıkla)">
                      <Pencil size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setCategoryToDelete(cat); setShowDeleteCategoryModal(true); }} style={{
                      padding: '4px', background: 'transparent', border: 'none', color: '#FF453A', cursor: 'pointer',
                    }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Products */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{
            flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <Search size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: '14px',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Import/Export Buttons */}
          <input type="file" ref={fileInputRef} accept=".csv,.xlsx,.xls" onChange={handleExcelImport} style={{ display: 'none' }} />
          <input type="file" ref={pdfInputRef} accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={handleAiMenuParse} style={{ display: 'none' }} />
          
          <button onClick={() => pdfInputRef.current?.click()} style={{
            padding: '10px 14px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(48,209,88,0.1), rgba(10,132,255,0.1))',
            border: '1px solid rgba(48,209,88,0.2)', color: '#30D158',
            fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <FileText size={14} /> PDF/Görsel
            <span style={{ fontSize: '9px', padding: '2px 4px', borderRadius: '3px', background: 'linear-gradient(135deg, #30D158, #0A84FF)', color: '#fff', fontWeight: 700 }}>AI</span>
          </button>
          
          {/* Export Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)} 
              style={{
                padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)',
                fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <Download size={14} /> Dışa Aktar
              <ChevronDown size={12} style={{ transform: showExportMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            </button>
            
            {showExportMenu && (
              <>
              {/* Click outside overlay */}
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 99 }} 
                onClick={() => setShowExportMenu(false)} 
              />
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                background: 'rgba(28,28,30,0.98)', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)', padding: '6px',
                minWidth: '160px', zIndex: 100,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}>
                <button
                  onClick={() => handleExport('xlsx')}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    background: 'transparent', border: 'none', color: '#fff',
                    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '16px' }}>📊</span>
                  <div>
                    <div>Excel (.xlsx)</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Microsoft Excel formatı</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    background: 'transparent', border: 'none', color: '#fff',
                    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '16px' }}>📄</span>
                  <div>
                    <div>CSV (.csv)</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Virgülle ayrılmış değerler</div>
                  </div>
                </button>
              </div>
              </>
            )}
          </div>

          {/* Bulk Mode Toggle */}
          {bulkMode ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#0A84FF', fontWeight: 500 }}>{selectedProducts.size} seçili</span>
              <button onClick={selectAllFilteredProducts} style={{
                padding: '10px 14px', borderRadius: '10px', background: 'rgba(10,132,255,0.1)',
                border: '1px solid rgba(10,132,255,0.2)', color: '#0A84FF', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}>
                Tümünü Seç
              </button>
              <button onClick={openBulkTransferModal} disabled={selectedProducts.size === 0} style={{
                padding: '10px 14px', borderRadius: '10px', background: selectedProducts.size > 0 ? '#30D158' : 'rgba(255,255,255,0.1)',
                border: 'none', color: selectedProducts.size > 0 ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: 500,
                cursor: selectedProducts.size > 0 ? 'pointer' : 'not-allowed',
              }}>
                Taşı
              </button>
              <button onClick={() => { setBulkMode(false); clearSelection(); }} style={{
                padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,69,58,0.1)',
                border: '1px solid rgba(255,69,58,0.2)', color: '#FF453A', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}>
                İptal
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => setBulkMode(true)} style={{
                padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}>
                Toplu Taşı
              </button>
              <button onClick={() => setShowProductModal(true)} style={{
                padding: '10px 16px', borderRadius: '10px', background: '#30D158',
                border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 0 20px rgba(48,209,88,0.3)',
              }}>
                <Plus size={16} /> Ürün Ekle
              </button>
            </>
          )}
        </div>

        {/* Products Info Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
              {selectedMenu ? menus.find(m => m.id === selectedMenu)?.name : 'Tüm Menüler'}
              {selectedCategory && ` / ${categories.find(c => c.id === selectedCategory)?.name}`}
            </span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>•</span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{filteredProducts.length} ürün</span>
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
          {filteredProducts.length === 0 ? (
            <div style={{ 
              height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.3)', gap: '12px',
            }}>
              <Image size={48} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '14px' }}>Ürün bulunamadı</p>
              <button onClick={() => setShowProductModal(true)} style={{
                padding: '10px 16px', borderRadius: '10px', background: 'rgba(48,209,88,0.1)',
                border: '1px solid rgba(48,209,88,0.2)', color: '#30D158', fontSize: '13px', cursor: 'pointer',
              }}>
                İlk Ürünü Ekle
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  onClick={bulkMode ? () => toggleProductSelection(product.id) : undefined}
                  style={{
                    padding: '14px', borderRadius: '12px', 
                    background: selectedProducts.has(product.id) ? 'rgba(10,132,255,0.15)' : 'rgba(255,255,255,0.03)',
                    border: selectedProducts.has(product.id) ? '1px solid rgba(10,132,255,0.4)' : '1px solid rgba(255,255,255,0.06)', 
                    display: 'flex', gap: '12px',
                    cursor: bulkMode ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {bulkMode && (
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                      background: selectedProducts.has(product.id) ? '#0A84FF' : 'rgba(255,255,255,0.1)',
                      border: selectedProducts.has(product.id) ? 'none' : '1px solid rgba(255,255,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
                    }}>
                      {selectedProducts.has(product.id) && <Check size={12} color="#fff" />}
                    </div>
                  )}
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '10px', flexShrink: 0,
                    background: product.imageUrl ? `url(${product.imageUrl}) center/cover` : 'linear-gradient(135deg, rgba(10,132,255,0.2), rgba(191,90,242,0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!product.imageUrl && <Image size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{getCategoryName(product.categoryId)}</p>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#30D158' }}>{formatPrice(product.price)}</p>
                  </div>
                  {!bulkMode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button 
                        onClick={() => updateProductMutation.mutate({ id: product.id, data: { isFeatured: !product.isFeatured } })} 
                        style={{
                          padding: '6px', borderRadius: '6px', 
                          background: product.isFeatured ? 'rgba(255,204,0,0.2)' : 'rgba(255,255,255,0.05)',
                          border: 'none', 
                          color: product.isFeatured ? '#FFCC00' : 'rgba(255,255,255,0.3)', 
                          cursor: 'pointer',
                        }}
                        title={product.isFeatured ? 'Öne çıkandan kaldır' : 'Öne çıkar'}
                      >
                        <Star size={14} fill={product.isFeatured ? '#FFCC00' : 'none'} />
                      </button>
                      <button onClick={() => openEditProduct(product)} style={{
                        padding: '6px', borderRadius: '6px', background: 'rgba(10,132,255,0.1)',
                        border: 'none', color: '#0A84FF', cursor: 'pointer',
                      }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteProductMutation.mutate(product.id)} style={{
                        padding: '6px', borderRadius: '6px', background: 'rgba(255,69,58,0.1)',
                        border: 'none', color: '#FF453A', cursor: 'pointer',
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={closeProductModal}>
          <div style={{
            width: '520px', background: 'rgba(28,28,30,0.98)', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)', padding: '24px',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}
              </h3>
              <button onClick={closeProductModal} style={{ padding: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Image Upload */}
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Ürün Görseli</label>
                <input type="file" ref={imageInputRef} accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div 
                    onClick={() => imageInputRef.current?.click()}
                    style={{
                      width: '100px', height: '100px', borderRadius: '12px', cursor: 'pointer',
                      background: imagePreview ? `url(${imagePreview}) center/cover` : 'linear-gradient(135deg, rgba(10,132,255,0.2), rgba(191,90,242,0.2))',
                      border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {!imagePreview && <Camera size={28} style={{ color: 'rgba(255,255,255,0.4)' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <button onClick={() => imageInputRef.current?.click()} style={{
                      padding: '10px 16px', borderRadius: '10px', background: 'rgba(10,132,255,0.1)',
                      border: '1px solid rgba(10,132,255,0.2)', color: '#0A84FF',
                      fontSize: '13px', fontWeight: 500, cursor: 'pointer', marginBottom: '8px',
                    }}>
                      <Upload size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                      Görsel Yükle
                    </button>
                    {imagePreview && (
                      <button onClick={() => { setImagePreview(null); setProductForm({ ...productForm, imageUrl: '' }); }} style={{
                        padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,69,58,0.1)',
                        border: '1px solid rgba(255,69,58,0.2)', color: '#FF453A',
                        fontSize: '13px', fontWeight: 500, cursor: 'pointer', marginLeft: '8px',
                      }}>
                        Kaldır
                      </button>
                    )}
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
                      PNG, JPG veya WEBP (max 2MB)
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Ürün Adı</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '15px', outline: 'none',
                  }}
                  placeholder="Örn: Latte"
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Fiyat (₺)</label>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '15px', outline: 'none',
                  }}
                  placeholder="0.00"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Menü Tipi</label>
                  <select
                    value={productForm.menuId}
                    onChange={e => {
                      // Menü değişince kategoriyi sıfırla
                      setProductForm({ ...productForm, menuId: e.target.value, categoryId: '' });
                    }}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '15px', cursor: 'pointer',
                    }}
                  >
                    <option value="">Tüm Menüler</option>
                    {menus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Kategori</label>
                  <select
                    value={productForm.categoryId}
                    onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '15px', cursor: 'pointer',
                    }}
                  >
                    <option value="">Seçin</option>
                    {categories
                      .filter(c => !productForm.menuId || c.menuId === productForm.menuId)
                      .map(c => {
                        const menuName = menus.find(m => m.id === c.menuId)?.name;
                        return <option key={c.id} value={c.id}>{c.name}{!productForm.menuId && menuName ? ` (${menuName})` : ''}</option>;
                      })}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Açıklama (Opsiyonel)</label>
                <textarea
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '15px', outline: 'none', resize: 'none', minHeight: '80px',
                  }}
                  placeholder="Ürün açıklaması..."
                />
              </div>
              <button
                onClick={handleProductSubmit}
                disabled={!productForm.name || !productForm.price || !productForm.categoryId}
                style={{
                  padding: '16px', borderRadius: '12px', background: '#30D158',
                  border: 'none', color: '#fff', fontSize: '15px', fontWeight: 600,
                  cursor: 'pointer', opacity: (!productForm.name || !productForm.price || !productForm.categoryId) ? 0.5 : 1,
                }}
              >
                {editingProduct ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={closeCategoryModal}>
          <div style={{
            width: '400px', background: 'rgba(28,28,30,0.98)', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)', padding: '24px',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </h3>
              <button onClick={closeCategoryModal} style={{ padding: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Kategori Adı</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '15px', outline: 'none',
                  }}
                  placeholder="Örn: Kahveler"
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Menü Tipi</label>
                <select
                  value={categoryForm.menuId}
                  onChange={e => setCategoryForm({ ...categoryForm, menuId: e.target.value })}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '15px', cursor: 'pointer',
                  }}
                >
                  <option value="">Menü Seçin (Opsiyonel)</option>
                  {menus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Printer size={14} />
                  Mutfak Yazıcısı
                </label>
                <select
                  value={categoryForm.printerId}
                  onChange={e => setCategoryForm({ ...categoryForm, printerId: e.target.value })}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '15px', cursor: 'pointer',
                  }}
                >
                  <option value="">Varsayılan Yazıcı</option>
                  {printers.filter(p => p.type === 'kitchen' || p.type === 'bar').map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.type === 'kitchen' ? 'Mutfak' : 'Bar'})</option>
                  ))}
                </select>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
                  Bu kategorideki ürünler seçilen yazıcıya gönderilir
                </p>
              </div>
              <button
                onClick={handleCategorySubmit}
                disabled={!categoryForm.name}
                style={{
                  padding: '16px', borderRadius: '12px', background: '#0A84FF',
                  border: 'none', color: '#fff', fontSize: '15px', fontWeight: 600,
                  cursor: 'pointer', opacity: !categoryForm.name ? 0.5 : 1,
                }}
              >
                {editingCategory ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Modal */}
      {showMenuModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={closeMenuModal}>
          <div style={{
            width: '400px', background: 'rgba(28,28,30,0.98)', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)', padding: '24px',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
                {editingMenu ? 'Menü Düzenle' : 'Yeni Menü Tipi'}
              </h3>
              <button onClick={closeMenuModal} style={{ padding: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Menü Adı</label>
                <input
                  type="text"
                  value={menuForm.name}
                  onChange={e => setMenuForm({ ...menuForm, name: e.target.value })}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '15px', outline: 'none',
                  }}
                  placeholder="Örn: Ana Menü, Çocuk Menüsü, Kahvaltı"
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Açıklama (Opsiyonel)</label>
                <input
                  type="text"
                  value={menuForm.description}
                  onChange={e => setMenuForm({ ...menuForm, description: e.target.value })}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '15px', outline: 'none',
                  }}
                  placeholder="Örn: 12 yaş altı çocuklar için"
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={menuForm.isDefault}
                  onChange={e => setMenuForm({ ...menuForm, isDefault: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#FF9F0A' }}
                />
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                  Varsayılan menü olarak ayarla
                </span>
                <Star size={14} style={{ color: '#FF9F0A' }} />
              </label>
              <button
                onClick={handleMenuSubmit}
                disabled={!menuForm.name}
                style={{
                  padding: '16px', borderRadius: '12px', background: '#0A84FF',
                  border: 'none', color: '#fff', fontSize: '15px', fontWeight: 600,
                  cursor: 'pointer', opacity: !menuForm.name ? 0.5 : 1,
                }}
              >
                {editingMenu ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Mapping Modal */}
      {showMappingModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowMappingModal(false)}>
          <div style={{
            width: '800px', maxHeight: '90vh', overflow: 'auto',
            background: 'rgba(28,28,30,0.98)', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)', padding: '24px',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} style={{ color: '#BF5AF2' }} />
                  Akıllı İçe Aktarma
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', background: 'linear-gradient(135deg, #BF5AF2, #0A84FF)', color: '#fff', fontWeight: 600 }}>AI</span>
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                  Excel kolonlarını otomatik algıladık, kontrol edin
                </p>
              </div>
              <button onClick={() => setShowMappingModal(false)} style={{ padding: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Mapping Fields - Zorunlu */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>Zorunlu Alanlar</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Ürün Adı <span style={{ color: '#FF453A' }}>*</span>
                  </label>
                  <select
                    value={columnMapping.name}
                    onChange={e => setColumnMapping({ ...columnMapping, name: e.target.value })}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: '10px',
                      background: columnMapping.name ? 'rgba(48,209,88,0.1)' : 'rgba(255,255,255,0.05)',
                      border: columnMapping.name ? '1px solid rgba(48,209,88,0.3)' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '14px', cursor: 'pointer',
                    }}
                  >
                    <option value="">Kolon seçin...</option>
                    {importData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Fiyat <span style={{ color: '#FF453A' }}>*</span>
                  </label>
                  <select
                    value={columnMapping.price}
                    onChange={e => setColumnMapping({ ...columnMapping, price: e.target.value })}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: '10px',
                      background: columnMapping.price ? 'rgba(48,209,88,0.1)' : 'rgba(255,255,255,0.05)',
                      border: columnMapping.price ? '1px solid rgba(48,209,88,0.3)' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '14px', cursor: 'pointer',
                    }}
                  >
                    <option value="">Kolon seçin...</option>
                    {importData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Mapping Fields - Opsiyonel */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>Opsiyonel Alanlar</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Menü</label>
                  <select
                    value={columnMapping.menu}
                    onChange={e => setColumnMapping({ ...columnMapping, menu: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px',
                      background: columnMapping.menu ? 'rgba(10,132,255,0.1)' : 'rgba(255,255,255,0.05)',
                      border: columnMapping.menu ? '1px solid rgba(10,132,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    <option value="">Kolon seçin...</option>
                    {importData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Kategori</label>
                  <select
                    value={columnMapping.category}
                    onChange={e => setColumnMapping({ ...columnMapping, category: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px',
                      background: columnMapping.category ? 'rgba(10,132,255,0.1)' : 'rgba(255,255,255,0.05)',
                      border: columnMapping.category ? '1px solid rgba(10,132,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    <option value="">Kolon seçin...</option>
                    {importData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Açıklama</label>
                  <select
                    value={columnMapping.description}
                    onChange={e => setColumnMapping({ ...columnMapping, description: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px',
                      background: columnMapping.description ? 'rgba(10,132,255,0.1)' : 'rgba(255,255,255,0.05)',
                      border: columnMapping.description ? '1px solid rgba(10,132,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    <option value="">Kolon seçin...</option>
                    {importData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Resim URL</label>
                  <select
                    value={columnMapping.imageUrl}
                    onChange={e => setColumnMapping({ ...columnMapping, imageUrl: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px',
                      background: columnMapping.imageUrl ? 'rgba(10,132,255,0.1)' : 'rgba(255,255,255,0.05)',
                      border: columnMapping.imageUrl ? '1px solid rgba(10,132,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    <option value="">Kolon seçin...</option>
                    {importData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Sıralama</label>
                  <select
                    value={columnMapping.sortOrder}
                    onChange={e => setColumnMapping({ ...columnMapping, sortOrder: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px',
                      background: columnMapping.sortOrder ? 'rgba(10,132,255,0.1)' : 'rgba(255,255,255,0.05)',
                      border: columnMapping.sortOrder ? '1px solid rgba(10,132,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    <option value="">Kolon seçin...</option>
                    {importData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
                Önizleme ({importData.rows.length} satır)
              </h4>
              <div style={{ 
                background: 'rgba(255,255,255,0.03)', borderRadius: '12px', 
                border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' 
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Menü</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Kategori</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Ürün Adı</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Fiyat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.preview.map((row, i) => {
                      const menuIdx = importData.headers.indexOf(columnMapping.menu);
                      const nameIdx = importData.headers.indexOf(columnMapping.name);
                      const catIdx = importData.headers.indexOf(columnMapping.category);
                      const priceIdx = importData.headers.indexOf(columnMapping.price);
                      return (
                        <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '10px 12px', fontSize: '13px', color: menuIdx !== -1 ? '#BF5AF2' : 'rgba(255,255,255,0.3)' }}>
                            {menuIdx !== -1 ? row[menuIdx] : '-'}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '13px', color: catIdx !== -1 ? '#0A84FF' : 'rgba(255,255,255,0.3)' }}>
                            {catIdx !== -1 ? row[catIdx] : '-'}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '13px', color: nameIdx !== -1 ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                            {nameIdx !== -1 ? row[nameIdx] : '-'}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '13px', color: priceIdx !== -1 ? '#30D158' : 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
                            {priceIdx !== -1 ? `₺${row[priceIdx]}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowMappingModal(false)}
                style={{
                  padding: '14px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)',
                  fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                İptal
              </button>
              <button
                onClick={executeImport}
                disabled={!columnMapping.name || !columnMapping.price || isImporting}
                style={{
                  padding: '14px 24px', borderRadius: '12px', background: '#30D158',
                  border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer', opacity: (!columnMapping.name || !columnMapping.price || isImporting) ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                {isImporting ? 'İçe Aktarılıyor...' : `${importData.rows.length} Ürün İçe Aktar`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Menu Parse Modal */}
      {showAiModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => aiStatus !== 'analyzing' && setShowAiModal(false)}>
          <div style={{
            width: '800px', maxHeight: '90vh', overflow: 'auto',
            background: 'rgba(28,28,30,0.98)', borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)', padding: '28px',
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #30D158, #0A84FF)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={24} style={{ color: '#fff' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                    AI Menü Tarayıcı
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                    AWS Bedrock + Claude 4.5 Sonnet Vision
                  </p>
                </div>
              </div>
              {aiStatus !== 'analyzing' && (
                <button onClick={() => setShowAiModal(false)} style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Status: Loading PDF */}
            {aiStatus === 'loading-pdf' && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{
                  width: '80px', height: '80px', margin: '0 auto 24px',
                  borderRadius: '50%', background: 'linear-gradient(135deg, rgba(191,90,242,0.2), rgba(10,132,255,0.2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Loader2 size={40} style={{ color: '#BF5AF2', animation: 'spin 1s linear infinite' }} />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                  PDF Sayfaları Yükleniyor...
                </h4>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
                  Sayfalar görsele dönüştürülüyor
                </p>
              </div>
            )}

            {/* Status: Selecting Pages */}
            {aiStatus === 'selecting' && pdfPages.length > 0 && (
              <>
                {/* Page Preview */}
                <div style={{
                  marginBottom: '20px', borderRadius: '16px', overflow: 'hidden',
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  {/* Preview Header */}
                  <div style={{
                    padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                      Sayfa {currentPreviewPage + 1} / {pdfPages.length}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setCurrentPreviewPage(Math.max(0, currentPreviewPage - 1))}
                        disabled={currentPreviewPage === 0}
                        style={{
                          padding: '8px 12px', borderRadius: '8px',
                          background: 'rgba(255,255,255,0.1)', border: 'none',
                          color: currentPreviewPage === 0 ? 'rgba(255,255,255,0.2)' : '#fff',
                          cursor: currentPreviewPage === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}
                      >
                        <ChevronLeft size={16} /> Önceki
                      </button>
                      <button
                        onClick={() => setCurrentPreviewPage(Math.min(pdfPages.length - 1, currentPreviewPage + 1))}
                        disabled={currentPreviewPage === pdfPages.length - 1}
                        style={{
                          padding: '8px 12px', borderRadius: '8px',
                          background: 'rgba(255,255,255,0.1)', border: 'none',
                          color: currentPreviewPage === pdfPages.length - 1 ? 'rgba(255,255,255,0.2)' : '#fff',
                          cursor: currentPreviewPage === pdfPages.length - 1 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}
                      >
                        Sonraki <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Preview Image */}
                  <div style={{
                    height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#000', padding: '16px',
                  }}>
                    <img
                      src={pdfPages[currentPreviewPage]?.imageBase64}
                      alt={`Sayfa ${currentPreviewPage + 1}`}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }}
                    />
                  </div>
                </div>

                {/* Page Selection Grid */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>
                      İşlenecek Sayfaları Seçin
                    </h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => toggleAllPages(true)}
                        style={{
                          padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
                          background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.3)',
                          color: '#30D158', cursor: 'pointer',
                        }}
                      >
                        Tümünü Seç
                      </button>
                      <button
                        onClick={() => toggleAllPages(false)}
                        style={{
                          padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                        }}
                      >
                        Temizle
                      </button>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: '10px', maxHeight: '200px', overflowY: 'auto', padding: '4px',
                  }}>
                    {pdfPages.map((page, idx) => (
                      <div
                        key={page.pageNum}
                        onClick={() => {
                          togglePageSelection(page.pageNum);
                          setCurrentPreviewPage(idx);
                        }}
                        style={{
                          position: 'relative', cursor: 'pointer',
                          borderRadius: '10px', overflow: 'hidden',
                          border: page.selected 
                            ? '2px solid #30D158' 
                            : page.processed 
                              ? '2px solid #0A84FF'
                              : '2px solid rgba(255,255,255,0.1)',
                          background: page.selected ? 'rgba(48,209,88,0.1)' : 'rgba(255,255,255,0.03)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <img
                          src={page.imageBase64}
                          alt={`Sayfa ${page.pageNum}`}
                          style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          padding: '4px', background: 'rgba(0,0,0,0.7)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 500 }}>
                            {page.pageNum}
                          </span>
                          {page.processed && (
                            <Check size={12} style={{ color: '#0A84FF' }} />
                          )}
                          {page.selected && !page.processed && (
                            <div style={{
                              width: '14px', height: '14px', borderRadius: '4px',
                              background: '#30D158', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Check size={10} style={{ color: '#fff' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selection Info */}
                <div style={{
                  padding: '14px 16px', borderRadius: '12px', marginBottom: '20px',
                  background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} style={{ color: '#0A84FF' }} />
                    <span style={{ color: '#fff', fontSize: '14px' }}>
                      <strong>{pdfPages.filter(p => p.selected && !p.processed).length}</strong> sayfa seçili
                      {pdfPages.filter(p => p.processed).length > 0 && (
                        <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '8px' }}>
                          ({pdfPages.filter(p => p.processed).length} işlendi)
                        </span>
                      )}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    ~₺{(pdfPages.filter(p => p.selected && !p.processed).length * 0.02).toFixed(2)} maliyet
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowAiModal(false)} style={{
                    padding: '14px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)',
                    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                  }}>
                    İptal
                  </button>
                  <button
                    onClick={processSelectedPages}
                    disabled={pdfPages.filter(p => p.selected && !p.processed).length === 0}
                    style={{
                      padding: '14px 28px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, #30D158, #0A84FF)',
                      border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600,
                      cursor: 'pointer',
                      opacity: pdfPages.filter(p => p.selected && !p.processed).length === 0 ? 0.5 : 1,
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}
                  >
                    <Sparkles size={16} />
                    Seçili Sayfaları İşle
                  </button>
                </div>
              </>
            )}

            {/* Status: Uploading/Analyzing */}
            {(aiStatus === 'uploading' || aiStatus === 'analyzing') && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{
                  width: '80px', height: '80px', margin: '0 auto 24px',
                  borderRadius: '50%', background: 'linear-gradient(135deg, rgba(48,209,88,0.2), rgba(10,132,255,0.2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Loader2 size={40} style={{ color: '#30D158', animation: 'spin 1s linear infinite' }} />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                  {aiStatus === 'uploading' ? 'Dosya Yükleniyor...' : processingPage ? `Sayfa ${processingPage} Analiz Ediliyor...` : 'AI Menüyü Analiz Ediyor...'}
                </h4>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                  {aiStatus === 'analyzing' && 'Claude 4.5 Sonnet Vision ile ürünler ve fotoğraflar tespit ediliyor'}
                </p>
                {aiStatus === 'analyzing' && processingPage && (
                  <div style={{
                    padding: '12px 20px', borderRadius: '10px', marginBottom: '16px',
                    background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.2)',
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                  }}>
                    <span style={{ color: '#0A84FF', fontSize: '14px', fontWeight: 500 }}>
                      İşlenen: {processedCount} / {pdfPages.filter(p => p.selected && !p.processed).length + processedCount}
                    </span>
                  </div>
                )}
                {aiStatus === 'analyzing' && (
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                    <span>✓ Ürün adları</span>
                    <span>✓ Fiyatlar</span>
                    <span>✓ Kategoriler</span>
                    <span>✓ Fotoğraflar</span>
                  </div>
                )}
              </div>
            )}

            {/* Status: Error */}
            {aiStatus === 'error' && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{
                  width: '80px', height: '80px', margin: '0 auto 24px',
                  borderRadius: '50%', background: 'rgba(255,69,58,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertCircle size={40} style={{ color: '#FF453A' }} />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#FF453A', marginBottom: '8px' }}>
                  Analiz Başarısız
                </h4>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
                  {aiError || 'Bilinmeyen hata'}
                </p>
                <button onClick={() => { setShowAiModal(false); pdfInputRef.current?.click(); }} style={{
                  padding: '14px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)',
                  border: 'none', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}>
                  Tekrar Dene
                </button>
              </div>
            )}

            {/* Status: Done - Show Results */}
            {aiStatus === 'done' && (
              <>
                <div style={{
                  padding: '16px', borderRadius: '12px', marginBottom: '20px',
                  background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Check size={20} style={{ color: '#30D158' }} />
                    <div>
                      <span style={{ color: '#30D158', fontSize: '14px', fontWeight: 500 }}>
                        {aiProducts.length} ürün tespit edildi!
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginLeft: '8px' }}>
                        ({aiProducts.filter(p => p.imageBase64).length} fotoğraflı)
                      </span>
                    </div>
                  </div>
                  {pdfPages.length > 0 && pdfPages.some(p => !p.processed) && (
                    <button
                      onClick={() => setAiStatus('selecting')}
                      style={{
                        padding: '8px 14px', borderRadius: '8px',
                        background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.3)',
                        color: '#0A84FF', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      <FileText size={14} />
                      Daha Fazla Sayfa İşle ({pdfPages.filter(p => !p.processed).length})
                    </button>
                  )}
                </div>

                {/* Products List - With Images */}
                <div style={{ maxHeight: '450px', overflowY: 'auto', marginBottom: '20px' }}>
                  {aiProducts.map((product, idx) => (
                    <div key={idx} style={{
                      padding: '16px', borderRadius: '14px', marginBottom: '10px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', gap: '16px', alignItems: 'center',
                    }}>
                      {/* Product Image */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <div style={{
                          width: '80px', height: '80px', borderRadius: '12px', flexShrink: 0,
                          background: product.imageBase64 
                            ? `url(${product.imageBase64}) center/cover` 
                            : 'linear-gradient(135deg, rgba(10,132,255,0.2), rgba(191,90,242,0.2))',
                          border: product.imageBase64 ? '2px solid rgba(48,209,88,0.4)' : '2px dashed rgba(255,255,255,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          position: 'relative',
                        }}>
                          {!product.imageBase64 && <Image size={28} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                          {product.imageBase64 && (
                            <div style={{
                              position: 'absolute', bottom: '-6px', right: '-6px',
                              width: '20px', height: '20px', borderRadius: '50%',
                              background: '#30D158', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Check size={12} style={{ color: '#fff' }} />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => openCropModal(idx)}
                          style={{
                            padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 500,
                            background: product.imageBase64 ? 'rgba(255,159,10,0.1)' : 'rgba(10,132,255,0.1)',
                            border: product.imageBase64 ? '1px solid rgba(255,159,10,0.3)' : '1px solid rgba(10,132,255,0.3)',
                            color: product.imageBase64 ? '#FF9F0A' : '#0A84FF',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Crop size={12} />
                          {product.imageBase64 ? 'Değiştir' : 'Fotoğraf'}
                        </button>
                      </div>
                      
                      {/* Product Info */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={product.name}
                            onChange={e => updateAiProduct(idx, 'name', e.target.value)}
                            placeholder="Ürün adı"
                            style={{
                              flex: 2, padding: '10px 12px', borderRadius: '8px',
                              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                              color: '#fff', fontSize: '14px', fontWeight: 500, outline: 'none',
                            }}
                          />
                          <input
                            type="text"
                            value={product.category}
                            onChange={e => updateAiProduct(idx, 'category', e.target.value)}
                            placeholder="Kategori"
                            style={{
                              flex: 1, padding: '10px 12px', borderRadius: '8px',
                              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                              color: '#0A84FF', fontSize: '13px', outline: 'none',
                            }}
                          />
                          <div style={{ position: 'relative', width: '100px' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#30D158', fontSize: '14px', fontWeight: 600 }}>₺</span>
                            <input
                              type="number"
                              value={product.price}
                              onChange={e => updateAiProduct(idx, 'price', parseFloat(e.target.value) || 0)}
                              style={{
                                width: '100%', padding: '10px 12px 10px 28px', borderRadius: '8px',
                                background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.3)',
                                color: '#30D158', fontSize: '14px', fontWeight: 600, outline: 'none', textAlign: 'right',
                              }}
                            />
                          </div>
                        </div>
                        {product.description && (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={product.description || ''}
                              onChange={e => updateAiProduct(idx, 'description', e.target.value)}
                              placeholder="Açıklama"
                              style={{
                                flex: 1, padding: '8px 12px', borderRadius: '8px',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                color: 'rgba(255,255,255,0.5)', fontSize: '12px', outline: 'none',
                              }}
                            />
                            <button
                              onClick={() => handleEnrichDescription(idx)}
                              disabled={enrichingIndex === idx}
                              style={{
                                padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                                background: enrichingIndex === idx ? 'rgba(191,90,242,0.2)' : 'rgba(191,90,242,0.1)',
                                border: '1px solid rgba(191,90,242,0.3)',
                                color: '#BF5AF2', cursor: enrichingIndex === idx ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
                              }}
                            >
                              {enrichingIndex === idx ? (
                                <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                              ) : (
                                <Sparkles size={12} />
                              )}
                              {enrichingIndex === idx ? 'Yazılıyor...' : 'Zenginleştir'}
                            </button>
                          </div>
                        )}
                        {!product.description && (
                          <button
                            onClick={() => handleEnrichDescription(idx)}
                            disabled={enrichingIndex === idx}
                            style={{
                              padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                              background: enrichingIndex === idx ? 'rgba(191,90,242,0.2)' : 'rgba(191,90,242,0.1)',
                              border: '1px solid rgba(191,90,242,0.3)',
                              color: '#BF5AF2', cursor: enrichingIndex === idx ? 'wait' : 'pointer',
                              display: 'flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start',
                            }}
                          >
                            {enrichingIndex === idx ? (
                              <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Sparkles size={12} />
                            )}
                            {enrichingIndex === idx ? 'Açıklama yazılıyor...' : 'AI ile Açıklama Ekle'}
                          </button>
                        )}
                      </div>
                      
                      {/* Delete Button */}
                      <button onClick={() => removeAiProduct(idx)} style={{
                        padding: '10px', borderRadius: '10px', background: 'rgba(255,69,58,0.1)',
                        border: 'none', color: '#FF453A', cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowAiModal(false)} style={{
                    padding: '14px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)',
                    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                  }}>
                    İptal
                  </button>
                  <button
                    onClick={handleSaveAiProducts}
                    disabled={aiProducts.length === 0 || aiSaving}
                    style={{
                      padding: '14px 28px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, #30D158, #0A84FF)',
                      border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600,
                      cursor: 'pointer', opacity: (aiProducts.length === 0 || aiSaving) ? 0.5 : 1,
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}
                  >
                    {aiSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
                    {aiSaving ? 'Kaydediliyor...' : `${aiProducts.length} Ürün Kaydet`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      {showCropModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1100,
        }} onClick={() => setShowCropModal(false)}>
          <div style={{
            width: '850px', maxHeight: '90vh', overflow: 'auto',
            background: 'rgba(28,28,30,0.98)', borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)', padding: '24px',
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0A84FF, #BF5AF2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Crop size={22} style={{ color: '#fff' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>
                    Ürün Fotoğrafı Seç
                  </h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {cropProductIndex !== null && aiProducts[cropProductIndex]?.name}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCropModal(false)} style={{
                padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px',
                border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              }}>
                <X size={20} />
              </button>
            </div>

            {/* Main Content - Side by Side Layout */}
            <div style={{ display: 'flex', gap: '20px' }}>
              {/* Left: Crop Area */}
              <div style={{ flex: 1 }}>
                {cropImageSrc ? (
                  <>
                    <div style={{
                      marginBottom: '12px', borderRadius: '12px', overflow: 'hidden',
                      background: '#000', display: 'flex', justifyContent: 'center',
                      minHeight: '350px', maxHeight: '450px',
                    }}>
                      <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={1}
                        circularCrop={false}
                      >
                        <img
                          ref={cropImageRef}
                          src={cropImageSrc}
                          alt="Crop"
                          onLoad={onImageLoad}
                          style={{ maxHeight: '450px', maxWidth: '100%' }}
                        />
                      </ReactCrop>
                    </div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                      Kare alanı sürükleyerek ürün fotoğrafını seçin
                    </p>
                  </>
                ) : (
                  <div style={{
                    minHeight: '350px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '16px',
                    background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                    border: '2px dashed rgba(255,255,255,0.1)',
                  }}>
                    <input
                      type="file"
                      ref={cropFileInputRef}
                      accept="image/*"
                      onChange={handleCropImageSelect}
                      style={{ display: 'none' }}
                    />
                    <Upload size={40} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <button
                      onClick={() => cropFileInputRef.current?.click()}
                      style={{
                        padding: '12px 20px', borderRadius: '10px',
                        background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.3)',
                        color: '#0A84FF', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                      }}
                    >
                      Cihazdan Görsel Yükle
                    </button>
                  </div>
                )}
              </div>

              {/* Right: PDF Pages Sidebar */}
              {pdfPages.length > 0 && (
                <div style={{ width: '180px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
                      PDF Sayfaları
                    </span>
                    <input
                      type="file"
                      ref={cropFileInputRef}
                      accept="image/*"
                      onChange={handleCropImageSelect}
                      style={{ display: 'none' }}
                    />
                    <button
                      onClick={() => cropFileInputRef.current?.click()}
                      style={{
                        padding: '4px 8px', borderRadius: '6px', fontSize: '10px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                      }}
                    >
                      Yükle
                    </button>
                  </div>
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: '8px',
                    maxHeight: '400px', overflowY: 'auto', paddingRight: '4px',
                  }}>
                    {pdfPages.map((page, idx) => {
                      const isSelected = cropImageSrc === page.imageBase64;
                      return (
                        <div
                          key={page.pageNum}
                          onClick={() => selectPageForCrop(idx)}
                          style={{
                            cursor: 'pointer', borderRadius: '8px', overflow: 'hidden',
                            border: isSelected ? '2px solid #0A84FF' : '2px solid rgba(255,255,255,0.1)',
                            background: isSelected ? 'rgba(10,132,255,0.1)' : 'rgba(255,255,255,0.03)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <img
                            src={page.imageBase64}
                            alt={`Sayfa ${page.pageNum}`}
                            style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                          />
                          <div style={{
                            padding: '6px', background: isSelected ? 'rgba(10,132,255,0.2)' : 'rgba(0,0,0,0.5)',
                            textAlign: 'center',
                          }}>
                            <span style={{ fontSize: '11px', color: isSelected ? '#0A84FF' : '#fff', fontWeight: isSelected ? 600 : 400 }}>
                              Sayfa {page.pageNum}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowCropModal(false)}
                style={{
                  padding: '12px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)',
                  fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                İptal
              </button>
              <button
                onClick={handleCropComplete}
                disabled={!completedCrop}
                style={{
                  padding: '12px 24px', borderRadius: '10px',
                  background: completedCrop ? '#30D158' : 'rgba(48,209,88,0.3)',
                  border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600,
                  cursor: completedCrop ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <Check size={16} />
                Fotoğrafı Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {showDeleteCategoryModal && categoryToDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1100,
        }} onClick={() => !isDeleting && setShowDeleteCategoryModal(false)}>
          <div style={{
            width: '420px', background: 'rgba(28,28,30,0.98)', borderRadius: '20px',
            border: '1px solid rgba(255,69,58,0.3)', padding: '24px',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '60px', height: '60px', margin: '0 auto 16px',
                borderRadius: '50%', background: 'rgba(255,69,58,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertCircle size={32} style={{ color: '#FF453A' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                Kategoriyi Sil
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                <strong style={{ color: '#FF453A' }}>"{categoryToDelete.name}"</strong> kategorisi ve içindeki{' '}
                <strong style={{ color: '#FF9F0A' }}>
                  {products.filter(p => p.categoryId === categoryToDelete.id).length} ürün
                </strong>{' '}
                kalıcı olarak silinecek.
              </p>
            </div>
            <div style={{
              padding: '12px', borderRadius: '10px', marginBottom: '20px',
              background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)',
            }}>
              <p style={{ fontSize: '12px', color: '#FF453A', textAlign: 'center' }}>
                ⚠️ Bu işlem geri alınamaz!
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteCategoryModal(false)}
                disabled={isDeleting}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                İptal
              </button>
              <button
                onClick={handleDeleteCategory}
                disabled={isDeleting}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: '#FF453A', border: 'none',
                  color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  opacity: isDeleting ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Sil
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Menu Confirmation Modal */}
      {showDeleteAllModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1100,
        }} onClick={() => !isDeleting && setShowDeleteAllModal(false)}>
          <div style={{
            width: '450px', background: 'rgba(28,28,30,0.98)', borderRadius: '20px',
            border: '1px solid rgba(255,69,58,0.3)', padding: '24px',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '60px', height: '60px', margin: '0 auto 16px',
                borderRadius: '50%', background: 'rgba(255,69,58,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertCircle size={32} style={{ color: '#FF453A' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                Tüm Menüyü Sil
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                Tüm menü içeriği kalıcı olarak silinecek:
              </p>
            </div>
            <div style={{
              padding: '16px', borderRadius: '12px', marginBottom: '16px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Kategoriler</span>
                <span style={{ color: '#FF9F0A', fontSize: '14px', fontWeight: 600 }}>{categories.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Ürünler</span>
                <span style={{ color: '#FF9F0A', fontSize: '14px', fontWeight: 600 }}>{products.length}</span>
              </div>
            </div>
            <div style={{
              padding: '12px', borderRadius: '10px', marginBottom: '20px',
              background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)',
            }}>
              <p style={{ fontSize: '12px', color: '#FF453A', textAlign: 'center' }}>
                ⚠️ Bu işlem geri alınamaz! Tüm ürünler ve kategoriler silinecek.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteAllModal(false)}
                disabled={isDeleting}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                İptal
              </button>
              <button
                onClick={handleDeleteAllMenu}
                disabled={isDeleting}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: '#FF453A', border: 'none',
                  color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  opacity: isDeleting ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Tümünü Sil
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Transfer Modal */}
      {showBulkTransferModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1100,
        }} onClick={closeBulkTransferModal}>
          <div style={{
            width: '450px', background: 'rgba(28,28,30,0.98)', borderRadius: '20px',
            border: '1px solid rgba(10,132,255,0.3)', padding: '24px',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
                Toplu Taşı ({selectedProducts.size} ürün)
              </h3>
              <button onClick={closeBulkTransferModal} style={{ padding: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Target Menu */}
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Hedef Menü</label>
                <select
                  value={bulkTargetMenuId}
                  onChange={(e) => { setBulkTargetMenuId(e.target.value); setBulkTargetCategoryId(''); }}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '14px', outline: 'none',
                  }}
                >
                  <option value="">Menü Seçin</option>
                  {menus.map(menu => (
                    <option key={menu.id} value={menu.id}>{menu.name}</option>
                  ))}
                </select>
              </div>

              {/* Target Category */}
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Hedef Kategori</label>
                <select
                  value={bulkTargetCategoryId}
                  onChange={(e) => setBulkTargetCategoryId(e.target.value)}
                  disabled={!bulkTargetMenuId}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: bulkTargetMenuId ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: '14px', outline: 'none',
                  }}
                >
                  <option value="">Kategori Seçin</option>
                  {categories.filter(c => c.menuId === bulkTargetMenuId).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Selected Products Preview */}
              <div style={{
                padding: '12px', borderRadius: '10px', maxHeight: '150px', overflowY: 'auto',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Seçili Ürünler:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {Array.from(selectedProducts).slice(0, 10).map(id => {
                    const product = products.find(p => p.id === id);
                    return product ? (
                      <span key={id} style={{
                        padding: '4px 8px', borderRadius: '6px', fontSize: '11px',
                        background: 'rgba(10,132,255,0.15)', color: '#0A84FF',
                      }}>
                        {product.name}
                      </span>
                    ) : null;
                  })}
                  {selectedProducts.size > 10 && (
                    <span style={{ padding: '4px 8px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      +{selectedProducts.size - 10} daha
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={closeBulkTransferModal} style={{
                flex: 1, padding: '14px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
              }}>
                İptal
              </button>
              <button
                onClick={handleBulkTransfer}
                disabled={!bulkTargetCategoryId || isBulkTransferring}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: bulkTargetCategoryId ? '#30D158' : 'rgba(255,255,255,0.1)',
                  border: 'none', color: bulkTargetCategoryId ? '#fff' : 'rgba(255,255,255,0.3)',
                  fontSize: '14px', fontWeight: 600, cursor: bulkTargetCategoryId ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {isBulkTransferring ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Taşınıyor...
                  </>
                ) : (
                  `${selectedProducts.size} Ürünü Taşı`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
