"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/tilaukset", label: "Tilaukset", icon: "📋" },
  { href: "/uusi-tilaus", label: "Uusi tilaus", icon: "➕" },
  { href: "/raportit", label: "Raportit", icon: "📊" },
  { href: "/tiivistelma", label: "Tiivistelma", icon: "📦" },
  { href: "/asetukset", label: "Asetukset", icon: "⚙️" }
] satisfies { href: Route; label: string; icon: string }[];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Paavalikko" className="main-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            className={`nav-pill ${isActive ? "active" : ""}`}
            href={item.href}
            key={item.href}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
