import type { Metadata } from "next";
import { inter } from "@/lib/fonts";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title:       "Denova PK - Admin",
  description: "Denova PK Admin Dashboard",
  robots:      { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-[#f8f9fa] text-[#111111]">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}