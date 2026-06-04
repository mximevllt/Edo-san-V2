import menu from "@/assets/prod-menu.jpg";
import plateau from "@/assets/prod-plateau.jpg";
import special from "@/assets/prod-special.jpg";
import california from "@/assets/prod-california.jpg";
import spring from "@/assets/prod-spring.jpg";
import maki from "@/assets/prod-maki.jpg";
import nigiri from "@/assets/prod-nigiri.jpg";
import sashimi from "@/assets/prod-sashimi.jpg";
import chirashi from "@/assets/prod-chirashi.jpg";
import poke from "@/assets/prod-poke.jpg";
import ramen from "@/assets/prod-ramen.jpg";
import yakitori from "@/assets/prod-yakitori.jpg";
import gyoza from "@/assets/prod-gyoza.jpg";
import edamame from "@/assets/prod-edamame.jpg";
import tea from "@/assets/prod-tea.jpg";
import mochi from "@/assets/prod-mochi.jpg";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

export type Category = {
  id: string;
  label: string;
  items: Product[];
};

export const CATEGORIES: Category[] = [
  {
    id: "menus-midi",
    label: "Menus du midi",
    items: [
      { id: "midi-1", name: "Bento Edo", description: "8 pièces, soupe miso et salade wakamé", price: 16.9, image: menu },
      { id: "midi-2", name: "Bento Sakura", description: "12 pièces, edamame et thé vert", price: 19.5, image: menu },
    ],
  },
  {
    id: "plateaux",
    label: "Plateaux",
    items: [
      { id: "p-1", name: "Plateau Shogun", description: "36 pièces — sélection du chef", price: 42.0, image: plateau },
      { id: "p-2", name: "Plateau Hanami", description: "24 pièces variées, sauce yuzu", price: 32.0, image: plateau },
      { id: "p-3", name: "Plateau Mikado", description: "48 pièces — pour partager", price: 58.0, image: plateau },
    ],
  },
  {
    id: "special-rolls",
    label: "Special rolls",
    items: [
      { id: "sr-1", name: "Roll Edo-San", description: "Saumon, avocat, tobiko, sauce épicée", price: 12.9, image: special },
      { id: "sr-2", name: "Roll Dragon", description: "Anguille, concombre, glaçage teriyaki", price: 13.5, image: special },
      { id: "sr-3", name: "Roll Kyoto", description: "Thon rouge, mangue, sésame noir", price: 13.9, image: special },
    ],
  },
  {
    id: "california",
    label: "California rolls",
    items: [
      { id: "c-1", name: "California Saumon", description: "Saumon, avocat, sésame", price: 7.9, image: california },
      { id: "c-2", name: "California Crevette", description: "Crevette, mayo japonaise, ciboulette", price: 8.5, image: california },
      { id: "c-3", name: "California Avocat", description: "Avocat, concombre, graines de sésame", price: 6.9, image: california },
    ],
  },
  {
    id: "spring-rolls",
    label: "Spring rolls",
    items: [
      { id: "sp-1", name: "Spring Saumon", description: "Saumon mariné, fines herbes, riz", price: 7.5, image: spring },
      { id: "sp-2", name: "Spring Crevette", description: "Crevette, menthe fraîche, vermicelles", price: 8.0, image: spring },
    ],
  },
  {
    id: "maki",
    label: "Maki",
    items: [
      { id: "m-1", name: "Maki Saumon", description: "6 pièces, nori, riz vinaigré", price: 6.5, image: maki },
      { id: "m-2", name: "Maki Thon", description: "6 pièces, thon rouge premium", price: 7.0, image: maki },
      { id: "m-3", name: "Maki Concombre", description: "6 pièces, fraîcheur végétale", price: 5.0, image: maki },
    ],
  },
  {
    id: "nigiri",
    label: "Nigiri",
    items: [
      { id: "n-1", name: "Nigiri Saumon", description: "2 pièces, riz tiède, saumon premium", price: 5.5, image: nigiri },
      { id: "n-2", name: "Nigiri Thon", description: "2 pièces, thon rouge", price: 6.5, image: nigiri },
      { id: "n-3", name: "Nigiri Daurade", description: "2 pièces, daurade et yuzu", price: 6.0, image: nigiri },
    ],
  },
  {
    id: "sashimi",
    label: "Sashimi",
    items: [
      { id: "sa-1", name: "Sashimi Saumon", description: "9 tranches, qualité sushi", price: 13.5, image: sashimi },
      { id: "sa-2", name: "Sashimi Mix", description: "Saumon, thon, daurade", price: 16.9, image: sashimi },
    ],
  },
  {
    id: "chirashi",
    label: "Chirashi",
    items: [
      { id: "ch-1", name: "Chirashi Saumon", description: "Bol de riz vinaigré, saumon, avocat", price: 14.9, image: chirashi },
      { id: "ch-2", name: "Chirashi Mix", description: "Assortiment de poissons frais", price: 17.9, image: chirashi },
    ],
  },
  {
    id: "poke",
    label: "Poke bowl",
    items: [
      { id: "po-1", name: "Poke Saumon", description: "Saumon, edamame, avocat, mangue", price: 13.9, image: poke },
      { id: "po-2", name: "Poke Thon", description: "Thon mariné, concombre, oignons frits", price: 14.5, image: poke },
    ],
  },
  {
    id: "ramen",
    label: "Ramen et nouilles",
    items: [
      { id: "r-1", name: "Ramen Tonkotsu", description: "Bouillon de porc 12h, chashu, œuf mariné", price: 15.5, image: ramen },
      { id: "r-2", name: "Ramen Miso", description: "Miso rouge, maïs, beurre, ail noir", price: 14.9, image: ramen },
    ],
  },
  {
    id: "yakitori",
    label: "Yakitori",
    items: [
      { id: "y-1", name: "Yakitori Poulet", description: "4 brochettes, sauce tare", price: 9.5, image: yakitori },
      { id: "y-2", name: "Yakitori Bœuf", description: "4 brochettes, sésame noir", price: 11.5, image: yakitori },
    ],
  },
  {
    id: "gyoza",
    label: "Gyoza",
    items: [
      { id: "g-1", name: "Gyoza Porc", description: "6 raviolis poêlés, sauce ponzu", price: 7.5, image: gyoza },
      { id: "g-2", name: "Gyoza Légumes", description: "6 raviolis, légumes croquants", price: 7.0, image: gyoza },
    ],
  },
  {
    id: "accompagnements",
    label: "Accompagnements",
    items: [
      { id: "a-1", name: "Edamame", description: "Fèves de soja, fleur de sel", price: 4.5, image: edamame },
      { id: "a-2", name: "Soupe Miso", description: "Tofu, wakamé, ciboule", price: 3.5, image: edamame },
    ],
  },
  {
    id: "boissons",
    label: "Boissons",
    items: [
      { id: "b-1", name: "Thé Vert Sencha", description: "Théière 40cl, infusion délicate", price: 4.0, image: tea },
      { id: "b-2", name: "Saké chaud", description: "Carafe 15cl, junmai", price: 6.5, image: tea },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    items: [
      { id: "d-1", name: "Mochi assortis", description: "3 pièces — matcha, fraise, sésame", price: 6.5, image: mochi },
      { id: "d-2", name: "Dorayaki", description: "Pancake japonais, pâte de haricot rouge", price: 5.5, image: mochi },
    ],
  },
];

export const ADDONS: Product[] = [
  { id: "addon-tea", name: "Thé vert", description: "Infusion sencha", price: 3.5, image: tea },
  { id: "addon-ginger", name: "Gingembre extra", description: "Portion généreuse", price: 1.5, image: edamame },
  { id: "addon-edamame", name: "Edamame", description: "Fleur de sel", price: 4.5, image: edamame },
  { id: "addon-mochi", name: "Mochi", description: "Une pièce", price: 2.5, image: mochi },
];
