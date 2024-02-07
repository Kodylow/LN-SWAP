import QueryClientProvider from "@/components/providers/query-client-provider";
import { Toaster } from "@fedibtc/ui";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "@fedibtc/ui/dist/index.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swap",
  description: "Swap crypto tokens for sats",
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
