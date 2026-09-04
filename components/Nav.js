"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../lib/cart-context";

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

  const links = (
    <>
      <Link href="/shop" className={pathname.startsWith("/shop") ? "active" : ""}>
        Shop
      </Link>
      <Link href="/sold" className={pathname.startsWith("/sold") ? "active" : ""}>
        Sold
      </Link>
      <Link href="/#how">Sell to us</Link>
      <Link href="/#scale">Population report</Link>
      <a href="https://www.apexgradingcompany.com" target="_blank" rel="noopener noreferrer">
        Main site ↗
      </a>
    </>
  );

  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link href="/" className="nav-mark">
          <img src="/assets/apex-logo.jpg" alt="Apex Grading" />
        </Link>
        <nav className="nav-links">{links}</nav>
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
              <button onClick={signOut} className="btn-ghost-nav nav-signout" style={{ background: "none", cursor: "pointer" }}>
                Sign out
              </button>
            </>
          ) : (
            <Link href="/signin" className="btn-ghost-nav nav-signin">Sign in</Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-menu-links">{links}</nav>
          <div className="mobile-menu-divider" />
          {user === undefined ? null : user ? (
            <>
              <span style={{ color: "var(--grey)", fontSize: 13.5, padding: "4px 0" }}>{user.email}</span>
              <button onClick={signOut} className="btn btn-secondary" style={{ width: "100%" }}>
                Sign out
              </button>
            </>
          ) : (
            <Link href="/signin" className="btn btn-secondary" style={{ width: "100%", textAlign: "center" }}>
              Sign in
            </Link>
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
