import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import FAQ from "../faq";
import "../globals.css";

export const metadata: Metadata = {
  title: "Plutocats",
  description: "A crypto cat collective",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className} overscroll-none`}>
        <div className="flex min-h-screen flex-col items-center justify-center">{children}</div>
        <FAQ />
      </body>
    </html>
  );
}
