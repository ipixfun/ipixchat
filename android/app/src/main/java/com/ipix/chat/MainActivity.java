package com.ipix.chat;

import android.Manifest;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.util.Base64;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Minta Izin Notifikasi Native Android (Android 13+) tanpa bikin app ke-minimize
        requestNotificationPermission();

        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();

            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setDomStorageEnabled(true);
            settings.setJavaScriptEnabled(true);
            settings.setJavaScriptCanOpenWindowsAutomatically(true);
            settings.setSupportMultipleWindows(true);

            webView.addJavascriptInterface(new BlobDownloader(this), "AndroidBlobDownloader");

            webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
                if (url.startsWith("blob:")) {
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
                    downloadDirectFile(url, userAgent, contentDisposition, mimetype);
                }
            });
        }

        handleIntent(getIntent());
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                        this,
                        new String[]{Manifest.permission.POST_NOTIFICATIONS},
                        101
                );
            }
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent != null && this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            webView.post(() -> webView.loadUrl("javascript:if(window.location.pathname !== '/mp3') { window.location.href = '/mp3'; }"));
        }
    }

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

    @Override
    public void onPause() {
        // Biarkan kosong
    }
}