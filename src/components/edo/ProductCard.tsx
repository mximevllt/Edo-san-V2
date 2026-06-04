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

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex-1">
          <h3 className="text-lg leading-tight text-cream">{product.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </div>
        <div className="flex items-end justify-between gap-3">
          <span className="font-display text-2xl text-cream">
            {formatPrice(product.price)}
          </span>
          <AddButton product={product} />
        </div>
      </div>
    </motion.article>
  );
}
