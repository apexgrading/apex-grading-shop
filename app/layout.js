import "./globals.css";
import { CartProvider } from "../lib/cart-context";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export const metadata = {
  title: "Apex Grading Company",
  description: "Graded trading and sports cards, sold direct from the grader.",
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
