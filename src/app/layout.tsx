import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartDrawer } from "@/features/cart/cart-drawer";
import { SiteHeader } from "@/features/auth/site-header";
import { StorefrontChrome } from "@/ui/storefront-chrome";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drolly",
  description:
    "Single-store shop for browsing products and placing cash-on-delivery orders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-full flex-col overflow-hidden">
        <Providers>
          <SiteHeader />
          <CartDrawer />
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          <StorefrontChrome />
        </Providers>
      </body>
    </html>
  );
}
