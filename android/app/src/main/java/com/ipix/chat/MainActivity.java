package com.ipix.chat;

import android.app.DownloadManager;
import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.util.Base64;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

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

            // 2. Izinkan penyimpanan lokal & JavaScript
            settings.setDomStorageEnabled(true);
            settings.setJavaScriptEnabled(true);
            settings.setJavaScriptCanOpenWindowsAutomatically(true);
            settings.setSupportMultipleWindows(true);

            // 3. Interface khusus untuk menangani Blob/Base64 dari JavaScript
            webView.addJavascriptInterface(new BlobDownloader(this), "AndroidBlobDownloader");

            // 4. Fitur Unduh Langsung dari Dalam APK
            webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
                if (url.startsWith("blob:")) {
                    // Konversi Blob URL menjadi Base64 melalui JavaScript
                    String js = "var xhr = new XMLHttpRequest();" +
                            "xhr.open('GET', '" + url + "', true);" +
                            "xhr.responseType = 'blob';" +
                            "xhr.onload = function(e) {" +
                            "    if (this.status == 200) {" +
                            "        var blob = this.response;" +
                            "        var reader = new FileReader();" +
                            "        reader.readAsDataURL(blob);" +
                            "        reader.onloadend = function() {" +
                            "            base64data = reader.result;" +
                            "            AndroidBlobDownloader.getBase64FromBlobData(base64data, '" + mimetype + "');" +
                            "        }" +
                            "    }" +
                            "};" +
                            "xhr.send();";
                    webView.loadUrl("javascript:" + js);
                } else {
                    // Unduh Direct Link / URL Biasa via DownloadManager
                    downloadDirectFile(url, userAgent, contentDisposition, mimetype);
                }
            });
        }
    }

    // Fungsi internal untuk mengunduh URL standar via DownloadManager Android
    private void downloadDirectFile(String url, String userAgent, String contentDisposition, String mimetype) {
        try {
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));

            if (mimetype != null && !mimetype.isEmpty()) {
                request.setMimeType(mimetype);
            }

            String cookies = CookieManager.getInstance().getCookie(url);
            if (cookies != null) {
                request.addRequestHeader("cookie", cookies);
            }
            request.addRequestHeader("User-Agent", userAgent);

            String fileName = URLUtil.guessFileName(url, contentDisposition, mimetype);
            if (!fileName.endsWith(".mp3") && (mimetype != null && mimetype.contains("audio"))) {
                fileName += ".mp3";
            }

            request.setDescription("Mengunduh lagu...");
            request.setTitle(fileName);
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);

            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            if (dm != null) {
                dm.enqueue(request);
                Toast.makeText(getApplicationContext(), "Memulai unduhan...", Toast.LENGTH_SHORT).show();
            }
        } catch (Exception e) {
            Toast.makeText(getApplicationContext(), "Gagal mengunduh file", Toast.LENGTH_SHORT).show();
        }
    }

    // Class khusus untuk menyimpan data Blob/Base64 menjadi file .mp3 di folder Download
    public class BlobDownloader {
        private Context context;

        public BlobDownloader(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public void getBase64FromBlobData(String base64Data, String mimeType) {
            try {
                String fileName = "Lagu_" + System.currentTimeMillis() + ".mp3";
                File dwDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                File file = new File(dwDir, fileName);

                String base64 = base64Data.substring(base64Data.indexOf(",") + 1);
                byte[] fileBytes = Base64.decode(base64, Base64.DEFAULT);

                OutputStream os = new FileOutputStream(file, false);
                os.write(fileBytes);
                os.flush();
                os.close();

                runOnUiThread(() -> Toast.makeText(context, "Selesai! Lagu tersimpan di folder Download", Toast.LENGTH_LONG).show());
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(context, "Gagal menyimpan file ke HP", Toast.LENGTH_SHORT).show());
            }
        }
    }

    // 5. JANGAN panggil super.onPause() milik WebView agar audio TIDAK MATI saat di-minimize
    @Override
    public void onPause() {
        // Dibiarkan kosong tanpa super.onPause()
    }
}