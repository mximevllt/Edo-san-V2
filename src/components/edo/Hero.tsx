import { motion } from "framer-motion";
import hero from "@/assets/hero-sushi.jpg";
import { CustomerAccess } from "@/components/edo/CustomerAccess";

const logo = "/edo-assets/01-Logo-Edo-San-Sushi-blanc.png";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-cream/10">
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <CustomerAccess className="absolute right-4 top-24 z-20 hidden lg:flex lg:right-8 lg:top-36" />
      <div className="relative mx-auto grid max-w-[1500px] gap-10 px-4 py-16 md:py-24 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col justify-center"
        >
          <div className="mb-6 flex items-center gap-3">
            <img src={logo} alt="" aria-hidden className="h-10 w-10 object-contain" />
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Cotignac · Le Val</span>
          </div>
          <h1 className="font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] text-cream">
            Edo-San
            <br />
            <span className="text-crimson">Sushi</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">Sushis frais et artisanaux</p>
          <CustomerAccess className="mt-7 flex lg:hidden" />
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-crimson animate-crimson-pulse" />
            </div>
            <div className="hidden h-4 w-px bg-cream/20 sm:block" />
            <span>Ouverts du Mardi au Dimanche</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-cream/10 bg-ink-elevated">
            <img
              src={hero}
              alt="Plateau de sushi premium Edo-San"
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-ink/60 via-transparent to-transparent" />
          </div>
          <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-crimson/20 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
