export async function openExternalLink(url: string) {
  if (!url) return;

  try {
    // 1. Coba buka menggunakan Capacitor Browser (untuk HP Android/iOS)
    const { Browser } = await import(/* webpackIgnore: true */ '@capacitor/browser');
    await Browser.open({ url });
  } catch (error) {
    // 2. Fallback jika dibuka di Web Browser biasa
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}