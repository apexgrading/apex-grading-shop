import "./globals.css";
import { CartProvider } from "../lib/cart-context";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export const metadata = {
  title: "Apex Cards",
  description: "Graded trading and sports cards, sold direct — graded in-house by Apex Grading Company.",
  verification: {
    google: "UncIGpd0yQlzwfQyNGME1IgMq2vb5JUwvN0RRQ1TiMg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Nav />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
