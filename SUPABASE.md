# Supabase Edo-San

Projet Supabase :

```env
VITE_SUPABASE_URL=https://bfkhikdnsoxpppqhpxfz.supabase.co
```

## Variables

À mettre en local dans `.env.local` et dans Vercel `Settings` → `Environment Variables` :

```env
VITE_SUPABASE_URL=https://bfkhikdnsoxpppqhpxfz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
```

Ne jamais commiter `.env.local`.

## Appliquer la base clients

1. Ouvrir Supabase.
2. Sélectionner le projet `Edo-San`.
3. Aller dans `SQL Editor`.
4. Cliquer sur `New query`.
5. Ouvrir le fichier `supabase/migrations/202607030001_customer_orders.sql`.
6. Copier tout le contenu SQL.
7. Coller dans Supabase SQL Editor.
8. Cliquer sur `Run`.

La migration crée :

- `customers` : profils clients avec prénom, nom, téléphone, e-mail, adresse principale.
- `customer_addresses` : adresses additionnelles.
- `orders` : historique de commandes.
- `order_items` : articles de chaque commande.
- `customer_backoffice` : vue optimisée pour le back-office, avec total dépensé, panier moyen, dernière commande et top 5 produits.

La migration ne crée aucune colonne bancaire et ne stocke aucune donnée de carte.

## Sécurité

- RLS est activé sur les tables clients et commandes.
- Un client connecté peut lire/modifier uniquement son propre profil.
- Le back-office lit la vue clients via `SUPABASE_SERVICE_ROLE_KEY`, côté serveur uniquement.
- Les informations bancaires restent chez Stripe.

## Après publication

Après ajout ou modification des variables Vercel, redéployer le site.

Important : si une clé secrète a été partagée dans un canal non sécurisé, la régénérer dans Supabase puis mettre à jour Vercel.
