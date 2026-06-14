import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getAllSiteSettingsAction } from "@/app/actions/settings";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BigBus - Compra, Troca, Venda e Financiamento",
  description: "Encontre as melhores opções de Vans, Ônibus, Carros e Motorhomes para compra, troca, venda ou financiamento. Simulação rápida e negociação 100% segura.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settingsRes = await getAllSiteSettingsAction();
  const settings = settingsRes.success ? settingsRes.data : null;
  const whatsappNumber = settings?.general?.whatsappNumber || '5548999999999';

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${montserrat.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <WhatsAppFloatingButton number={whatsappNumber} />
        </ThemeProvider>
      </body>
    </html>
  );
}
