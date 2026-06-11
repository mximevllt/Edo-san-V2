import { Link } from "@tanstack/react-router";

export function Navbar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center px-4">
      <nav
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl backdrop-saturate-150"
        aria-label="Navigation principale"
      >
        <Link
          to="/"
          activeOptions={{ exact: true }}
          className="rounded-full px-4 py-2 text-sm font-medium text-cream/80 transition hover:text-cream sm:px-5"
          activeProps={{ className: "bg-crimson text-crimson-foreground hover:text-crimson-foreground" }}
        >
          Commande
        </Link>
        <Link
          to="/evenements"
          className="rounded-full px-4 py-2 text-sm font-medium text-cream/80 transition hover:text-cream sm:px-5"
          activeProps={{ className: "bg-crimson text-crimson-foreground hover:text-crimson-foreground" }}
        >
          Évènements
        </Link>
      </nav>
    </div>
  );
}
