import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CartProvider } from "@/lib/cart-context";
import { CustomerProvider } from "@/lib/supabase/auth-context";
import { Hero } from "@/components/edo/Hero";
import { CategoryNav } from "@/components/edo/CategoryNav";
import { ProductCard } from "@/components/edo/ProductCard";
import { DesktopCart, MobileCart } from "@/components/edo/Cart";
import { Navbar } from "@/components/edo/Navbar";
import { AutoMixInfo } from "@/components/edo/AutoMixInfo";
import { AlertTriangle } from "lucide-react";
import {
  adminStoreEvent,
  buildClientCategories,
  createDefaultAdminStore,
  isClosureActive,
  readPublishedAdminStore,
  type AdminStoreState,
  type ClosureState,
} from "@/lib/admin-store";

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
        content: "Sushis frais et artisanaux.",
      },
    ],
  }),
  component: Index,
});

const closureDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatClosureDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return closureDateFormatter.format(new Date(year, month - 1, day));
}

function formatReopeningDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + 1);
  return closureDateFormatter.format(date);
}

function Index() {
  const [cartOpen, setCartOpen] = useState(false);
  const [autoRequestKey, setAutoRequestKey] = useState(0);
  const [store, setStore] = useState<AdminStoreState>(() => createDefaultAdminStore());

  useEffect(() => {
    const refreshStore = () => setStore(readPublishedAdminStore());
    refreshStore();
    window.addEventListener("storage", refreshStore);
    window.addEventListener(adminStoreEvent, refreshStore);
    return () => {
      window.removeEventListener("storage", refreshStore);
      window.removeEventListener(adminStoreEvent, refreshStore);
    };
  }, []);

  const menuCategories = useMemo(() => buildClientCategories(store), [store]);

  const openAutoOrder = () => {
    setAutoRequestKey((key) => key + 1);
    setCartOpen(true);
  };

  if (store.paused) {
    return <PauseScreen />;
  }

  if (isClosureActive(store.closure)) {
    return <ClosureScreen closure={store.closure} />;
  }

  return (
    <CustomerProvider>
      <CartProvider>
        <div className="min-h-screen max-w-full bg-ink">
        <div className="grid items-start lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px]">
          <main className="min-w-0 w-full max-w-full">
            <Navbar />
            <Hero />
            <CategoryNav onOpenCart={() => setCartOpen(true)} categories={menuCategories} />

            <div className="mx-auto max-w-[1100px] px-4 py-12 lg:px-8">
              <AutoMixInfo
                onStart={openAutoOrder}
                wrapperClassName="mb-10 lg:hidden"
                buttonClassName="py-4 text-sm"
              />

              {menuCategories.map((cat) => {
                const isThursday = new Date().getDay() === 4;
                const visibleItems = cat.items.filter((p) => !p.thursdayOnly || isThursday);
                if (visibleItems.length === 0) return null;
                return (
                  <section key={cat.id} id={cat.id} className="scroll-mt-nav mb-16 last:mb-8">
                    <div className="mb-6 flex items-end justify-between gap-4">
                      <h2 className="font-display text-3xl text-cream md:text-4xl">{cat.label}</h2>
                      <span className="text-sm text-muted-foreground">
                        {visibleItems.length} produit{visibleItems.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
                      {visibleItems.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  </section>
                );
              })}

              <footer className="mt-20 border-t border-cream/10 pt-8 pb-32 text-sm text-muted-foreground lg:pb-8">
                <p className="font-display text-2xl text-cream">Edo-San Sushi</p>
                <p className="mt-2 max-w-md">
                  Maison de sushi artisanale. Préparé chaque jour avec des poissons sélectionnés et un riz koshihikari
                  cuit à la minute.
                </p>
                <p className="mt-4">© {new Date().getFullYear()} Edo-San — Tous droits réservés.</p>
              </footer>
            </div>
          </main>

          <DesktopCart />
        </div>
        <MobileCart
          open={cartOpen}
          onOpen={() => setCartOpen(true)}
          onClose={() => setCartOpen(false)}
          autoRequestKey={autoRequestKey}
        />
        </div>
      </CartProvider>
    </CustomerProvider>
  );
}

function PauseScreen() {
  return (
    <main className="min-h-screen bg-ink px-4 py-8 text-cream">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center text-center">
        <img src="/edo-assets/01-Logo-Edo-San-Sushi-blanc.png" alt="Edo-San Sushi" className="h-24 w-24 object-contain" />
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#f4a23d]/35 bg-[#f4a23d]/10 px-4 py-2 text-sm font-semibold text-[#f4a23d]">
          <AlertTriangle className="h-4 w-4" />
          Commandes momentanément en pause
        </div>
        <h1 className="mt-6 font-display text-4xl leading-tight text-cream md:text-6xl">
          Nous revenons vite.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          L'équipe Edo-San suspend les commandes quelques instants pour garder un service fluide et des préparations impeccables.
          Merci pour votre patience, la boutique rouvrira dès que possible.
        </p>
        <a href="/admin" className="mt-8 inline-flex items-center justify-center rounded-full border border-cream/15 bg-ink-elevated px-5 py-3 text-sm font-semibold text-cream transition hover:border-crimson">
          Accès back-office
        </a>
      </div>
    </main>
  );
}

function ClosureScreen({ closure }: { closure: ClosureState | null }) {
  if (!closure) return null;

  return (
    <main className="min-h-screen bg-ink px-4 py-8 text-cream">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center text-center">
        <img src="/edo-assets/01-Logo-Edo-San-Sushi-blanc.png" alt="Edo-San Sushi" className="h-24 w-24 object-contain" />
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#f4a23d]/35 bg-[#f4a23d]/10 px-4 py-2 text-sm font-semibold text-[#f4a23d]">
          <AlertTriangle className="h-4 w-4" />
          Fermeture exceptionnelle
        </div>
        <h1 className="mt-6 font-display text-4xl leading-tight text-cream md:text-6xl">
          Edo-San Sushi fait une courte pause.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          La boutique est fermée du {formatClosureDate(closure.start)} au {formatClosureDate(closure.end)} inclus.
          Nous serons heureux de vous retrouver dès le {formatReopeningDate(closure.end)} pour vos prochaines commandes.
        </p>
        {closure.reason && (
          <p className="mt-4 rounded-2xl border border-cream/10 bg-ink-elevated px-4 py-3 text-sm text-muted-foreground">
            {closure.reason}
          </p>
        )}
        <a
          href="/admin"
          className="mt-8 inline-flex items-center justify-center rounded-full border border-cream/15 bg-ink-elevated px-5 py-3 text-sm font-semibold text-cream transition hover:border-crimson"
        >
          Accès back-office
        </a>
      </div>
    </main>
  );
}
