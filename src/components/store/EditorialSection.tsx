import { ArrowUpRight } from "lucide-react";
import { productImage, type Product } from "./products";

/**
 * Editorial magazine layout — vertical cards with big serif type,
 * asymmetric grid. Designed for the Panjabi section.
 */
export function EditorialSection({
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
  return (
    <section
      id={id}
      className="relative overflow-hidden border-y border-gold/20 bg-maroon-deep py-20 md:py-28"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-32 top-32 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -right-32 bottom-32 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="mb-14 grid gap-8 border-b border-gold/20 pb-10 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.35em] text-gold">
                {eyebrow}
              </p>
            )}
            <h2 className="font-display text-4xl leading-[1.05] text-cream md:text-6xl lg:text-7xl">
              {title.split(" ").map((w, i, arr) =>
                i === arr.length - 1 ? (
                  <em key={i} className="text-gold not-italic">
                    {w}
                  </em>
                ) : (
                  <span key={i}>{w} </span>
                ),
              )}
            </h2>
            {description && (
              <p className="mt-4 max-w-lg text-sm text-cream/70 md:text-base">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 text-cream/70">
            <span className="font-display text-5xl text-gold md:text-6xl">
              {String(products.length).padStart(2, "0")}
            </span>
            <div className="text-[10px] uppercase tracking-[0.25em]">
              Pieces in
              <br />
              collection
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <a
              key={p.id}
              href="#"
              className="group block"
              style={{ marginTop: i % 3 === 1 ? "3rem" : undefined }}
            >
              <div className="relative overflow-hidden rounded-md">
                <div
                  className="aspect-[3/4] w-full transition-transform duration-[900ms] group-hover:scale-[1.05]"
                  style={{
                    backgroundImage: `url(${p.image ?? productImage})`,
                    backgroundSize: "300% 200%",
                    backgroundPosition: p.bgPos,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/60 to-transparent opacity-0 transition group-hover:opacity-100" />
                {p.tag && (
                  <span className="absolute left-4 top-4 bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-foreground">
                    {p.tag}
                  </span>
                )}
                <div className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-cream text-maroon-deep opacity-0 shadow-luxe transition-all group-hover:opacity-100">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="font-display text-xs text-gold">
                    N° {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1 font-display text-2xl leading-tight text-cream transition group-hover:text-gold">
                    {p.name}
                  </h3>
                  {p.description && (
                    <p className="mt-2 text-xs text-cream/60 md:text-sm">{p.description}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-cream/50">From</div>
                  <div className="font-display text-xl text-gold">${p.price}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
