package com.ipix.chat;

import android.app.DownloadManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.CookieManager;
import android.webkit.URLUtil;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Ambil instance WebView bawaan Capacitor
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();

            // 1. Izinkan audio diputar otomatis & tetap jalan di background
            settings.setMediaPlaybackRequiresUserGesture(false);

            // 2. Izinkan penyimpanan lokal & popup modal
            settings.setDomStorageEnabled(true);
            settings.setJavaScriptCanOpenWindowsAutomatically(true);
            settings.setSupportMultipleWindows(true);

            // 3. FITUR UNDUH: Pasang DownloadListener untuk menangani link download file/mp3
            webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
                try {
                    DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));

                    request.setMimeType(mimetype);
                    String cookies = CookieManager.getInstance().getCookie(url);
                    request.addRequestHeader("cookie", cookies);
                    request.addRequestHeader("User-Agent", userAgent);
                    
                    request.setDescription("Mengunduh file...");
                    request.setTitle(URLUtil.guessFileName(url, contentDisposition, mimetype));
                    request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    
                    // Simpan hasil download ke folder Download internal HP
                    request.setDestinationInExternalPublicDir(
                        Environment.DIRECTORY_DOWNLOADS, 
                        URLUtil.guessFileName(url, contentDisposition, mimetype)
                    );

                    DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                    if (dm != null) {
                        dm.enqueue(request);
                        Toast.makeText(getApplicationContext(), "Mengunduh file...", Toast.LENGTH_SHORT).show();
                    }
                } catch (Exception e) {
                    Toast.makeText(getApplicationContext(), "Gagal mengunduh file", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    // 4. JANGAN panggil super.onPause() milik WebView agar musik TIDAK MATI saat APK di-minimize
    @Override
    public void onPause() {
        super.onPause();
        // Dibiarkan kosong agar WebView tidak menangguhkan pemutaran audio di latar belakang
    }
}