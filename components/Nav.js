"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../lib/cart-context";

const SHOP_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/singles", label: "Singles" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/preorders", label: "Pre-orders" },
  { href: "/mystery-slabs", label: "Mystery Slabs" },
  { href: "/sold", label: "Sold" },
  { href: "/merch", label: "Merch" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { items } = useCart();
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, [pathname]);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    router.refresh();
  }

  const categoryLinks = (
    <>
      {SHOP_LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={pathname.startsWith(l.href) ? "active" : ""}>
          {l.label}
        </Link>
      ))}
      <Link href="/pokemon-sets" className={pathname.startsWith("/pokemon-sets") ? "active" : ""}>
        Pokémon Sets
      </Link>
      <Link href="/track" className={pathname.startsWith("/track") ? "active" : ""}>
        Track Order
      </Link>
    </>
  );

  const mobileLinks = (
    <>
      {categoryLinks}
      <a
        href="https://www.apexgradingcompany.com"
        target="_blank"
        rel="noopener noreferrer"
        className="main-site-cta"
      >
        <img src="/assets/apex-icon.jpg" alt="" />
        Get your cards graded — head over to Apex Grading
      </a>
    </>
  );

  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link href="/" className="nav-mark">
          <img src="/assets/apex-icon.jpg" alt="" />
          <span className="nav-wordmark">APEX <span>CARDS</span></span>
        </Link>
        <a
          href="https://www.apexgradingcompany.com"
          target="_blank"
          rel="noopener noreferrer"
          className="main-site-cta nav-cta-top"
        >
          <img src="/assets/apex-icon.jpg" alt="" />
          Get your cards graded
        </a>
        <div className="nav-actions">
          <button
            className="nav-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <Link href="/cart" className="cart-link">
            Cart
            {items.length > 0 && <span className="cart-badge">{items.length}</span>}
          </Link>
          {user === undefined ? null : user ? (
            <>
              <span className="nav-user-email" style={{ color: "var(--grey)", fontSize: 13.5 }}>{user.email}</span>
              <Link href="/account/orders" className="btn-ghost-nav nav-signin">My Orders</Link>
              <button onClick={signOut} className="btn-ghost-nav nav-signout" style={{ background: "none", cursor: "pointer" }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="btn-ghost-nav nav-signin">Sign in</Link>
              <Link href="/signup" className="btn btn-primary nav-signup" style={{ padding: "9px 16px", fontSize: 13.5 }}>Sign up</Link>
            </>
          )}
        </div>
      </div>

      <div className="nav-subbar">
        <div className="wrap nav-links">{categoryLinks}</div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-menu-links">{mobileLinks}</nav>
          <div className="mobile-menu-divider" />
          {user === undefined ? null : user ? (
            <>
              <span style={{ color: "var(--grey)", fontSize: 13.5, padding: "4px 0" }}>{user.email}</span>
              <Link href="/account/orders" className="btn btn-secondary" style={{ width: "100%", textAlign: "center", marginBottom: 8, display: "block" }}>
                My Orders
              </Link>
              <button onClick={signOut} className="btn btn-secondary" style={{ width: "100%" }}>
                Sign out
              </button>
            </>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/signin" className="btn btn-secondary" style={{ flex: 1, textAlign: "center" }}>
                Sign in
              </Link>
              <Link href="/signup" className="btn btn-primary" style={{ flex: 1, textAlign: "center" }}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}
