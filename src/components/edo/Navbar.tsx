import { Link, useRouterState } from "@tanstack/react-router";
import { useLayoutEffect, useRef, useState } from "react";

const ITEMS = [
  { to: "/", label: "Commande", exact: true },
  { to: "/evenements", label: "Évènements", exact: false },
] as const;

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeIndex = Math.max(
    0,
    ITEMS.findIndex((i) => (i.exact ? pathname === i.to : pathname.startsWith(i.to))),
  );

  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  // Measure indicator position whenever route or layout changes
  useLayoutEffect(() => {
    const measure = () => {
      const nav = navRef.current;
      const el = itemRefs.current[activeIndex];
      if (!nav || !el) return;
      const navRect = nav.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setIndicator({ left: r.left - navRect.left, width: r.width });
    };
    measure();
    // Re-measure once fonts settle
    const id = window.setTimeout(measure, 120);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", measure);
    };
  }, [activeIndex]);

  const hasIndicator = indicator.width > 0;

  return (
    <div className="relative z-[60] flex justify-center px-4 pt-3">
      <nav
        ref={navRef}
        aria-label="Navigation principale"
        className={[
          "relative flex items-center rounded-full border border-white/10 bg-black/40 p-1",
          "shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl backdrop-saturate-150",
        ].join(" ")}
      >
        {/* Sliding toggle indicator — translateX for buttery glide */}
        <span
          aria-hidden
          className="absolute top-1 bottom-1 left-0 rounded-full bg-crimson will-change-transform"
          style={{
            width: hasIndicator ? indicator.width : 0,
            transform: `translate3d(${indicator.left}px, 0, 0)`,
            transition:
              "transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1), width 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease-out",
            opacity: hasIndicator ? 1 : 0,
          }}
        />

        <div className="relative flex items-center gap-1">
          {ITEMS.map((item, i) => {
            const isActive = i === activeIndex;
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={item.exact ? { exact: true } : undefined}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className={[
                  "relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 sm:px-5",
                  isActive ? "text-crimson-foreground" : "text-cream/80 hover:text-cream",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
