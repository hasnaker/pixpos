function handler(event) {
    var request = event.request;
    var host = request.headers.host.value;
    var uri = request.uri;
    var userAgent = request.headers['user-agent'] ? request.headers['user-agent'].value : '';
    
    // Extract tenant from subdomain (queen.pixpos.cloud -> queen)
    var tenant = host.split('.')[0];
    
    // Check if request is from native app (Electron/Capacitor WebView)
    // Electron uses "Electron" in UA, Capacitor Android uses "wv" (WebView)
    var isNativeApp = userAgent.indexOf('Electron') !== -1 || 
                      userAgent.indexOf('wv') !== -1 ||
                      userAgent.indexOf('PIXPOS') !== -1;
    
    // Check if this is a static asset request (JS, CSS, images, etc.)
    var isAsset = uri.indexOf('/assets/') !== -1 || 
                  uri.endsWith('.js') || 
                  uri.endsWith('.css') || 
                  uri.endsWith('.svg') || 
                  uri.endsWith('.png') || 
                  uri.endsWith('.ico') ||
                  uri.endsWith('.webmanifest');
    
    // BLOCK POS and Waiter web access - only EXE/APK allowed
    // Allow native apps and asset requests through
    if (!isNativeApp && !isAsset) {
        if (uri.startsWith('/pos') || uri === '/' || uri === '') {
            // Block POS web access - redirect to boss
            return {
                statusCode: 302,
                statusDescription: 'Found',
                headers: {
                    'location': { value: '/boss' },
                    'cache-control': { value: 'no-cache' }
                }
            };
        }
        
        if (uri.startsWith('/waiter')) {
            // Block Waiter web access - show message
            return {
                statusCode: 403,
                statusDescription: 'Forbidden',
                headers: {
                    'content-type': { value: 'text/html; charset=utf-8' }
                },
                body: '<html><head><meta charset="utf-8"><title>PIXPOS</title><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0A0A0A;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}h1{font-size:24px;margin-bottom:16px}p{color:rgba(255,255,255,0.6);font-size:16px}</style></head><body><div><h1>PIXPOS Garson</h1><p>Bu uygulama sadece tablet üzerinden kullanılabilir.</p><p>APK uygulamasını yükleyin.</p></div></body></html>'
            };
        }
    }
    
    // Determine which app based on path
    var app = 'boss'; // default to boss now
    if (uri.startsWith('/boss')) {
        app = 'boss';
    } else if (uri.startsWith('/kitchen')) {
        app = 'kitchen';
    } else if (uri.startsWith('/display')) {
        // Customer display - allow for second monitor
        app = 'pos';
    }
    
    // Check if this is a static asset (has file extension)
    var hasExtension = uri.lastIndexOf('.') > uri.lastIndexOf('/');
    
    if (hasExtension) {
        // Static file - prepend tenant to path
        request.uri = '/' + tenant + uri;
    } else {
        // SPA route - serve index.html for the app
        request.uri = '/' + tenant + '/' + app + '/index.html';
    }
    
    return request;
}
