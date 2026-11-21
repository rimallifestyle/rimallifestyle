import { ArrowUpRight } from "lucide-react";
import { productImage, type Product } from "./products";

/**
 * Feature split — big hero card on the left with description,
 * 2x2 grid of cards on the right. Designed for the Jackets section.
 */
export function FeatureSplitSection({
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
  const [hero, ...rest] = products;
  const grid = rest.slice(0, 4);

  return (
    <section id={id} className="border-t border-border/40 bg-maroon-deep/30 py-20 md:py-28">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
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
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Big feature card */}
          {hero && (
            <a
              href="#"
              className="group relative flex min-h-[540px] flex-col justify-end overflow-hidden rounded-xl border border-gold/30 shadow-luxe"
            >
              <div
                className="absolute inset-0 transition-transform duration-[1000ms] group-hover:scale-[1.05]"
                style={{
                  backgroundImage: `url(${hero.image ?? productImage})`,
                  backgroundSize: "300% 200%",
                  backgroundPosition: hero.bgPos,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep via-maroon-deep/60 to-maroon-deep/10" />
              {hero.tag && (
                <span className="absolute left-6 top-6 rounded-full bg-gold px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-accent-foreground">
                  {hero.tag}
                </span>
              )}
              <div className="relative p-6 md:p-10">
                <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-gold">
                  The Signature Piece
                </p>
                <h3 className="mt-3 font-display text-4xl leading-tight text-cream md:text-5xl">
                  {hero.name}
                </h3>
                {hero.description && (
                  <p className="mt-4 max-w-md text-sm text-cream/80 md:text-base">
                    {hero.description}
                  </p>
                )}
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-cream/60">
                      From
                    </div>
                    <div className="font-display text-3xl text-gold">${hero.price}</div>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-foreground hover:bg-cream">
                    Explore the piece <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </a>
          )}

          {/* 2x2 grid */}
          <div className="grid grid-cols-2 gap-5">
            {grid.map((p) => (
              <a
                key={p.id}
                href="#"
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40 transition hover:border-gold/60 hover:bg-card/70"
              >
                <div className="relative overflow-hidden">
                  <div
                    className="aspect-square w-full transition-transform duration-[900ms] group-hover:scale-[1.08]"
                    style={{
                      backgroundImage: `url(${p.image ?? productImage})`,
                      backgroundSize: "300% 200%",
                      backgroundPosition: p.bgPos,
                    }}
                  />
                  {p.tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-maroon-deep">
                      {p.tag}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <h4 className="font-display text-base leading-tight transition group-hover:text-gold">
                      {p.name}
                    </h4>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Outerwear
                    </p>
                  </div>
                  <span className="font-display text-lg text-gold">${p.price}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
