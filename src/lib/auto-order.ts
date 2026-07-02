import { CATEGORIES, type Product } from "@/data/menu";
import type { CartEntry } from "@/lib/cart-context";

export const STAR_INGREDIENTS = [
  "saumon",
  "thon",
  "crevette",
  "poulet",
  "crabe",
  "bar",
  "daurade",
] as const;

export type StarIngredient = (typeof STAR_INGREDIENTS)[number];
export type Sex = "homme" | "femme";
export type AppetiteLevel = 1 | 2 | 3 | 4 | 5;

export const AUTO_CATEGORY_OPTIONS = [
  { id: "sushis", label: "Sushis" },
  { id: "poke", label: "Poke bowls" },
  { id: "ramen", label: "Ramen et nouilles" },
  { id: "yakitori", label: "Yakitori" },
  { id: "gyoza", label: "Gyoza" },
  { id: "soups-salads", label: "Soupes et salades" },
] as const;

export type AutoCategory = (typeof AUTO_CATEGORY_OPTIONS)[number]["id"];

export type PersonPreference = {
  sex: Sex;
  age: number;
  appetite: AppetiteLevel;
  preferredIngredients: StarIngredient[];
  excludedIngredients: StarIngredient[];
  includedCategories: AutoCategory[];
  wantsDessert: boolean;
};

export type CollectivePreference = {
  men: number;
  women: number;
  appetite: AppetiteLevel;
  preferredIngredients: StarIngredient[];
  excludedIngredients: StarIngredient[];
  includedCategories: AutoCategory[];
  wantsDessert: boolean;
};

export type AutoOrderInput =
  | {
      mode: "individual";
      peopleCount: number;
      budget: number;
      people: PersonPreference[];
    }
  | {
      mode: "collective";
      peopleCount: number;
      budget: number;
      collective: CollectivePreference;
    };

export type RecommendedBudget = {
  min: number;
  max: number;
  targetSatiety: number;
};

export type AutoOrderResult = {
  entries: CartEntry[];
  total: number;
  targetSatiety: number;
  deliveredSatiety: number;
  recommended: RecommendedBudget;
  remainingBudget: number;
  isTooLow: boolean;
  isGenerous: boolean;
  message?: string;
};

type ProductProfile = {
  product: Product;
  category: AutoCategory | "desserts";
  satiety: number;
  ingredients: StarIngredient[];
};

const PRODUCT_SATIETY: Record<string, number> = {
  "sr-1": 70,
  "sr-2": 72,
  "sr-3": 74,
  "sr-4": 76,
  "c-1": 67,
  "c-2": 72,
  "c-3": 71,
  "c-4": 65,
  "c-5": 64,
  "c-6": 68,
  "c-7": 73,
  "c-8": 69,
  "c-9": 63,
  "c-10": 70,
  "c-11": 62,
  "c-12": 66,
  "sp-1": 66,
  "sp-2": 61,
  "sp-3": 60,
  "sp-4": 63,
  "sp-5": 58,
  "sp-6": 65,
  "sp-7": 50,
  "sp-8": 68,
  "m-1": 52,
  "m-2": 45,
  "m-3": 49,
  "m-4": 35,
  "m-5": 53,
  "m-6": 51,
  "m-7": 54,
  "m-8": 43,
  "m-9": 50,
  "m-10": 55,
  "m-11": 48,
  "n-9": 35,
  "n-6": 37,
  "n-1": 34,
  "n-5": 36,
  "n-3": 38,
  "n-8": 30,
  "n-4": 29,
  "n-2": 33,
  "n-7": 32,
  "sa-1": 40,
  "sa-2": 42,
  "sa-3": 38,
  "sa-4": 63,
  "sa-6": 65,
  "sa-7": 62,
  "sa-8": 34,
  "ch-1": 87,
  "ch-2": 84,
  "ch-3": 78,
  "ch-4": 90,
  "ch-5": 88,
  "ch-6": 86,
  "po-1": 90,
  "po-2": 89,
  "po-3": 92,
  "po-4": 92,
  "po-5": 92,
  "po-6": 86,
  "po-7": 86,
  "r-2": 95,
  "y-1": 43,
  "y-2": 46,
  "y-3": 45,
  "g-1": 78,
  "a-1": 28,
  "a-2": 44,
  "a-3": 31,
  "a-4": 22,
  "a-5": 40,
  "a-6": 25,
  "a-7": 32,
  "d-1": 46,
  "d-2": 46,
  "d-3": 42,
  "d-4": 42,
  "d-5": 44,
  "d-6": 46,
  "d-7": 43,
  "d-8": 42,
};

const PRODUCT_INGREDIENTS: Record<string, StarIngredient[]> = {
  "sr-1": ["saumon", "thon", "crevette"],
  "sr-2": ["daurade"],
  "sr-3": ["saumon", "thon"],
  "sr-4": [],
  "c-1": ["saumon"],
  "c-2": ["crevette"],
  "c-3": ["saumon"],
  "c-4": ["poulet"],
  "c-5": ["crevette"],
  "c-6": ["thon"],
  "c-7": ["poulet"],
  "c-8": ["thon"],
  "c-9": ["saumon", "thon"],
  "c-10": ["saumon"],
  "c-11": ["crevette"],
  "c-12": ["crabe"],
  "sp-1": ["saumon"],
  "sp-2": ["thon"],
  "sp-3": ["saumon"],
  "sp-4": [],
  "sp-5": ["crevette"],
  "sp-6": ["crevette"],
  "sp-7": [],
  "sp-8": ["poulet"],
  "m-1": ["saumon"],
  "m-2": [],
  "m-3": ["crabe"],
  "m-4": [],
  "m-5": [],
  "m-6": ["thon"],
  "m-7": ["crevette"],
  "m-8": [],
  "m-9": ["saumon"],
  "m-10": ["saumon"],
  "m-11": ["crevette"],
  "n-9": ["thon"],
  "n-6": ["thon"],
  "n-1": ["saumon"],
  "n-5": ["saumon"],
  "n-3": ["saumon"],
  "n-8": ["crevette"],
  "n-4": ["bar"],
  "n-2": ["bar"],
  "n-7": ["crabe"],
  "sa-1": ["saumon", "thon"],
  "sa-2": ["thon"],
  "sa-3": ["saumon"],
  "sa-4": ["saumon"],
  "sa-6": ["thon"],
  "sa-7": ["saumon", "thon", "bar"],
  "sa-8": ["bar"],
  "ch-1": ["thon"],
  "ch-2": ["saumon", "thon", "bar"],
  "ch-3": ["saumon", "thon"],
  "ch-4": ["saumon", "thon", "bar"],
  "ch-5": ["saumon", "thon"],
  "ch-6": ["saumon"],
  "po-1": ["saumon", "thon", "poulet"],
  "po-2": ["saumon"],
  "po-3": ["poulet"],
  "po-4": [],
  "po-5": [],
  "po-6": ["thon"],
  "po-7": ["saumon"],
  "r-2": ["crevette"],
  "y-1": ["saumon"],
  "y-2": ["poulet"],
  "y-3": ["poulet"],
  "g-1": ["poulet"],
  "a-3": ["crevette"],
  "a-7": ["saumon"],
};

const APPETITE_TARGET: Record<AppetiteLevel, number> = {
  1: 48,
  2: 72,
  3: 96,
  4: 124,
  5: 154,
};

function categoryFor(categoryId: string): ProductProfile["category"] | null {
  if (["special-rolls", "california", "spring-rolls", "maki", "nigiri", "sashimi", "chirashi"].includes(categoryId)) {
    return "sushis";
  }
  if (categoryId === "poke") return "poke";
  if (categoryId === "ramen") return "ramen";
  if (categoryId === "yakitori") return "yakitori";
  if (categoryId === "gyoza") return "gyoza";
  if (categoryId === "accompagnements") return "soups-salads";
  if (categoryId === "desserts") return "desserts";
  return null;
}

function catalog() {
  const products: ProductProfile[] = [];
  CATEGORIES.forEach((category) => {
    const autoCategory = categoryFor(category.id);
    if (!autoCategory) return;
    category.items.forEach((product) => {
      const satiety = PRODUCT_SATIETY[product.id];
      if (!satiety) return;
      products.push({
        product,
        category: autoCategory,
        satiety,
        ingredients: PRODUCT_INGREDIENTS[product.id] ?? [],
      });
    });
  });
  return products;
}

function ageFactor(age: number) {
  if (age <= 12) return 0.68;
  if (age <= 18) return 0.88;
  if (age <= 65) return 1;
  return 0.82;
}

function sexFactor(sex: Sex) {
  return sex === "homme" ? 1.12 : 0.95;
}

function personTarget(person: PersonPreference) {
  return APPETITE_TARGET[person.appetite] * sexFactor(person.sex) * ageFactor(person.age);
}

function aggregate(input: AutoOrderInput) {
  const preferred = new Map<StarIngredient, number>();
  const excludedIngredients = new Set<StarIngredient>();
  const includedCategories = new Set<AutoCategory>();
  let targetSatiety = 0;
  let dessertCount = 0;

  const addPreferences = (ingredients: StarIngredient[], weight = 1) => {
    ingredients.forEach((ingredient) => preferred.set(ingredient, (preferred.get(ingredient) ?? 0) + weight));
  };

  const addExclusions = (ingredients: StarIngredient[]) => {
    ingredients.forEach((ingredient) => excludedIngredients.add(ingredient));
  };

  const addIncludedCategories = (categories: AutoCategory[]) => {
    categories.forEach((category) => includedCategories.add(category));
  };

  if (input.mode === "individual") {
    const preferenceWeight = 1 / Math.max(1, input.people.length);
    input.people.forEach((person) => {
      targetSatiety += personTarget(person);
      if (person.wantsDessert) {
        targetSatiety += 18;
        dessertCount += 1;
      }
      addPreferences(person.preferredIngredients, preferenceWeight);
      addIncludedCategories(person.includedCategories);
    });
  } else {
    const { collective } = input;
    const countedPeople = Math.max(collective.men + collective.women, input.peopleCount);
    const unassigned = Math.max(0, input.peopleCount - collective.men - collective.women);
    targetSatiety += collective.men * APPETITE_TARGET[collective.appetite] * sexFactor("homme");
    targetSatiety += collective.women * APPETITE_TARGET[collective.appetite] * sexFactor("femme");
    targetSatiety += unassigned * APPETITE_TARGET[collective.appetite] * 1.03;
    if (collective.wantsDessert) {
      targetSatiety += countedPeople * 18;
      dessertCount = countedPeople;
    }
    addPreferences(collective.preferredIngredients);
    addExclusions(collective.excludedIngredients);
    addIncludedCategories(collective.includedCategories);
  }

  excludedIngredients.forEach((ingredient) => preferred.delete(ingredient));

  return {
    preferred,
    excludedIngredients,
    includedCategories,
    dessertCount,
    targetSatiety: Math.max(35, targetSatiety),
  };
}

function isAllowed(profile: ProductProfile, data: ReturnType<typeof aggregate>, includeDesserts = false) {
  if (profile.category === "desserts") return includeDesserts;
  if (!data.includedCategories.has(profile.category)) return false;
  return !profile.ingredients.some((ingredient) => data.excludedIngredients.has(ingredient));
}

function roundEuro(value: number) {
  return Math.max(0, Math.round(value));
}

function recommendationFrom(input: AutoOrderInput): RecommendedBudget {
  const data = aggregate(input);
  const savory = catalog().filter((profile) => isAllowed(profile, data, false));
  const rates = savory
    .map((profile) => profile.product.price / profile.satiety)
    .filter((rate) => Number.isFinite(rate))
    .sort((a, b) => a - b);
  const medianRate = rates.length > 0 ? rates[Math.floor(rates.length / 2)] : 0.17;
  const lowRate = Math.max(0.12, medianRate * 0.82);
  const highRate = Math.max(0.18, medianRate * 1.24);
  const dessertBudget = data.dessertCount * 4.5;
  return {
    min: roundEuro(data.targetSatiety * lowRate + dessertBudget),
    max: roundEuro(data.targetSatiety * highRate + dessertBudget + input.peopleCount * 3),
    targetSatiety: data.targetSatiety,
  };
}

export function getRecommendedBudget(input: AutoOrderInput): RecommendedBudget {
  return recommendationFrom(input);
}

function preferenceBoost(profile: ProductProfile, preferred: Map<StarIngredient, number>) {
  return profile.ingredients.reduce((score, ingredient) => score + (preferred.get(ingredient) ?? 0), 0);
}

function categoryWeight(category: ProductProfile["category"]) {
  if (category === "sushis") return 4;
  if (category === "poke") return 1.45;
  if (category === "ramen") return 1.05;
  if (category === "yakitori") return 1.25;
  if (category === "gyoza") return 1;
  if (category === "soups-salads") return 0.85;
  return 0.6;
}

function scoreCandidate(
  profile: ProductProfile,
  data: ReturnType<typeof aggregate>,
  categorySatiety: Map<string, number>,
  selected: Map<string, number>,
  totalSatiety: number,
  lightMode: boolean,
) {
  const selectedQty = selected.get(profile.product.id) ?? 0;
  const totalWeight = [...categorySatiety.keys()].reduce((sum, category) => sum + categoryWeight(category as ProductProfile["category"]), 0) || 1;
  const currentShare = totalSatiety <= 0 ? 0 : (categorySatiety.get(profile.category) ?? 0) / totalSatiety;
  const targetShare = categoryWeight(profile.category) / totalWeight;
  const categoryNeed = Math.max(-0.8, targetShare - currentShare);
  const value = profile.satiety / Math.max(1, profile.product.price);
  const preference = preferenceBoost(profile, data.preferred);
  const repeatPenalty = selectedQty * 2.4;
  const lightBonus = lightMode ? Math.max(0, 64 - profile.satiety) / 18 : 0;
  return value * 0.55 + preference * 2.15 + categoryNeed * 7 + lightBonus - repeatPenalty;
}

function addProfile(
  profile: ProductProfile,
  selected: Map<string, number>,
  categorySatiety: Map<string, number>,
  state: { total: number; satiety: number },
) {
  selected.set(profile.product.id, (selected.get(profile.product.id) ?? 0) + 1);
  categorySatiety.set(profile.category, (categorySatiety.get(profile.category) ?? 0) + profile.satiety);
  state.total += profile.product.price;
  state.satiety += profile.satiety;
}

export function generateAutoOrder(input: AutoOrderInput, options: { fillRemaining?: boolean } = {}): AutoOrderResult {
  const data = aggregate(input);
  const recommended = recommendationFrom(input);
  const products = catalog();
  const savory = products.filter((profile) => isAllowed(profile, data, false));
  const desserts = products.filter((profile) => profile.category === "desserts");
  const selected = new Map<string, number>();
  const categorySatiety = new Map<string, number>();
  const state = { total: 0, satiety: 0 };
  const maxPerProduct = input.peopleCount <= 2 ? 1 : input.peopleCount <= 5 ? 2 : 3;

  if (savory.length === 0) {
    return {
      entries: [],
      total: 0,
      targetSatiety: data.targetSatiety,
      deliveredSatiety: 0,
      recommended,
      remainingBudget: input.budget,
      isTooLow: true,
      isGenerous: false,
      message: "Les contraintes sont trop fortes pour composer un mix cohérent. Ajoutez une catégorie, retirez une exclusion ou augmentez le budget.",
    };
  }

  for (let guard = 0; guard < 80 && state.satiety < data.targetSatiety * 0.98; guard += 1) {
    const candidates = savory
      .filter((profile) => state.total + profile.product.price <= input.budget)
      .filter((profile) => (selected.get(profile.product.id) ?? 0) < maxPerProduct)
      .sort(
        (a, b) =>
          scoreCandidate(b, data, categorySatiety, selected, state.satiety, false) -
          scoreCandidate(a, data, categorySatiety, selected, state.satiety, false),
      );
    const next = candidates[0];
    if (!next) break;
    addProfile(next, selected, categorySatiety, state);
  }

  for (let i = 0; i < data.dessertCount; i += 1) {
    const nextDessert = desserts
      .filter((profile) => state.total + profile.product.price <= input.budget)
      .sort((a, b) => a.product.price - b.product.price)[i % desserts.length];
    if (!nextDessert) break;
    addProfile(nextDessert, selected, categorySatiety, state);
  }

  if (options.fillRemaining) {
    const lightProducts = savory
      .filter((profile) => profile.satiety <= 55)
      .sort(
        (a, b) =>
          scoreCandidate(b, data, categorySatiety, selected, state.satiety, true) -
          scoreCandidate(a, data, categorySatiety, selected, state.satiety, true),
      );
    for (let guard = 0; guard < Math.max(1, input.peopleCount * 2); guard += 1) {
      const next = lightProducts.find(
        (profile) => state.total + profile.product.price <= input.budget && (selected.get(profile.product.id) ?? 0) < maxPerProduct,
      );
      if (!next) break;
      addProfile(next, selected, categorySatiety, state);
    }
  }

  const productById = new Map(products.map((profile) => [profile.product.id, profile.product]));
  const entries = [...selected.entries()]
    .map(([productId, quantity]) => {
      const product = productById.get(productId);
      return product ? { product, quantity } : null;
    })
    .filter((entry): entry is CartEntry => entry != null);

  const isTooLow = state.satiety < data.targetSatiety * 0.82;
  const isGenerous = input.budget > recommended.max && input.budget - state.total >= 6 && !options.fillRemaining;
  const remainingBudget = Math.max(0, input.budget - state.total);

  return {
    entries,
    total: state.total,
    targetSatiety: data.targetSatiety,
    deliveredSatiety: state.satiety,
    recommended,
    remainingBudget,
    isTooLow,
    isGenerous,
    message: isTooLow
      ? "Compte tenu du budget renseigné, la commande risque de ne pas satisfaire complètement le niveau d'appétit choisi."
      : undefined,
  };
}

export function budgetFromSlider(position: number) {
  const p = Math.max(0, Math.min(100, position));
  if (p <= 50) return Math.round((p / 50) * 80);
  if (p <= 75) return Math.round(80 + ((p - 50) / 25) * 170);
  if (p <= 95) return Math.round(250 + ((p - 75) / 20) * 250);
  return Math.round(500 + ((p - 95) / 5) * 100);
}

export function sliderFromBudget(budget: number) {
  const value = Math.max(0, Math.min(600, budget));
  if (value <= 80) return (value / 80) * 50;
  if (value <= 250) return 50 + ((value - 80) / 170) * 25;
  if (value <= 500) return 75 + ((value - 250) / 250) * 20;
  return 95 + ((value - 500) / 100) * 5;
}
