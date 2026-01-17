const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const net = require('net');
const os = require('os');

// Keep a global reference of the window object
let mainWindow = null;
let customerDisplayWindow = null;

// Check if running in development
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// API URL - can be overridden by environment variable
const API_URL = process.env.PIXPOS_API_URL || 'https://api.pixpos.cloud/api';
const WEB_URL = process.env.PIXPOS_WEB_URL || 'https://queen.pixpos.cloud/pos';

// ============ PRINTER DISCOVERY ============

/**
 * Detect local subnet from network interfaces
 */
function detectSubnet() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;
    
    for (const alias of iface) {
      // Skip internal and non-IPv4
      if (alias.internal || alias.family !== 'IPv4') continue;
      
      // Get subnet (first 3 octets)
      const parts = alias.address.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}`;
      }
    }
  }
  return null;
}

/**
 * Check if a specific IP:port has a printer
 */
function checkPrinter(ip, port = 9100, timeout = 1000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      const responseTime = Date.now() - startTime;
      socket.destroy();
      resolve({ ip, port, responseTime });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(null);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(null);
    });

    socket.connect(port, ip);
  });
}

/**
 * Scan network for printers on port 9100
 */
async function scanNetworkForPrinters(baseIp) {
  const subnet = baseIp || detectSubnet();
  if (!subnet) {
    console.log('Could not detect subnet');
    return [];
  }

  console.log(`Scanning subnet: ${subnet}.1-254 for printers...`);
  
  const discovered = [];
  const scanPromises = [];

  // Scan all IPs in subnet (1-254)
  for (let i = 1; i <= 254; i++) {
    const ip = `${subnet}.${i}`;
    scanPromises.push(checkPrinter(ip, 9100));
  }

  const results = await Promise.all(scanPromises);
  
  for (const result of results) {
    if (result) {
      discovered.push(result);
    }
  }

  console.log(`Found ${discovered.length} printer(s)`);
  return discovered.sort((a, b) => a.responseTime - b.responseTime);
}

/**
 * Test print to a specific printer
 */
async function testPrint(ip, port = 9100) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(5000);

    socket.on('connect', () => {
      // ESC/POS test print
      const testContent = Buffer.from([
        0x1B, 0x40,           // Initialize printer
        0x1B, 0x61, 0x01,     // Center align
        ...Buffer.from('PIXPOS TEST\n'),
        ...Buffer.from('================\n'),
        ...Buffer.from('Yazici Baglantisi\n'),
        ...Buffer.from('BASARILI!\n'),
        ...Buffer.from('================\n'),
        ...Buffer.from(new Date().toLocaleString('tr-TR') + '\n'),
        0x1B, 0x64, 0x03,     // Feed 3 lines
        0x1D, 0x56, 0x00,     // Cut paper
      ]);
      
      socket.write(testContent, () => {
        socket.destroy();
        resolve({ success: true, message: 'Test yazdırma başarılı' });
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ success: false, message: 'Bağlantı zaman aşımı' });
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({ success: false, message: `Bağlantı hatası: ${err.message}` });
    });

    socket.connect(port, ip);
  });
}

function createMainWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    title: 'PIXPOS Kasa',
    icon: path.join(__dirname, '../public/pixpos.svg'),
    backgroundColor: '#0A0A0A',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    // Frameless for kiosk-like experience (optional)
    // frame: false,
    // fullscreen: true,
  });

  // Load the app
  if (isDev) {
    // Development: load from local dev server
    mainWindow.loadURL('http://localhost:3003');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load from web URL or local files
    mainWindow.loadURL(WEB_URL);
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    // Close customer display when main window closes
    if (customerDisplayWindow) {
      customerDisplayWindow.close();
    }
  });

  // Create application menu
  createMenu();
}

function createCustomerDisplayWindow() {
  // Get all displays
  const { screen } = require('electron');
  const displays = screen.getAllDisplays();
  
  // Find external display (not primary)
  const externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0;
  });

  if (externalDisplay) {
    customerDisplayWindow = new BrowserWindow({
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y,
      width: externalDisplay.bounds.width,
      height: externalDisplay.bounds.height,
      fullscreen: true,
      frame: false,
      title: 'PIXPOS Müşteri Ekranı',
      backgroundColor: '#0A0A0A',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Load customer display page
    const displayUrl = isDev 
      ? 'http://localhost:3003/display'
      : `${WEB_URL}/display`;
    
    customerDisplayWindow.loadURL(displayUrl);

    customerDisplayWindow.on('closed', () => {
      customerDisplayWindow = null;
    });

    return true;
  }

  return false;
}

function createMenu() {
  const template = [
    {
      label: 'PIXPOS',
      submenu: [
        {
          label: 'Hakkında',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'PIXPOS Kasa',
              message: 'PIXPOS Kasa v1.0.0',
              detail: 'Modern POS Sistemi\n\n© 2026 PIXPOS',
            });
          },
        },
        { type: 'separator' },
        {
          label: 'Müşteri Ekranı Aç',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            if (!customerDisplayWindow) {
              const opened = createCustomerDisplayWindow();
              if (!opened) {
                const { dialog } = require('electron');
                dialog.showMessageBox(mainWindow, {
                  type: 'warning',
                  title: 'Müşteri Ekranı',
                  message: 'İkinci monitör bulunamadı',
                  detail: 'Müşteri ekranı için ikinci bir monitör bağlayın.',
                });
              }
            } else {
              customerDisplayWindow.focus();
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Tam Ekran',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          },
        },
        { type: 'separator' },
        {
          label: 'Çıkış',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Düzen',
      submenu: [
        { label: 'Geri Al', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Yinele', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Kes', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Kopyala', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Yapıştır', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      ],
    },
    {
      label: 'Görünüm',
      submenu: [
        { label: 'Yenile', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Zorla Yenile', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { type: 'separator' },
        { label: 'Yakınlaştır', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Uzaklaştır', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { label: 'Sıfırla', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { type: 'separator' },
        {
          label: 'Geliştirici Araçları',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('get-displays', () => {
  const { screen } = require('electron');
  return screen.getAllDisplays();
});

ipcMain.handle('open-customer-display', () => {
  return createCustomerDisplayWindow();
});

// Printer discovery IPC handlers
ipcMain.handle('scan-printers', async (event, subnet) => {
  try {
    const printers = await scanNetworkForPrinters(subnet);
    return { success: true, printers };
  } catch (error) {
    return { success: false, error: error.message, printers: [] };
  }
});

ipcMain.handle('test-printer', async (event, ip, port) => {
  try {
    const result = await testPrint(ip, port || 9100);
    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('check-printer', async (event, ip, port) => {
  try {
    const result = await checkPrinter(ip, port || 9100);
    return result ? { success: true, responseTime: result.responseTime } : { success: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-local-subnet', () => {
  return detectSubnet();
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    // On macOS re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep app running until Cmd+Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle certificate errors for self-signed certs (development)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});
