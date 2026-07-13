import type { Metadata } from "next";
import "./globals.css"; // PENTING: Pastikan file globals.css ini ada di folder app Anda

// 💡 Solusi Error Title: Next.js akan merender tag <title> secara aman lewat objek ini
export const metadata: Metadata = {
  title: "ipixchat",
  description: "A modern web chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}