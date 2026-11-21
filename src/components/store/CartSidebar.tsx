import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { useUserSync } from "@/context/UserSync";
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";
import { productImage } from "./products";
import Link from "next/link";

export function CartSidebar() {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, updateQuantity } = useUserSync();

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-card/95 backdrop-blur-2xl border-l border-border/50 p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="p-6 border-b border-border/30 flex flex-row items-center justify-between sticky top-0 bg-card/50 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="bg-gold/10 p-2 rounded-xl text-gold">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <SheetTitle className="font-display tracking-widest uppercase text-xl text-foreground m-0">
              Your Cart
            </SheetTitle>
          </div>
          {/* Custom Close Button for modern feel */}
          <SheetClose className="rounded-full p-2 bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors outline-none">
            <X className="h-4 w-4" />
          </SheetClose>
        </SheetHeader>

        {/* Cart Items Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                {/* Item Image */}
                <div className="relative h-24 w-20 rounded-xl overflow-hidden bg-secondary border border-border/30 flex-shrink-0">
                  <div
                    className="absolute inset-0 w-full h-full transition-transform group-hover:scale-105 duration-500 bg-center"
                    style={{
                      backgroundImage: `url(${item.product.image || productImage})`,
                      backgroundPosition: item.product.bgPos || "center",
                      backgroundSize: item.product.bgSize || (item.product.image && item.product.image !== productImage ? "cover" : "300% 200%"),
                    }}
                  />
                </div>

                {/* Item Details */}
                <div className="flex flex-col flex-1 py-1 justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-red-400 transition-colors mt-0.5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 bg-secondary/50 border border-border/50 rounded-lg px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="font-bold text-gold text-sm">
                      ৳{item.product.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70 space-y-4">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm font-medium">Your cart is empty.</p>
            </div>
          )}
        </div>

        {/* Footer Checkout Area */}
        <div className="p-6 border-t border-border/30 bg-secondary/30 backdrop-blur-md">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-muted-foreground font-medium">
              <span>Subtotal</span>
              <span>৳{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground font-medium">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="h-px w-full bg-border/50 my-2" />
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>Total</span>
              <span>৳{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/cart"
              onClick={() => setIsCartOpen(false)}
              className="w-full flex items-center justify-center bg-card hover:bg-secondary text-foreground font-bold uppercase tracking-widest text-xs py-4 rounded-xl border border-border/60 transition-all active:scale-[0.98]"
            >
              View Cart
            </Link>
            <Link href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full flex items-center justify-center bg-gold hover:bg-cream text-background font-bold uppercase tracking-widest text-xs py-4 rounded-xl transition-all active:scale-[0.98] shadow-[0_4px_14px_rgba(234,179,8,0.2)]"
            >
              Checkout Now
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

