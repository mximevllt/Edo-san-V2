import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/data/menu";
import logo from "@/assets/edo-logo.png.asset.json";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function CategoryNav({ onOpenCart }: { onOpenCart: () => void }) {
  const [active, setActive] = useState(CATEGORIES[0].id);
  const navRef = useRef<HTMLDivElement>(null);
  const { count } = useCart();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    CATEGORIES.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const btn = navRef.current?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sticky top-0 z-40 border-b border-cream/10 bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-3 lg:px-8">
        <a href="#top" className="flex shrink-0 items-center gap-2">
          <img src={logo.url} alt="Edo-San Sushi" className="h-9 w-9 object-contain" />
          <span className="hidden font-display text-lg text-cream sm:inline">Edo-San</span>
        </a>
        <div
          ref={navRef}
          className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto"
        >
          {CATEGORIES.map((c) => {
            const isActive = active === c.id;
            return (
              <button
                key={c.id}
                data-cat={c.id}
                onClick={() => scrollTo(c.id)}
                className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-crimson text-crimson-foreground"
                    : "text-muted-foreground hover:bg-white/5 hover:text-cream"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onOpenCart}
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink-elevated text-cream lg:hidden"
          aria-label="Ouvrir le panier"
        >
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-crimson px-1 text-[11px] font-semibold text-crimson-foreground">
              {count}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
