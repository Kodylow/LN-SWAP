import QueryClientProvider from "@/components/providers/query-client-provider";
import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swap",
  description: "Shitcoin <> Bitcoin swapping",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryClientProvider>
          {children}
          <Toaster />
        </QueryClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
