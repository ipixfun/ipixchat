'use client';

import { useEffect } from 'react';

export default function AndroidBackgroundHandler() {
  useEffect(() => {
    // Hanya berjalan jika dibuka di dalam APK / WebView Capacitor
    if (typeof window === 'undefined') return;

    const initBackgroundServices = async () => {
      try {
        // Trik agar Webpack Vercel tidak mengecek/meng-compile package Capacitor
        const appModuleName = '@capacitor/app';
        const keepAwakeModuleName = '@capacitor-community/keep-awake';

        const { App: CapacitorApp } = await import(/* webpackIgnore: true */ appModuleName);
        const { KeepAwake } = await import(/* webpackIgnore: true */ keepAwakeModuleName);

        // 1. Jaga CPU agar tidak dipaksa tidur/freeze oleh Android
        if (KeepAwake) {
          await KeepAwake.keepAwake().catch(() => {});
        }

        // 2. Cegah aplikasi mati saat tombol Back ditekan -> Pindahkan ke Background
        if (CapacitorApp) {
          const listener = await CapacitorApp.addListener(
            'backButton',
            (data: { canGoBack: boolean }) => {
              if (!data.canGoBack) {
                CapacitorApp.minimizeApp();
              } else {
                window.history.back();
              }
            }
          );

          return () => {
            listener.remove();
          };
        }
      } catch (error) {
        // Abaikan jika dibuka di web biasa / Vercel server
      }
    };

    initBackgroundServices();
  }, []);

  return null;
}