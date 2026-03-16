import type { Metadata } from "next";
import { Tajawal, Amiri_Quran, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeColorProvider } from "@/components/theme-color-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
});

const amiriQuran = Amiri_Quran({
  variable: "--font-amiri-quran",
  subsets: ["arabic"],
  weight: ["400"],
});

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#202020",
};

export const metadata: Metadata = {
  title: "اختبار التجويد",
  description: "منصة لاختبارات التجويد والقرآن الكريم",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "معلم التجويد",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body
        className={`${tajawal.variable} ${inter.variable} ${amiriQuran.variable} font-sans antialiased bg-background text-slate-900 dark:text-slate-100`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeColorProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </ThemeColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
