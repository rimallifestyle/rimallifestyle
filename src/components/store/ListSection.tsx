import { ArrowUpRight, Star } from "lucide-react";
import { productImage, type Product } from "./products";

/**
 * List section — big image on the left, numbered product list on the right.
 * Designed for the Polo section.
 */
export function ListSection({
  eyebrow,
  title,
  description,
  products,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  products: Product[];
  id?: string;
}) {
  const feature = products[0];

  return (
    <section
      id={id}
      className="relative border-t border-border/40 bg-gradient-to-b from-background via-maroon-deep/40 to-background py-20 md:py-28"
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            {eyebrow && (
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.35em] text-gold">
                {eyebrow}
              </p>
            )}
            <h2 className="font-display text-3xl md:text-5xl">{title}</h2>
            {description && (
              <p className="mt-3 text-sm text-muted-foreground md:text-base">{description}</p>
            )}
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2 border-b border-gold/60 pb-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-gold hover:border-gold"
          >
            View all polos <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {/* Feature image */}
          {feature && (
            <a
              href="#"
              className="group relative block overflow-hidden rounded-xl border border-border/60 shadow-luxe"
            >
              <div
                className="aspect-[4/5] w-full transition-transform duration-[900ms] group-hover:scale-[1.05]"
                style={{
                  backgroundImage: `url(${feature.image ?? productImage})`,
                  backgroundSize: "300% 200%",
                  backgroundPosition: feature.bgPos,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep via-transparent to-transparent" />
              <div className="absolute left-6 top-6 rounded-full border border-cream/40 bg-maroon-deep/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-cream backdrop-blur-sm">
                #1 Bestselling polo
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <h3 className="font-display text-3xl text-cream md:text-4xl">{feature.name}</h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-display text-2xl text-gold">
                    ৳{feature.price.toLocaleString()}
                  </span>
                  <button className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-foreground hover:bg-cream">
                    Shop feature
                  </button>
                </div>
              </div>
            </a>
          )}

          {/* Numbered list */}
          <ol className="flex flex-col divide-y divide-border/40">
            {products.map((p, i) => (
              <li key={p.id}>
                <a href="#" className="group flex items-center gap-5 py-5 transition hover:pl-2">
                  <span className="font-display text-3xl text-gold/70 md:text-4xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div
                    className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-secondary transition-transform group-hover:scale-105 md:h-24 md:w-20"
                    style={{
                      backgroundImage: `url(${p.image ?? productImage})`,
                      backgroundSize: "300% 200%",
                      backgroundPosition: p.bgPos,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display text-lg leading-tight transition group-hover:text-gold md:text-xl">
                      {p.name}
                    </h4>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      {p.rating && (
                        <span className="flex items-center gap-1 text-gold">
                          <Star className="h-3 w-3 fill-current" />
                          {p.rating.toFixed(1)}
                        </span>
                      )}
                      {p.reviews && <span>({p.reviews} reviews)</span>}
                      {p.tag && <span className="text-gold">· {p.tag}</span>}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-display text-lg text-gold">${p.price}</div>
                    <div className="mt-1 flex justify-end">
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-gold" />
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
