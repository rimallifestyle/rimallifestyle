"use client";

import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { useUserSync } from "@/context/UserSync";
import { Trash2, Plus, Minus, CopyPlus, Info } from "lucide-react";
import { productImage } from "@/components/store/products";
import Link from "next/link";


export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, addToCart } = useUserSync();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const estDelivery = cart.length > 0 ? 50 : 0; // Flat 50 taka delivery for demo
  const taxes = cart.length > 0 ? 50 : 0; // Flat 50 taka tax for demo
  const discount = 0;
  const finalPayment = subTotal + estDelivery + taxes - discount;

  const handleDuplicate = (item: (typeof cart)[0]) => {
    addToCart(item.product, item.size, item.quantity);
  };

  const handleClearCart = () => {
    cart.forEach((item) => removeFromCart(item.id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 md:py-16">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-display uppercase tracking-widest text-gold mb-2">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground max-w-md">
              Looks like you haven't added anything to your cart yet. Discover our latest
              collections.
            </p>
            <Link
              href="/"
              className="mt-4 px-8 py-4 bg-gold hover:bg-cream text-background font-bold uppercase tracking-widest text-sm rounded-full transition-all active:scale-[0.98]"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Left Side: Cart Items List */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold uppercase tracking-widest">Carts</h1>
                  <span className="text-sm font-semibold bg-secondary px-2 py-1 rounded-full">
                    {totalItems.toString().padStart(2, "0")}
                  </span>
                </div>
                <button
                  onClick={handleClearCart}
                  className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors"
                >
                  <Trash2 className="h-4 w-4" /> Delete All
                </button>
              </div>

              <div className="space-y-6">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-row gap-4 sm:gap-6 items-start sm:items-center py-4 border-b border-border/20 border-dashed last:border-0 relative"
                  >
                    {/* Select Radio */}
                    <div className="hidden sm:flex items-center justify-center h-5 w-5 rounded-full border-2 border-gold bg-gold shrink-0">
                      <div className="h-2 w-2 rounded-full bg-background" />
                    </div>

                    {/* Image */}
                    <div className="relative h-28 w-24 sm:w-28 rounded-2xl overflow-hidden bg-secondary border border-border/30 shrink-0">
                      <div
                        className="absolute inset-0 w-full h-full transition-transform group-hover:scale-110 duration-700 bg-center"
                        style={{
                          backgroundImage: `url(${item.product.image || productImage})`,
                          backgroundPosition: item.product.bgPos || "center",
                          backgroundSize: item.product.bgSize || (item.product.image && item.product.image !== productImage ? "cover" : "300% 200%"),
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 w-full flex flex-col justify-between py-1">
                      <div className="flex flex-col gap-1.5">
                        {/* Tag */}
                        <div className="inline-block px-2.5 py-1 bg-secondary rounded-md text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground w-max mb-1">
                          {item.product.tag || item.product.category}
                        </div>

                        <Link  href={`/product/${item.product.slug || item.product.id}`}>
                          <h3 className="text-base sm:text-lg font-display font-bold leading-tight line-clamp-2 hover:text-gold transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
                        {/* Price & Attributes on same line */}
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-base sm:text-lg font-bold text-gold">
                            ৳{item.product.price.toLocaleString()}
                          </p>
                          <div className="h-4 w-px bg-border/50 hidden sm:block"></div>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                            <div className="bg-secondary/40 px-2.5 py-1.5 rounded-md border border-border/50">
                              Color: <span className="text-foreground">Default</span>
                            </div>
                            <div className="bg-secondary/40 px-2.5 py-1.5 rounded-md border border-border/50">
                              Size: <span className="text-foreground">{item.size}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions & Quantity */}
                        <div className="flex items-center gap-4 mt-2 sm:mt-0">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors p-2 rounded-md hover:bg-secondary/50 -ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          <div className="flex items-center gap-3 bg-secondary/40 rounded-lg px-2 py-1.5 border border-border/50">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="text-muted-foreground hover:text-foreground p-1"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-bold w-5 text-center">
                              {item.quantity.toString().padStart(2, "0")}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="text-muted-foreground hover:text-foreground p-1"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Summary Box */}
            <div className="w-full lg:w-[380px] shrink-0">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-8">Summary</h2>

              <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                <div className="space-y-4 text-sm font-medium border-b border-border/40 pb-6 mb-6">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Total items</span>
                    <span className="text-foreground">
                      {totalItems.toString().padStart(2, "0")} Items
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Sub total</span>
                    <span className="text-foreground font-bold">৳{subTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Est. Delivery <Info className="h-3 w-3" />
                    </span>
                    <span className="text-foreground font-bold">
                      ৳{estDelivery.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground pt-2">
                    <span>Taxes</span>
                    <span className="text-red-500 font-bold">+৳{taxes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Discount</span>
                    <span className="text-green-500 font-bold">-৳{discount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-lg font-bold mb-8">
                  <span>Final payment</span>
                  <span className="text-2xl text-gold">৳{finalPayment.toLocaleString()}</span>
                </div>

                <div className="relative mb-8">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    className="w-full bg-secondary/50 border border-border/50 rounded-full py-4 pl-6 pr-28 text-sm outline-none focus:border-gold transition-colors placeholder:text-muted-foreground"
                  />
                  <button className="absolute right-2 top-2 bottom-2 bg-foreground hover:bg-gold text-background px-6 rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
                    Apply
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center bg-foreground hover:bg-gold text-background py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-colors shadow-luxe active:scale-[0.99]"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center bg-transparent border border-border/60 hover:border-gold text-foreground hover:text-gold py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-colors active:scale-[0.99]"
                  >
                    Express Checkout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

