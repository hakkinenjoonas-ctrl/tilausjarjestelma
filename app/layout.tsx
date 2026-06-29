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
                <BrandMark />
              </div>
              <div className="topbar-copy-block">
                <p className="eyebrow">Forellin tilausohjaamo</p>
                <h1>Ennakkotilausten hallinta yhdella selkealla nakymalla</h1>
                <p className="topbar-copy">
                  Merellinen, rauhallinen ja nopea tyokalu tiskille, puhelimeen ja
                  tulostettavaan etikettiin.
                </p>
              </div>
            </div>
          </header>
          <MainNav />
          <div className="page-shell">{children}</div>
        </div>
      </body>
    </html>
  );
}
