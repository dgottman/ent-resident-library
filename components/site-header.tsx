"use client";

import Link from "next/link";
import { useState } from "react";
import { siteConfig } from "@/content/site-config";
import { BookIcon, MenuIcon, MoonIcon, SunIcon } from "@/components/icons";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleTheme() {
    const next = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("ent-library-theme", next ? "dark" : "light");
  }

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label={`${siteConfig.name} home`}>
          <span className="brand-mark">
            <BookIcon />
          </span>
          <span>
            <strong>{siteConfig.shortName}</strong>
            <small>Resident study guides</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="icon-button"
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle light and dark theme"
            title="Toggle light and dark theme"
          >
            <span className="theme-icon theme-icon-moon">
              <MoonIcon />
            </span>
            <span className="theme-icon theme-icon-sun">
              <SunIcon />
            </span>
          </button>
          <button
            className="icon-button mobile-menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>
      <nav
        id="mobile-navigation"
        className={`mobile-nav ${menuOpen ? "is-open" : ""}`}
        aria-label="Mobile navigation"
      >
        <div className="shell">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
