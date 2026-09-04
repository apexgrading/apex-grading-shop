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

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, [pathname]);

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    router.refresh();
  }

  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link href="/" className="nav-mark">
          <img src="/assets/apex-logo.jpg" alt="Apex Grading" />
        </Link>
        <nav className="nav-links">
          <Link href="/shop" className={pathname.startsWith("/shop") ? "active" : ""}>
            Shop
          </Link>
          <Link href="/#how">Sell to us</Link>
          <Link href="/#scale">Population report</Link>
          <a href="https://www.apexgradingcompany.com" target="_blank" rel="noopener noreferrer">
            Main site ↗
          </a>
        </nav>
        <div className="nav-actions">
          <Link href="/cart" className="cart-link">
            Cart
            {items.length > 0 && <span className="cart-badge">{items.length}</span>}
          </Link>
          {user === undefined ? null : user ? (
            <>
              <span style={{ color: "var(--grey)", fontSize: 13.5 }}>{user.email}</span>
              <button onClick={signOut} className="btn-ghost-nav" style={{ background: "none", cursor: "pointer" }}>
                Sign out
              </button>
            </>
          ) : (
            <Link href="/signin" className="btn-ghost-nav">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
