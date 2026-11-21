import { Plus, Heart } from "lucide-react";
import { productImage, type Product } from "./products";

/**
 * Bento grid — mixed-size tiles (1 large + 4 small).
 * Designed for the Hats section.
 */
export function BentoSection({
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
  const small = rest.slice(0, 5);

  return (
    <section id={id} className="border-t border-border/40 bg-background py-20 md:py-28">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="mb-10 max-w-2xl">
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

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2 md:gap-5">
          {/* Hero tile */}
          {hero && (
            <a
              href="#"
              className="group relative col-span-2 row-span-2 overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-secondary to-maroon-deep shadow-luxe"
            >
              <div
                className="h-full min-h-[380px] w-full transition-transform duration-[900ms] group-hover:scale-[1.05]"
                style={{
                  backgroundImage: `url(${hero.image ?? productImage})`,
                  backgroundSize: "300% 200%",
                  backgroundPosition: hero.bgPos,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep via-maroon-deep/30 to-transparent" />
              {hero.tag && (
                <span className="absolute left-5 top-5 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-foreground">
                  {hero.tag}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
                  Featured
                </p>
                <h3 className="mt-2 font-display text-2xl text-cream md:text-4xl">{hero.name}</h3>
                <div className="mt-4 flex items-end justify-between">
                  <span className="font-display text-2xl text-gold">${hero.price}</span>
                  <button className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-maroon-deep transition hover:bg-gold">
                    Shop now
                  </button>
                </div>
              </div>
            </a>
          )}

          {/* Small tiles */}
          {small.map((p) => (
            <a
              key={p.id}
              href="#"
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-secondary transition hover:border-gold/60 hover:shadow-luxe"
            >
              <div
                className="aspect-square w-full transition-transform duration-[900ms] group-hover:scale-[1.08]"
                style={{
                  backgroundImage: `url(${p.image ?? productImage})`,
                  backgroundSize: "300% 200%",
                  backgroundPosition: p.bgPos,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/95 via-maroon-deep/20 to-transparent" />
              {p.tag && (
                <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-maroon-deep">
                  {p.tag}
                </span>
              )}
              <button
                aria-label="Add"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-cream/90 text-maroon-deep opacity-0 transition group-hover:opacity-100 hover:bg-gold"
              >
                <Plus className="h-4 w-4" />
              </button>
              <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                <h4 className="font-display text-base leading-tight text-cream">{p.name}</h4>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-gold">${p.price}</span>
                  <Heart className="h-4 w-4 text-cream/60 transition hover:text-gold" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
