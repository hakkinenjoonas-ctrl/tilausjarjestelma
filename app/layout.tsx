import type { ReactNode } from "react";
import type { Metadata } from "next";
import { MainNav } from "@/components/main-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kalakaupan tilausjarjestelma",
  description: "Selainpohjainen tilausjarjestelma sesonkien ennakkotilauksille."
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
            <div>
              <p className="eyebrow">Kalakaupan tyokalu</p>
              <h1>Ennakkotilausten hallinta</h1>
            </div>
            <p className="topbar-copy">
              Nopea kayttaa tiskilla, toimii puhelimella, tabletilla ja koneella.
            </p>
          </header>
          <MainNav />
          <div className="page-shell">{children}</div>
        </div>
      </body>
    </html>
  );
}
