import { CartProvider } from "@/context/CartContext";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Menu from "@/components/Menu";
import Signatures from "@/components/Signatures";
import Offers from "@/components/Offers";
import Reviews from "@/components/Reviews";
import OrderSection from "@/components/OrderSection";
import CartDrawer from "@/components/CartDrawer";
import { Contact, Footer } from "@/components/Contact";

export default function Home() {
  return (
    <CartProvider>
      <SmoothScroll />
      <Navbar />
      <main>
        <Hero />
        <Intro />
        <Menu />
        <Signatures />
        <Offers />
        <Reviews />
        <OrderSection />
        <Contact />
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
