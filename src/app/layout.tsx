import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CartProvider } from "@/features/cart/cart-provider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://samary.catpad.shop";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Samary's",
    template: "%s | Samary's",
  },
  description: "Discover Samary's product information and ordering options.",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
