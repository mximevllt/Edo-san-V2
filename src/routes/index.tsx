import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CartProvider } from "@/lib/cart-context";
import { CATEGORIES } from "@/data/menu";
import { Hero } from "@/components/edo/Hero";
import { CategoryNav } from "@/components/edo/CategoryNav";
import { ProductCard } from "@/components/edo/ProductCard";
import { DesktopCart, MobileCart } from "@/components/edo/Cart";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Edo-San Sushi — Artisanal Sushi, Crafted to Order" },
      {
        name: "description",
        content:
          "Sushi artisanal de qualité premium, préparé à la commande et livré chez vous. Découvrez nos plateaux, special rolls, ramen et bien plus.",
      },
      { property: "og:title", content: "Edo-San Sushi" },
      {
        property: "og:description",
        content: "Artisanal Sushi, Crafted to Order, Delivered to Your Door.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <CartProvider>
      <div className="min-h-screen max-w-full bg-ink">
        <div className="grid items-start lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px]">
          <main className="min-w-0 w-full max-w-full">
            <Hero />
            <CategoryNav onOpenCart={() => setCartOpen(true)} />

            <div className="mx-auto max-w-[1100px] px-4 py-12 lg:px-8">
              {CATEGORIES.map((cat) => (
                <section
                  key={cat.id}
                  id={cat.id}
                  className="scroll-mt-nav mb-16 last:mb-8"
                >
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <h2 className="font-display text-3xl text-cream md:text-4xl">
                      {cat.label}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {cat.items.length} produit{cat.items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
                    {cat.items.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </section>
              ))}

              <footer className="mt-20 border-t border-cream/10 pt-8 pb-32 text-sm text-muted-foreground lg:pb-8">
                <p className="font-display text-2xl text-cream">Edo-San Sushi</p>
                <p className="mt-2 max-w-md">
                  Maison de sushi artisanale. Préparé chaque jour avec des poissons sélectionnés
                  et un riz koshihikari cuit à la minute.
                </p>
                <p className="mt-4">© {new Date().getFullYear()} Edo-San — Tous droits réservés.</p>
              </footer>
            </div>
          </main>

          <DesktopCart />
        </div>
        <MobileCart open={cartOpen} onOpen={() => setCartOpen(true)} onClose={() => setCartOpen(false)} />
      </div>
    </CartProvider>
  );
}
