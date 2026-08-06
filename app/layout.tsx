import type { Metadata } from "next";
import { ThemeProvider } from "./context/ThemeContext";
import BottomNav from "@/components/bottomnav"; // Gunakan @/ agar mengarah ke root folder
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
        {/* Script anti-flash: set tema sebelum React render */}
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
      <body className="antialiased">
        <ThemeProvider>
          <div className="pb-20 min-h-screen">
            {children}
          </div>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}