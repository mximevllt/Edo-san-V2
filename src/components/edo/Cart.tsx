import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart, formatPrice } from "@/lib/cart-context";
import { ADDONS } from "@/data/menu";
import { Checkout } from "./Checkout";

function CartBody({ onCheckout }: { onCheckout: () => void }) {
  const { items, add, setQty, remove, total } = useCart();
  const DELIVERY = 3.5;
  const subtotal = total;
  const grand = items.length > 0 ? subtotal + DELIVERY : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-cream/10 px-6 py-5">
        <h2 className="font-display text-2xl text-cream">Mon panier</h2>
        <span className="text-sm text-muted-foreground">
          {items.reduce((a, i) => a + i.quantity, 0)} article{items.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <p className="text-cream">Votre panier est vide</p>
            <p className="text-sm text-muted-foreground">
              Composez votre commande, elle apparaîtra ici.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, x: 30, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="flex gap-3 rounded-xl border border-cream/10 bg-ink p-3"
                >
                  <img
                    src={item.product.image}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-cream">{item.product.name}</p>
                      <button
                        onClick={() => remove(item.product.id)}
                        className="text-muted-foreground transition hover:text-crimson"
                        aria-label="Retirer du panier"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-cream/15">
                        <button
                          onClick={() => setQty(item.product.id, item.quantity - 1)}
                          className="grid h-7 w-7 place-items-center rounded-full text-cream transition hover:bg-white/10"
                          aria-label="Moins"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-sm tabular-nums text-cream">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => add(item.product)}
                          className="grid h-7 w-7 place-items-center rounded-full text-cream transition hover:bg-white/10"
                          aria-label="Plus"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-display text-base text-cream">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <div className="border-t border-cream/10 px-6 pt-4">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Dernière minute
        </p>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto pb-3">
          {ADDONS.map((a) => (
            <button
              key={a.id}
              onClick={() => add(a)}
              className="group flex shrink-0 items-center gap-2 rounded-full border border-cream/15 bg-ink py-1 pl-1 pr-3 transition hover:border-crimson"
            >
              <img src={a.image} alt="" className="h-8 w-8 rounded-full object-cover" />
              <div className="text-left">
                <p className="text-xs font-medium text-cream">{a.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  + {formatPrice(a.price)}
                </p>
              </div>
              <Plus className="h-3.5 w-3.5 text-crimson transition group-hover:scale-125" />
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-cream/10 bg-ink px-6 py-5">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Sous-total</span>
            <span className="text-cream">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Livraison</span>
            <span className="text-cream">{items.length > 0 ? formatPrice(DELIVERY) : "—"}</span>
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between border-t border-cream/10 pt-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-display text-3xl text-cream">{formatPrice(grand)}</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={items.length === 0}
          onClick={onCheckout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-crimson py-4 font-subtitle text-base uppercase tracking-wider text-crimson-foreground transition disabled:cursor-not-allowed disabled:opacity-40 enabled:animate-crimson-pulse enabled:crimson-glow"
        >
          Valider ma commande
        </motion.button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Paiement sécurisé · Livraison 25–35 min
        </p>
      </div>
    </div>
  );
}

function CartOrCheckout() {
  const [view, setView] = useState<"cart" | "checkout">("cart");
  return (
    <div className="relative h-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {view === "cart" ? (
          <motion.div
            key="cart"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute inset-0 overflow-y-auto"
          >
            <CartBody onCheckout={() => setView("checkout")} />
          </motion.div>
        ) : (
          <div key="checkout" className="absolute inset-0">
            <Checkout onBack={() => setView("cart")} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DesktopCart() {
  return (
    <aside className="sticky top-6 hidden h-[calc(100vh-120px)] overflow-hidden border-l border-cream/10 bg-ink-elevated lg:block">
      <CartOrCheckout />
    </aside>
  );
}

export function MobileCart({ open, onOpen, onClose }: { open: boolean; onOpen: () => void; onClose: () => void }) {
  const { count, total } = useCart();
  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-black/70 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-50 h-[88vh] overflow-hidden rounded-t-3xl border-t border-cream/10 bg-ink-elevated lg:hidden"
            >
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-ink text-cream"
              >
                <X className="h-4 w-4" />
              </button>
              <CartOrCheckout />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {count > 0 && !open && (
          <motion.button
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={onOpen}
            className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full bg-crimson px-5 py-4 text-crimson-foreground crimson-glow animate-crimson-pulse lg:hidden"
          >
            <span className="flex items-center gap-2 font-subtitle text-sm uppercase tracking-wider">
              <ShoppingBag className="h-4 w-4" /> Voir le panier · {count}
            </span>
            <span className="font-display text-lg">{formatPrice(total)}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
