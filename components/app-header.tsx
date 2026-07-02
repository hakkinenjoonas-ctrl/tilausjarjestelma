"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";

const adminNavItems = [
  { href: "/tilaukset", label: "Tilaukset" },
  { href: "/varaa", label: "Asiakasvaraus" },
  { href: "/uusi-tilaus", label: "Uusi tilaus" },
  { href: "/raportit", label: "Raportit" },
  { href: "/tiivistelma", label: "Tiivistelma" },
  { href: "/asetukset", label: "Asetukset" }
] satisfies { href: Route; label: string }[];

const customerNavItems = [
  { href: "/varaa", label: "Uusi varaus" },
  { href: "/varaa/omat", label: "Omat varaukset" }
] satisfies { href: Route; label: string }[];

export function AppHeader() {
  const pathname = usePathname();
  const isCustomerView = pathname.startsWith("/varaa");
  const navItems = isCustomerView ? customerNavItems : adminNavItems;

  return (
    <>
      {isCustomerView ? (
        <header className="topbar customer-topbar">
          <div className="customer-topbar-shell">
            <div className="customer-topbar-logo-wrap">
              <Image
                alt="Kalakauppa Forelli"
                className="customer-topbar-logo"
                height={188}
                priority
                src="/brand-logo.png"
                width={188}
              />
            </div>
            <div className="customer-topbar-copy">
              <p className="customer-topbar-kicker">Kalakauppa Forelli</p>
              <h1>TUORETTA LÄHIKALAA</h1>
              <p className="customer-topbar-description">
                Tee ennakkovaraus helposti verkossa ja seuraa omia varauksiasi samasta paikasta.
              </p>
            </div>
          </div>
        </header>
      ) : (
        <header className="topbar">
          <div className="topbar-shell">
            <div className="topbar-brand">
              <BrandMark logoOnly />
            </div>
          </div>
          <h1>Ennakkotilausten hallinta</h1>
        </header>
      )}

      <nav
        aria-label={isCustomerView ? "Asiakasvalikko" : "Paavalikko"}
        className={`main-nav ${isCustomerView ? "customer-nav" : ""}`}
      >
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
    </>
  );
}
