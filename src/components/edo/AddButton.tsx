import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/data/menu";

export function AddButton({ product }: { product: Product }) {
  const { add, setQty, quantityOf } = useCart();
  const qty = quantityOf(product.id);

  return (
    <div className="relative h-11 min-w-11">
      <AnimatePresence mode="wait" initial={false}>
        {qty === 0 ? (
          <motion.button
            key="add"
            type="button"
            onClick={() => add(product)}
            aria-label={`Ajouter ${product.name}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            whileTap={{ scale: 0.9 }}
            className="grid h-11 w-11 place-items-center rounded-full bg-crimson text-crimson-foreground crimson-glow transition-transform hover:scale-110"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </motion.button>
        ) : (
          <motion.div
            key="counter"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 480, damping: 26 }}
            className="flex h-11 items-center gap-1 rounded-full bg-crimson pl-1 pr-1 text-crimson-foreground crimson-glow"
          >
            <button
              type="button"
              onClick={() => setQty(product.id, qty - 1)}
              aria-label="Retirer"
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/15"
            >
              <Minus className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <motion.span
              key={qty}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 24 }}
              className="min-w-6 text-center text-sm font-semibold tabular-nums"
            >
              {qty}
            </motion.span>
            <button
              type="button"
              onClick={() => add(product)}
              aria-label="Ajouter"
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/15"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
