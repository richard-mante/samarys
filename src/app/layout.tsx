import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CartProvider } from "@/features/cart/cart-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Samary's",
    template: "%s | Samary's",
  },
  description: "Discover Samary's product information and ordering options.",
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
