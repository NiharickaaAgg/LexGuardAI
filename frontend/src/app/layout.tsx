import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LexGuard AI — Legal Intelligence Platform",
  description: "AI-powered legal document auditing. Understand your contracts before you sign.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="mesh-bg" />
        {children}
      </body>
    </html>
  );
}