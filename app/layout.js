
import "./globals.css";
import { CartProvider } from "../lib/cart-context";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import AnnouncementBanner from "../components/AnnouncementBanner";
import CookieConsent from "../components/CookieConsent";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import AddToHomeScreenPrompt from "../components/AddToHomeScreenPrompt";
import TawkChat from "../components/TawkChat";
import GoogleAnalytics from "../components/GoogleAnalytics";

export const metadata = {
  title: "Shop APEX Cards",
  description: "Apex-graded slabs, Gem Mint 10 Mystery Slabs, raw cards, ETBs, booster boxes and merch — slabs graded in-house by Apex Grading Company.",
  verification: {
    google: "UncIGpd0yQlzwfQyNGME1IgMq2vb5JUwvN0RRQ1TiMg",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shop APEX Cards",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <AnnouncementBanner />
          <Nav />
          {children}
          <Footer />
          <CookieConsent />
          <ServiceWorkerRegister />
          <AddToHomeScreenPrompt />
          <TawkChat />
          <GoogleAnalytics />
        </CartProvider>
      </body>
    </html>
  );
}
