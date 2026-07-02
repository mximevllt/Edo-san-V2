import { CATEGORIES, type Category, type Product } from "@/data/menu";

export type ProductStatus = "Actif" | "Masqué" | "Indisponible";

export type StoreProduct = Product & {
  categoryLabel: string;
  internalRef: string;
  status: ProductStatus;
  salesMonth: number;
  displayOrder: number;
  vat: number;
  strikePrice?: number;
  ingredients: string;
  badge?: string;
};

export type StoreCategory = {
  id: string;
  label: string;
  description: string;
  image?: string;
  status: "Visible" | "Masquée";
  displayOrder: number;
  schedule: string;
  visibility: "Livraison + retrait" | "Retrait seul" | "Livraison seule";
};

export type ClosureState = {
  start: string;
  end: string;
  reason: string;
};

export type StorePromotion = {
  id: string;
  title: string;
  subtitle: string;
  start: string;
  end: string;
  discountPercent: number;
  productIds: string[];
};

export type StoreOptionGroup = {
  id: string;
  name: string;
  type: "Choix unique" | "Choix multiple";
  required: boolean;
  min: number;
  max: number;
  items: string[];
};

export type DeliveryTier = {
  id: string;
  range: string;
  price: number;
};

export type DeliverySettings = {
  mode: string;
  fixedMinimum: number;
  pricePerKm: number;
  maxDistance: number;
  maxFee: number;
  minOrder: number;
  freeFrom: number;
  rushMarkup: number;
  tiers: DeliveryTier[];
};

export type OpeningHour = {
  day: string;
  lunch: string;
  dinner: string;
  capacity: number;
};

export type AdminStoreState = {
  products: StoreProduct[];
  categories: StoreCategory[];
  options: StoreOptionGroup[];
  delivery: DeliverySettings;
  promotions: StorePromotion[];
  hours: OpeningHour[];
  closure: ClosureState | null;
  paused: boolean;
  updatedAt: string;
};

export const adminStoreKey = "edo-san-admin-store";
export const adminStoreEvent = "edo-san-admin-store-change";

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export function createDefaultAdminStore(): AdminStoreState {
  let order = 1;
  const products = CATEGORIES.flatMap((category) =>
    category.items.map((product, index) => ({
      ...product,
      categoryLabel: category.label,
      internalRef: `${category.id.slice(0, 3).toUpperCase()}-${String(order).padStart(3, "0")}`,
      status: (product.thursdayOnly ? "Masqué" : index % 11 === 0 ? "Indisponible" : "Actif") as ProductStatus,
      salesMonth: 12 + ((order * 7) % 96),
      displayOrder: order++,
      vat: 10,
      strikePrice: index % 8 === 0 ? Number((product.price + 1.5).toFixed(2)) : undefined,
      ingredients: product.description,
      badge: product.thursdayOnly ? "Jeudi" : index % 6 === 0 ? "Populaire" : undefined,
    })),
  );

  return {
    products,
    categories: CATEGORIES.map((category, index) => ({
      id: category.id,
      label: category.label,
      description: `Gestion de la famille ${category.label.toLowerCase()}.`,
      image: category.items[0]?.image,
      status: "Visible",
      displayOrder: index + 1,
      schedule: index % 4 === 0 ? "Midi et soir" : "Toute la journée",
      visibility: "Livraison + retrait",
    })),
    options: [
      { id: "sauces", name: "Sauces", type: "Choix multiple", required: false, min: 0, max: 4, items: ["Soja salée", "Soja sucrée", "Spicy mayo", "Ponzu"] },
      { id: "accompagnements", name: "Accompagnements", type: "Choix unique", required: false, min: 0, max: 1, items: ["Riz", "Chou", "Soupe miso"] },
      { id: "supplements", name: "Suppléments", type: "Choix multiple", required: false, min: 0, max: 5, items: ["Avocat", "Cheese", "Masago", "Gingembre"] },
      { id: "boisson-incluse", name: "Boisson incluse", type: "Choix unique", required: true, min: 1, max: 1, items: ["Coca", "Fuze Tea", "Ramune"] },
      { id: "dessert-inclus", name: "Dessert inclus", type: "Choix unique", required: false, min: 0, max: 1, items: ["Mochi yuzu", "Mochi mangue"] },
    ],
    delivery: {
      mode: "Tranches kilométriques",
      fixedMinimum: 3.5,
      pricePerKm: 0.85,
      maxDistance: 14,
      maxFee: 12,
      minOrder: 18,
      freeFrom: 70,
      rushMarkup: 15,
      tiers: [
        { id: "tier-1", range: "0 à 3 km", price: 3.5 },
        { id: "tier-2", range: "3 à 7 km", price: 5 },
        { id: "tier-3", range: "7 à 10 km", price: 8 },
        { id: "tier-4", range: "10 à 14 km", price: 12 },
      ],
    },
    promotions: [],
    hours: days.map((day, index) => ({
      day,
      lunch: index === 0 ? "Fermé" : "11:30 - 14:00",
      dinner: index === 0 ? "Fermé" : "18:30 - 22:00",
      capacity: 8 + (index % 3),
    })),
    closure: null,
    paused: false,
    updatedAt: new Date().toISOString(),
  };
}

export function readPublishedAdminStore(): AdminStoreState {
  if (typeof window === "undefined") return createDefaultAdminStore();
  const raw = window.localStorage.getItem(adminStoreKey);
  if (!raw) return createDefaultAdminStore();
  try {
    return { ...createDefaultAdminStore(), ...(JSON.parse(raw) as Partial<AdminStoreState>) };
  } catch {
    return createDefaultAdminStore();
  }
}

export function writePublishedAdminStore(state: AdminStoreState) {
  const next = { ...state, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(adminStoreKey, JSON.stringify(next));
  window.dispatchEvent(new Event(adminStoreEvent));
  window.dispatchEvent(new Event("edo-san-closure-change"));
  window.dispatchEvent(new Event("edo-san-promotions-change"));
  return next;
}

export function buildClientCategories(store: AdminStoreState): Category[] {
  const categories = [...store.categories]
    .filter((category) => category.status === "Visible")
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((category) => ({
      id: category.id,
      label: category.label,
      items: store.products
        .filter((product) => product.categoryLabel === category.label && product.status === "Actif")
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((product) => ({
          id: product.id,
          name: product.name,
          description: product.ingredients || product.description,
          price: product.price,
          image: product.image,
          pieces: product.pieces,
          thursdayOnly: product.thursdayOnly,
        })),
    }));

  const promotionCategory = buildPromotionCategory(store);
  return promotionCategory ? [promotionCategory, ...categories] : categories;
}

export function buildPromotionCategory(store: AdminStoreState): Category | null {
  const activePromotions = store.promotions.filter((promotion) => isPromotionActive(promotion));
  if (activePromotions.length === 0) return null;

  const promotedItems = activePromotions.flatMap((promotion) =>
    promotion.productIds.flatMap((productId) => {
      const product = store.products.find((item) => item.id === productId && item.status === "Actif");
      if (!product) return [];
      return {
        id: `promo-${promotion.id}-${product.id}`,
        name: `${product.name} -${promotion.discountPercent}%`,
        description: `${promotion.title}. ${promotion.subtitle}`,
        price: Number((product.price * (1 - promotion.discountPercent / 100)).toFixed(2)),
        image: product.image,
        pieces: product.pieces,
        thursdayOnly: product.thursdayOnly,
      };
    }),
  );

  return promotedItems.length > 0 ? { id: "promotions", label: "Promotion", items: promotedItems } : null;
}

export function isPromotionActive(promotion: StorePromotion) {
  if (!promotion.start || !promotion.end) return false;
  const today = normalizeDate(new Date());
  return today >= parseLocalDate(promotion.start) && today <= parseLocalDate(promotion.end);
}

export function isClosureActive(closure: ClosureState | null) {
  if (!closure?.start || !closure.end) return false;
  const today = normalizeDate(new Date());
  return today >= parseLocalDate(closure.start) && today <= parseLocalDate(closure.end);
}

export function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
