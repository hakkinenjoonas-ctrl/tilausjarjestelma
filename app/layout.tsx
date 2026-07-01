import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forelli tilausjarjestelma",
  description: "Selainpohjainen tilausjarjestelma Forellin ennakkotilauksille."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fi">
      <body>
        <div className="app-shell">
          <AppHeader />
          <div className="page-shell">{children}</div>
        </div>
      </body>
    </html>
  );
}
