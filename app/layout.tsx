import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VetApp",
  description: "Gestión de clínica veterinaria",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VetApp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <body className="pb-20">
        <NextTopLoader showSpinner={false} height={5} />
        {children}
        <BottomNav />
      </body>
    </html>
  )
  // return (
  //   <html
  //     lang="en"
  //     className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
  //   >
  //     <body className="min-h-full flex flex-col">{children}</body>
  //   </html>
  // );
}
