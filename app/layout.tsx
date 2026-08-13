import type { Metadata } from "next";
import { ThemeProvider } from "./context/ThemeContext";
import { AudioProvider } from "./context/AudioContext";
import BottomNav from "@/components/bottomnav";
import GlobalMiniPlayer from "@/components/GlobalMiniPlayer";
import AndroidBackgroundHandler from "@/components/AndroidBackgroundHandler"; // Integrasi Handler Background
import "./globals.css";

export const metadata: Metadata = {
  title: "ipixchat",
  description: "A modern web chat application",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('app-theme') || 'dark';
                  document.documentElement.classList.add('theme-' + theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased overflow-hidden">
        {/* Handler otomatis menjaga audio tetap berputar di background */}
        <AndroidBackgroundHandler />

        <ThemeProvider>
          <AudioProvider>
            <div className="w-full h-dvh flex flex-col justify-between overflow-hidden relative">
              <main className="flex-1 w-full min-h-0 overflow-y-auto">
                {children}
              </main>
              <GlobalMiniPlayer />
              <BottomNav />
            </div>
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}