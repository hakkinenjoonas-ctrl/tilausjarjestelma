"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/tilaukset", label: "Tilaukset" },
  { href: "/uusi-tilaus", label: "Uusi tilaus" },
  { href: "/raportit", label: "Raportit" },
  { href: "/tiivistelma", label: "Tiivistelma" },
  { href: "/asetukset", label: "Asetukset" }
] satisfies { href: Route; label: string }[];

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
            <span aria-hidden="true" className="nav-pill-marker" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
