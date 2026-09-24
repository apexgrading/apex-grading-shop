"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { COOKIE_CONSENT_EVENT } from "./CookieConsent";

const STORAGE_KEY = "apex-cookie-consent-v2";
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    function checkConsent() {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        setConsented(stored?.choice === "accepted");
      } catch {
        setConsented(false);
      }
    }
    checkConsent();
    // Fires when the visitor responds to the cookie banner this session, so GA can
    // start (or stay off) without needing a page reload.
    window.addEventListener(COOKIE_CONSENT_EVENT, checkConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, checkConsent);
  }, []);

  if (!GA_MEASUREMENT_ID || !consented) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
