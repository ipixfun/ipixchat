'use client';

import { useEffect } from 'react';

export default function AndroidBackgroundHandler() {
  useEffect(() => {
    const initBackgroundServices = async () => {
      try {
        // @ts-ignore - Mencegah error TypeScript jika package belum terinstall
        const { App: CapacitorApp } = await import('@capacitor/app');
        // @ts-ignore - Mencegah error TypeScript jika package belum terinstall
        const { KeepAwake } = await import('@capacitor-community/keep-awake');

        // 1. Jaga CPU agar tidak di-freeze oleh Android
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
        // Abaikan jika dibuka di web browser biasa
      }
    };

    initBackgroundServices();
  }, []);

  return null;
}