import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import Header from "../../layout/header";
import "../../globals.css";
import { RainbowWrapper } from "@/app/layout/rainbowWrapper";

export const metadata: Metadata = {
  title: "Plutocats",
  description: "Mint a Plutocat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className} overscroll-none`}>
        <div className="flex min-h-screen flex-col items-center">
          <RainbowWrapper>
            <Header />
            {children}
          </RainbowWrapper>
        </div>
      </body>
    </html>
  );
}
