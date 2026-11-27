import { Truck, ShieldCheck, RotateCcw, Sparkles } from "lucide-react";

const items = [
  { icon: Truck, title: "Free shipping", sub: "On orders over $150" },
  { icon: RotateCcw, title: "30-day returns", sub: "Hassle-free exchange" },
  { icon: ShieldCheck, title: "Secure checkout", sub: "Encrypted payments" },
  { icon: Sparkles, title: "Handcrafted", sub: "Limited production runs" },
];

export function FeatureStrip() {
  return (
    <section className="border-t border-border/40 bg-background py-6 sm:py-8">
      <div className="grid w-full grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 md:px-8 lg:px-12 xl:px-16">
        {items.map((f) => (
          <div key={f.title} className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold">
              <f.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg">{f.title}</div>
              <div className="text-xs text-muted-foreground">{f.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
