package cloud.pixpos.waiter;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
    
    @Override
    public void onStart() {
        super.onStart();
        
        // WebView User-Agent'ı manuel olarak ayarla
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                String currentUA = settings.getUserAgentString();
                // PIXPOS-Waiter ekle (CloudFront bypass için)
                if (!currentUA.contains("PIXPOS-Waiter")) {
                    settings.setUserAgentString(currentUA + " PIXPOS-Waiter");
                }
            }
        } catch (Exception e) {
            // Hata durumunda sessizce devam et
            e.printStackTrace();
        }
    }
}
