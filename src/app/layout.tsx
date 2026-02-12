import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Platinumlist Partner Calculator",
  description: "Partnership fee calculator and optimization tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
