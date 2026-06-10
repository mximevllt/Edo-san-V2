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

import makiSalmonRoll from "@/assets/maki/Maki-Salmon-Roll.jpg.asset.json";
import makiAvocat from "@/assets/maki/Maki-Avocat.jpg.asset.json";
import makiCrabeMasago from "@/assets/maki/Maki-Crabe-Masago-Poivre-Hachi.jpg.asset.json";
import makiConcombre from "@/assets/maki/Maki-Concombre.jpg.asset.json";
import makiAvocatCheese from "@/assets/maki/Maki-Avocat-Cheese.jpg.asset.json";
import makiThonCiboulette from "@/assets/maki/Maki-Thon-Ciboulette.jpg.asset.json";
import makiCrevetteGuacamole from "@/assets/maki/Maki-Crevette-Guacamole.jpg.asset.json";
import makiConcombreCheese from "@/assets/maki/Maki-Concombre-Cheese.jpg.asset.json";
import makiSaumon from "@/assets/maki/Maki-Saumon.jpg.asset.json";

import calCrabe from "@/assets/california/California-Crabe-Yuzu-Masago-Pomme-Verte-1.jpg.asset.json";
import calCrevetteMenthe from "@/assets/california/California-Crevette-Avocat-Menthe-1.jpg.asset.json";
import calCrevettePanee from "@/assets/california/California-Crevette-Panée-Avocat-2.jpg.asset.json";
import calPeruvian from "@/assets/california/California-Peruvian-1.jpg.asset.json";
import calPouletMayo from "@/assets/california/California-Poulet-Avocat-Mayo-1.jpg.asset.json";
import calPouletSpicy from "@/assets/california/California-Poulet-Concombre-Spicy-1.jpg.asset.json";
import calSalmonPillow from "@/assets/california/California-Salmon-Pillow-1.jpg.asset.json";
import calSaumon from "@/assets/california/California-Saumon-Avocat-Concombre.jpg.asset.json";
import calSaumonCheese from "@/assets/california/California-Saumon-Cheese-Avocat-Concombre-1.jpg.asset.json";
import calThon from "@/assets/california/California-Thon-Avocat-Concombre-1.jpg.asset.json";
import calCrevetteSpicy from "@/assets/california/crevette-spicy.jpeg.asset.json";
import calThonCuit from "@/assets/california/thon-cuit-avocat.jpg.asset.json";

import chirashiImperiale from "@/assets/chirashi/imperiale.jpg.asset.json";
import chirashiMarine from "@/assets/chirashi/marine.jpg.asset.json";
import chirashiMixte from "@/assets/chirashi/mixte.jpg.asset.json";
import chirashiSaumon from "@/assets/chirashi/saumon.jpg.asset.json";
import chirashiThon from "@/assets/chirashi/thon.jpg.asset.json";
import chirashiTartare from "@/assets/chirashi/tartare.jpg.asset.json";

import srDragon from "@/assets/special/Dragon-Rolls-_8pc.jpg.asset.json";
import srRoyalTazuna from "@/assets/special/Royal-Tazuna-_8pc.jpg.asset.json";
import srTazunaArc from "@/assets/special/Tazuna-Arc-en-Ciel-_8pc.jpg.asset.json";
import srTazunaYaki from "@/assets/special/Tazuna-Yaki-tai-_8pc.jpg.asset.json";

import nigSaumon from "@/assets/nigiri/saumon.jpg.asset.json";
import nigBarSnacke from "@/assets/nigiri/barsnacke.jpg.asset.json";
import nigSaumonCheese from "@/assets/nigiri/saumoncheese.jpg.asset.json";
import nigBar from "@/assets/nigiri/bar.jpg.asset.json";
import nigSaumonSnacke from "@/assets/nigiri/saumonsnacke.jpg.asset.json";
import nigThonSnacke from "@/assets/nigiri/thonsnacke.jpg.asset.json";
import nigGunkan from "@/assets/nigiri/gunkan.jpg.asset.json";
import nigCrevette from "@/assets/nigiri/crevette.jpg.asset.json";
import nigThon from "@/assets/nigiri/thon.jpg.asset.json";

import saMixte from "@/assets/sashimi/mixte.jpg.asset.json";
import saThon from "@/assets/sashimi/thon.jpg.asset.json";
import saSaumon from "@/assets/sashimi/saumon.jpg.asset.json";
import saImperial from "@/assets/sashimi/imperial.jpg.asset.json";
import saBar from "@/assets/sashimi/bar.jpg.asset.json";
import saTatakiSaumon from "@/assets/sashimi/tataki-saumon.jpg.asset.json";
import saTatakiThon from "@/assets/sashimi/tataki-thon.jpg.asset.json";

import pokeBoeuf from "@/assets/poke/boeuf.jpg.asset.json";
import pokeMixte from "@/assets/poke/mixte.jpg.asset.json";
import pokePoulet from "@/assets/poke/poulet.jpg.asset.json";
import pokeSaumon from "@/assets/poke/saumon.jpg.asset.json";
import pokeThon from "@/assets/poke/thon.jpg.asset.json";
import pokeVeggie from "@/assets/poke/veggie.jpg.asset.json";
import pokeSaumonTeriyaki from "@/assets/poke/saumon-teriyaki.jpg.asset.json";
import gyozaImg from "@/assets/gyoza/gyoza.jpg.asset.json";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  pieces?: number;
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
      { id: "midi-1", name: "Plateau Kyoto", description: "Sélection signature du midi", price: 16.9, image: menu },
      { id: "midi-2", name: "Plateau Osaka", description: "Assortiment équilibré, riz koshihikari", price: 17.9, image: menu },
      { id: "midi-3", name: "Menu Matsue", description: "Le grand menu midi, généreux et raffiné", price: 19.9, image: menu },
      { id: "midi-4", name: "Plateau Nara", description: "Plateau midi mixte, sauce yuzu", price: 18.5, image: menu },
    ],
  },
  {
    id: "plateaux",
    label: "Plateaux",
    items: [
      { id: "p-1", name: "Plateau Signature", description: "Sélection 100 pièces du chef", price: 89.0, image: plateau },
      { id: "p-2", name: "Plateau Torei Sushi", description: "Assortiment sushi premium", price: 32.0, image: plateau },
      { id: "p-3", name: "Box Signature 44 pièces", description: "Le best of de la maison", price: 49.9, image: plateau },
      { id: "p-4", name: "Chisana Torei", description: "Petit plateau découverte", price: 21.9, image: plateau },
      { id: "p-5", name: "Menu Kiddo", description: "Menu enfant, pièces douces", price: 12.5, image: plateau },
      { id: "p-6", name: "Plateau Nigiri", description: "Sélection nigiri nouvelle carte", price: 26.9, image: plateau },
      { id: "p-7", name: "Torei Spring Rolls", description: "Plateau 100% spring rolls", price: 24.9, image: plateau },
      { id: "p-8", name: "Torei California", description: "Plateau 100% california rolls", price: 23.9, image: plateau },
      { id: "p-9", name: "Futo Torei", description: "Gros makis généreux et colorés", price: 22.5, image: plateau },
      { id: "p-10", name: "Plateau Torei Cheese", description: "Sélection cheese nouvelle carte", price: 25.9, image: plateau },
      { id: "p-11", name: "Menu Mix", description: "Assortiment mixte pour partager", price: 27.9, image: plateau },
    ],
  },
  {
    id: "special-rolls",
    label: "Special rolls",
    items: [
      { id: "sr-1", name: "Tazuna Arc-en-Ciel", description: "Roll multicolore, poissons nobles", price: 14.9, image: srTazunaArc.url, pieces: 8 },
      { id: "sr-2", name: "Tazuna Yaki-tai", description: "Daurade snackée, sauce maison", price: 14.5, image: srTazunaYaki.url, pieces: 8 },
      { id: "sr-3", name: "Royal Tazuna", description: "Le roll royal de la maison", price: 16.9, image: srRoyalTazuna.url, pieces: 8 },
      { id: "sr-4", name: "Dragon Rolls", description: "Anguille, avocat, glaçage teriyaki", price: 15.5, image: srDragon.url, pieces: 8 },
    ],
  },
  {
    id: "california",
    label: "California rolls",
    items: [
      { id: "c-1", name: "California Saumon Avocat Concombre", description: "Le grand classique", price: 7.9, image: calSaumon.url },
      { id: "c-2", name: "California Crevette Panée Avocat", description: "Crevette croustillante, avocat", price: 8.9, image: calCrevettePanee.url },
      { id: "c-3", name: "California Saumon Cheese Avocat Concombre", description: "Saumon, cheese, avocat", price: 8.5, image: calSaumonCheese.url },
      { id: "c-4", name: "California Poulet Concombre Spicy", description: "Poulet épicé, concombre", price: 8.5, image: calPouletSpicy.url },
      { id: "c-5", name: "California Signature", description: "Création maison du chef", price: 9.5, image: calCrevetteSpicy.url },
      { id: "c-6", name: "California Thon Avocat Concombre", description: "Thon rouge, avocat", price: 8.9, image: calThon.url },
      { id: "c-7", name: "California Poulet Avocat Mayo", description: "Poulet, avocat, mayo japonaise", price: 8.5, image: calPouletMayo.url },
      { id: "c-8", name: "California Thon Cuit Avocat", description: "Thon cuit, avocat onctueux", price: 8.5, image: calThonCuit.url },
      { id: "c-9", name: "California Peruvian", description: "Inspiration péruvienne, ceviche", price: 9.9, image: calPeruvian.url },
      { id: "c-10", name: "California Salmon Pillow", description: "Saumon en coussin, fondant", price: 9.5, image: calSalmonPillow.url },
      { id: "c-11", name: "California Crevette Avocat Menthe", description: "Crevette, menthe fraîche", price: 8.9, image: calCrevetteMenthe.url },
      { id: "c-12", name: "California Crabe Yuzu Masago Pomme Verte", description: "Crabe, yuzu, masago, pomme verte", price: 10.5, image: calCrabe.url },
    ],
  },
  {
    id: "spring-rolls",
    label: "Spring rolls",
    items: [
      { id: "sp-1", name: "Spring Rolls Saumon Avocat Cheese", description: "Saumon, avocat, cheese", price: 8.5, image: spring },
      { id: "sp-2", name: "Spring Rolls Thon Avocat Menthe Coriandre", description: "Thon, herbes fraîches", price: 8.9, image: spring },
      { id: "sp-3", name: "Spring Roll Saumon Avocat Menthe Coriandre", description: "Saumon, menthe, coriandre", price: 8.5, image: spring },
      { id: "sp-4", name: "Spring Rolls Avocat Cheese", description: "Avocat, cheese, fraîcheur", price: 7.5, image: spring },
      { id: "sp-5", name: "Spring Rolls Crevette Avocat Menthe Coriandre", description: "Crevette, herbes fraîches", price: 8.9, image: spring },
      { id: "sp-6", name: "Spring Rolls Crevette Panée Avocat", description: "Crevette panée, avocat", price: 8.9, image: spring },
      { id: "sp-7", name: "Spring Rolls Concombre Cheese", description: "Concombre, cheese, légèreté", price: 7.0, image: spring },
      { id: "sp-8", name: "Spring Rolls Poulet Avocat Mayonnaise", description: "Poulet, avocat, mayo", price: 8.5, image: spring },
    ],
  },
  {
    id: "maki",
    label: "Maki",
    items: [
      { id: "m-1", name: "Maki Salmon Roll", description: "Saumon, riz vinaigré", price: 6.5, image: makiSalmonRoll.url },
      { id: "m-2", name: "Maki Avocat", description: "Avocat fondant, sésame", price: 5.0, image: makiAvocat.url },
      { id: "m-3", name: "Maki Crabe Masago Poivre Hachi", description: "Crabe, masago, poivre hachi", price: 7.5, image: makiCrabeMasago.url },
      { id: "m-4", name: "Maki Concombre", description: "Fraîcheur végétale", price: 5.0, image: makiConcombre.url },
      { id: "m-5", name: "Maki Avocat Cheese", description: "Avocat, cheese onctueux", price: 5.5, image: makiAvocatCheese.url },
      { id: "m-6", name: "Maki Thon Ciboulette", description: "Thon, ciboulette ciselée", price: 7.0, image: makiThonCiboulette.url },
      { id: "m-7", name: "Maki Crevette Guacamole", description: "Crevette, guacamole maison", price: 7.5, image: makiCrevetteGuacamole.url },
      { id: "m-8", name: "Maki Concombre Cheese", description: "Concombre, cheese", price: 5.5, image: makiConcombreCheese.url },
      { id: "m-9", name: "Maki Saumon", description: "Saumon premium", price: 6.5, image: makiSaumon.url },
    ],
  },
  {
    id: "nigiri",
    label: "Nigiri",
    items: [
      { id: "n-1", name: "Nigiri Saumon", description: "Riz tiède, saumon", price: 5.5, image: nigSaumon.url, pieces: 2 },
      { id: "n-2", name: "Nigiri Bar Snacké", description: "Bar snacké", price: 6.5, image: nigBarSnacke.url, pieces: 2 },
      { id: "n-3", name: "Nigiri Saumon Cheese", description: "Saumon, cheese", price: 6.0, image: nigSaumonCheese.url, pieces: 2 },
      { id: "n-4", name: "Nigiri Bar", description: "Bar cru", price: 6.5, image: nigBar.url, pieces: 2 },
      { id: "n-5", name: "Nigiri Saumon Snacké", description: "Saumon snacké", price: 6.0, image: nigSaumonSnacke.url, pieces: 2 },
      { id: "n-6", name: "Nigiri Thon Snacké", description: "Thon snacké", price: 6.9, image: nigThonSnacke.url, pieces: 2 },
      { id: "n-7", name: "Nigiri Gunkan Crabe Yuzu Hachi", description: "Crabe, yuzu, hachi", price: 7.5, image: nigGunkan.url, pieces: 2 },
      { id: "n-8", name: "Nigiri Crevette", description: "Crevette", price: 5.9, image: nigCrevette.url, pieces: 2 },
      { id: "n-9", name: "Nigiri Thon", description: "Thon rouge", price: 6.5, image: nigThon.url, pieces: 2 },
    ],
  },
  {
    id: "sashimi",
    label: "Sashimi",
    items: [
      { id: "sa-1", name: "Sashimi Mixte", description: "Assortiment saumon & thon", price: 7.8, image: saMixte.url, pieces: 6 },
      { id: "sa-2", name: "Sashimi Thon", description: "Tranches de thon rouge", price: 8.0, image: saThon.url, pieces: 6 },
      { id: "sa-3", name: "Sashimi Saumon", description: "Tranches de saumon", price: 7.5, image: saSaumon.url, pieces: 6 },
      { id: "sa-4", name: "Tataki Saumon", description: "Saumon snacké, condiments frais", price: 17.5, image: saTatakiSaumon.url, pieces: 12 },
      { id: "sa-5", name: "Sashimi Mixte Découverte", description: "Saumon, thon, bar", price: 17.9, image: sashimi },
      { id: "sa-6", name: "Tataki Thon", description: "Thon snacké, condiments frais", price: 18.5, image: saTatakiThon.url, pieces: 12 },
      { id: "sa-7", name: "Sashimi Imperial", description: "La grande sélection du chef", price: 16.0, image: saImperial.url, pieces: 12 },
      { id: "sa-8", name: "Sashimi Bar", description: "Bar délicat, jalapeño, masago", price: 7.8, image: saBar.url, pieces: 6 },
    ],
  },
  {
    id: "chirashi",
    label: "Chirashi",
    items: [
      { id: "ch-1", name: "Chirashi Thon Avocat", description: "Bol de riz, thon, avocat", price: 15.9, image: chirashiThon.url },
      { id: "ch-2", name: "Chirashi Mariné", description: "Poissons marinés, sauce maison", price: 16.5, image: chirashiMarine.url },
      { id: "ch-3", name: "Tartare du Moment", description: "Tartare de poisson du jour", price: 15.5, image: chirashiTartare.url },
      { id: "ch-4", name: "Chirashi Impériale", description: "La grande sélection chirashi", price: 19.9, image: chirashiImperiale.url },
      { id: "ch-5", name: "Chirashi Mixte Avocat", description: "Mix de poissons, avocat", price: 17.5, image: chirashiMixte.url },
      { id: "ch-6", name: "Chirashi Saumon Avocat", description: "Saumon, avocat, riz vinaigré", price: 14.9, image: chirashiSaumon.url },
    ],
  },
  {
    id: "poke",
    label: "Poke bowl",
    items: [
      { id: "po-1", name: "Poke Mixte", description: "Mix de protéines, légumes croquants", price: 15.5, image: pokeMixte.url },
      { id: "po-2", name: "Poke Saumon Teriyaki Snacké", description: "Saumon snacké, sauce teriyaki", price: 15.9, image: pokeSaumonTeriyaki.url },
      { id: "po-3", name: "Poke Poulet Teriyaki", description: "Poulet teriyaki, edamame", price: 16.5, image: pokePoulet.url },
      { id: "po-4", name: "Poke Bœuf Oignon", description: "Bœuf mariné, oignons frits", price: 16.5, image: pokeBoeuf.url },
      { id: "po-5", name: "Poke Veggie Falafel", description: "Falafels, légumes, avocat", price: 14.5, image: pokeVeggie.url },
      { id: "po-6", name: "Poke Thon", description: "Thon mariné, mangue, sésame", price: 15.5, image: pokeThon.url },
      { id: "po-7", name: "Poke Saumon", description: "Saumon, avocat, edamame", price: 15.5, image: pokeSaumon.url },
    ],
  },
  {
    id: "ramen",
    label: "Ramen et nouilles",
    items: [
      { id: "r-1", name: "Ramen Maison", description: "Bouillon longuement mijoté, chashu, œuf mariné", price: 15.5, image: ramen },
    ],
  },
  {
    id: "yakitori",
    label: "Yakitori",
    items: [
      { id: "y-1", name: "Yakitori Saumon", description: "Brochettes de saumon grillé", price: 9.9, image: yakitori },
      { id: "y-2", name: "Yakitori Tsukune", description: "Boulettes de poulet, sauce tare", price: 8.9, image: yakitori },
      { id: "y-3", name: "Yakitori Poulet Caramel", description: "Poulet laqué au caramel", price: 9.5, image: yakitori },
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
      { id: "a-1", name: "Salade d'algues", description: "Wakamé, sésame, sauce sésame", price: 4.9, image: edamame },
      { id: "a-2", name: "Bol de riz", description: "Riz koshihikari vapeur", price: 3.0, image: edamame },
      { id: "a-3", name: "Soupe miso crevette", description: "Miso, crevette, wakamé", price: 4.5, image: edamame },
      { id: "a-4", name: "Soupe miso", description: "Tofu, wakamé, ciboule", price: 3.5, image: edamame },
      { id: "a-5", name: "Salade de calmars", description: "Calmars, vinaigrette japonaise", price: 6.5, image: edamame },
      { id: "a-6", name: "Salade de chou", description: "Chou frais, sauce sésame", price: 3.9, image: edamame },
      { id: "a-7", name: "Soupe miso saumon", description: "Miso, saumon, wakamé", price: 4.9, image: edamame },
    ],
  },
  {
    id: "boissons",
    label: "Boissons",
    items: [
      { id: "b-1", name: "Coca-Cola", description: "Canette 33cl", price: 3.0, image: tea },
      { id: "b-2", name: "Bière Asahi", description: "Bière japonaise 33cl", price: 5.5, image: tea },
      { id: "b-3", name: "Oasis", description: "Tropical 33cl", price: 3.0, image: tea },
      { id: "b-4", name: "Bière Kirin", description: "Bière japonaise 33cl", price: 5.5, image: tea },
      { id: "b-5", name: "Coca Zero", description: "Canette 33cl", price: 3.0, image: tea },
      { id: "b-6", name: "Ramune", description: "Limonade japonaise", price: 4.5, image: tea },
      { id: "b-7", name: "Fuze Tea", description: "Thé glacé pêche 33cl", price: 3.5, image: tea },
      { id: "b-8", name: "San Pellegrino", description: "Eau pétillante 50cl", price: 3.5, image: tea },
      { id: "b-9", name: "Orangina", description: "Canette 33cl", price: 3.0, image: tea },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    items: [
      { id: "d-1", name: "Dessert du moment", description: "Création sucrée du chef pâtissier", price: 5.9, image: mochi },
    ],
  },
];

export const ADDONS: Product[] = [
  { id: "addon-tea", name: "Thé vert", description: "Infusion sencha", price: 3.5, image: tea },
  { id: "addon-ginger", name: "Gingembre extra", description: "Portion généreuse", price: 1.5, image: edamame },
  { id: "addon-edamame", name: "Edamame", description: "Fleur de sel", price: 4.5, image: edamame },
  { id: "addon-mochi", name: "Mochi", description: "Une pièce", price: 2.5, image: mochi },
];
