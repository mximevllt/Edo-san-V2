import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const AUTO_MIX_DESCRIPTION =
  "Auto-mix vous aide à composer une commande complète sans avoir à tout choisir vous-même. Vous indiquez le nombre de personnes, les goûts, les aliments à éviter, l'appétit et le budget. Le site prépare alors une proposition équilibrée avec des sushis et plats adaptés. Rien n'est imposé : une fois le panier rempli, vous pouvez retirer ce qui ne vous plaît pas, changer les quantités ou ajouter d'autres articles.";

export function AutoMixInfo({
  onStart,
  wrapperClassName,
  buttonClassName,
}: {
  onStart: () => void;
  wrapperClassName?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("w-full", wrapperClassName)}>
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className={cn(
            "jeudi-box flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-crimson px-5 py-3 font-subtitle text-xs uppercase tracking-wider text-crimson-foreground crimson-glow",
            buttonClassName,
          )}
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">Auto-mix</span>
        </motion.button>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Masquer l'explication Auto-mix" : "Afficher l'explication Auto-mix"}
          onClick={() => setOpen((value) => !value)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cream/20 bg-ink text-cream transition hover:border-crimson hover:text-crimson"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -6 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="overflow-hidden"
          >
            <p className="mt-3 rounded-2xl border border-cream/10 bg-ink-elevated px-4 py-3 text-left text-xs leading-relaxed text-muted-foreground">
              {AUTO_MIX_DESCRIPTION}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
