package com.ipix.chat;

import android.app.DownloadManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
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
import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {

    private MediaSession mediaSession;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        createNotificationChannel();
        initMediaSession();

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
    }

    private void initMediaSession() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                mediaSession = new MediaSession(this, "iPixChatMediaSession");

                PlaybackState.Builder stateBuilder = new PlaybackState.Builder()
                        .setActions(
                                PlaybackState.ACTION_PLAY |
                                PlaybackState.ACTION_PAUSE |
                                PlaybackState.ACTION_SKIP_TO_NEXT |
                                PlaybackState.ACTION_SKIP_TO_PREVIOUS |
                                PlaybackState.ACTION_SEEK_TO
                        );
                mediaSession.setPlaybackState(stateBuilder.build());
                mediaSession.setActive(true);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    "ipix_music_channel",
                    "iPix Music Player",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Notifikasi Kontrol Pemutar Musik");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
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
        // Kosongkan agar audio tidak mati saat app di-minimize
    }
}