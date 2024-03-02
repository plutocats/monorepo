import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import FAQ from "../faq";
import "../globals.css";
import { RainbowWrapper } from "../layout/rainbowWrapper";

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
        <RainbowWrapper>
          <div className="flex min-h-screen flex-col items-center justify-center">{children}</div>
          <FAQ />
        </RainbowWrapper>
      </body>
    </html>
  );
}
