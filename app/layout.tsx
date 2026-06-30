import type { ReactNode } from "react";
import type { Metadata } from "next";
import { BrandMark } from "@/components/brand-mark";
import { MainNav } from "@/components/main-nav";
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
          <header className="topbar">
            <div className="topbar-shell">
              <div className="topbar-brand">
                <BrandMark logoOnly />
              </div>
            </div>
            <h1>Ennakkotilausten hallinta</h1>
          </header>
          <MainNav />
          <div className="page-shell">{children}</div>
        </div>
      </body>
    </html>
  );
}
