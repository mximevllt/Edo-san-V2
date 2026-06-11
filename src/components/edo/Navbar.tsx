import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

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

  const [atTop, setAtTop] = useState(true);
  const [hover, setHover] = useState(false);
  // "forced open" after the user taps the shrunk pill — stays open until they scroll down again
  const [forcedOpen, setForcedOpen] = useState(false);
  const lastScrollY = useRef(0);

  const expanded = atTop || hover || forcedOpen;

  // Track scroll position + direction
  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastScrollY.current + 2;
      setAtTop(y < 8);
      if (goingDown && y > 24) setForcedOpen(false);
      lastScrollY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Measure indicator position whenever layout (expanded state / active route) changes
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
    const id = window.setTimeout(measure, 320); // re-measure after transition
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", measure);
    };
  }, [activeIndex, expanded]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center px-4">
      <nav
        ref={navRef}
        aria-label="Navigation principale"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => {
          if (!expanded) setForcedOpen(true);
        }}
        onTouchStart={() => {
          if (!expanded) setForcedOpen(true);
        }}
        className={[
          "pointer-events-auto relative flex items-center rounded-full border border-white/10 bg-black/40",
          "shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl backdrop-saturate-150",
          "transition-[padding,height,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          expanded ? "p-1" : "p-0 cursor-pointer",
        ].join(" ")}
        style={{ height: expanded ? 44 : 8 }}
      >
        {/* Sliding indicator */}
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-full bg-crimson transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            left: indicator.left,
            width: indicator.width,
            opacity: expanded && indicator.width > 0 ? 1 : 0,
          }}
        />

        <div
          className={[
            "relative flex items-center gap-1 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            expanded ? "max-w-[420px] opacity-100" : "max-w-0 opacity-0",
          ].join(" ")}
        >
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
