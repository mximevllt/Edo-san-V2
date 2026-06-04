import { motion } from "framer-motion";
import type { Product } from "@/data/menu";
import { formatPrice } from "@/lib/cart-context";
import { AddButton } from "./AddButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="group relative flex w-full min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border border-cream/10 bg-ink-elevated"
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-black/40">
        <motion.img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={640}
          height={512}
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-5">
        <div className="flex-1 min-w-0">
          <h3 className="text-base leading-tight text-cream sm:text-lg">{product.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 sm:text-sm">
            {product.description}
          </p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-2 sm:gap-3">
          <span className="font-display text-xl text-cream sm:text-2xl">
            {formatPrice(product.price)}
          </span>
          <AddButton product={product} />
        </div>
      </div>
    </motion.article>
  );
}
