const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Get available displays
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  
  // Open customer display on second monitor
  openCustomerDisplay: () => ipcRenderer.invoke('open-customer-display'),
  
  // Printer discovery and testing (local network)
  scanPrinters: (subnet) => ipcRenderer.invoke('scan-printers', subnet),
  testPrinter: (ip, port) => ipcRenderer.invoke('test-printer', ip, port),
  checkPrinter: (ip, port) => ipcRenderer.invoke('check-printer', ip, port),
  getLocalSubnet: () => ipcRenderer.invoke('get-local-subnet'),
  
  // ÖKC (Ingenico) - Local TCP connection
  okcTestConnection: (ip, port) => ipcRenderer.invoke('okc-test-connection', ip, port),
  okcScanPorts: (ip) => ipcRenderer.invoke('okc-scan-ports', ip),
  
  // Platform info
  platform: process.platform,
  
  // App version
  version: '1.0.0',
  
  // Check if running in Electron
  isElectron: true,
});
