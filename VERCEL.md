# Déploiement Vercel

Ce projet est une app **TanStack Start** (SSR + server functions). Elle se déploie sur Vercel via l'**adapter Nitro `vercel`**, qui produit le format `.vercel/output` attendu par la Build Output API de Vercel.

## Configuration automatique

- `vite.config.ts` détecte `process.env.VERCEL === "1"` (variable injectée automatiquement par Vercel) et bascule Nitro sur le preset `vercel`. En dehors de Vercel (dev local, Lovable), Nitro reste sur Cloudflare. **Aucune action manuelle requise.**
- `vercel.json` fixe `buildCommand: "vite build"` et laisse `framework: null` pour que Vercel n'essaie pas de re-détecter un framework et utilise notre sortie Nitro telle quelle.
- Pas besoin de `rewrites` SPA : TanStack Start fait du SSR, chaque URL est rendue côté serveur par la fonction serverless générée.

## Workflow Lovable ↔ GitHub ↔ Vercel

1. Tu continues à modifier le site dans **Lovable** comme d'habitude.
2. Lovable pousse automatiquement les commits sur **GitHub** (intégration native).
3. **Vercel** est connecté au repo GitHub et redéploie à chaque push.

Aucune des trois étapes ne casse les autres : la détection `VERCEL=1` n'affecte que les builds qui tournent sur Vercel.

## Variables d'environnement

- **Publiques** (exposées au navigateur) : préfixe `VITE_`, lues via `import.meta.env.VITE_*`. À déclarer dans Vercel → Project Settings → Environment Variables.
- **Secrètes** (server-only) : pas de préfixe, lues via `process.env.X` **uniquement à l'intérieur** d'un `.handler()` de `createServerFn` ou d'un server route. Ne jamais les lire au top-level d'un module.

### Paiement Stripe

Le paiement utilise Stripe avec un `PaymentIntent` créé côté serveur. Deux variables sont obligatoires :

- `STRIPE_SECRET_KEY` : clé secrète Stripe, server-only. Ne jamais l'exposer côté navigateur.
- `VITE_STRIPE_PUBLISHABLE_KEY` : clé publique Stripe, utilisée par le formulaire de paiement côté client.

Pour les tests, utiliser les clés sandbox :

- `STRIPE_SECRET_KEY=sk_test_...`
- `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

Pour la production, utiliser les clés live :

- `STRIPE_SECRET_KEY=sk_live_...`
- `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`

Dans Vercel :

1. Ouvrir le projet.
2. Aller dans `Settings` → `Environment Variables`.
3. Ajouter `STRIPE_SECRET_KEY` pour `Production`, `Preview` et `Development` selon le besoin.
4. Ajouter `VITE_STRIPE_PUBLISHABLE_KEY` pour les mêmes environnements.
5. Redéployer le site après ajout ou modification des variables.

Dans Stripe, les moyens de paiement souhaités doivent aussi être activés dans le Dashboard : carte bancaire, Apple Pay, Google Pay et PayPal selon disponibilité du compte.

### Supabase

Le compte client et la base back-office clients utilisent Supabase.

Variables à ajouter dans Vercel :

- `VITE_SUPABASE_URL` : URL du projet Supabase.
- `VITE_SUPABASE_ANON_KEY` : clé publique/publishable Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` : clé secrète Supabase, server-only.

La clé `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais avoir de préfixe `VITE_`, car elle ne doit jamais partir dans le navigateur.

## Server functions

Les `createServerFn` deviennent automatiquement des fonctions serverless Vercel — aucune réorganisation manuelle dans un dossier `/api` n'est nécessaire. Pour des endpoints HTTP bruts (webhooks, etc.), utiliser un server route dans `src/routes/api/`.

## Première mise en place sur Vercel

1. Importer le repo GitHub dans Vercel.
2. Laisser Vercel détecter — ou forcer Framework Preset = **Other**.
3. Build command : `vite build` (déjà dans `vercel.json`).
4. Output directory : **laisser vide** (Nitro écrit dans `.vercel/output`, détecté automatiquement par la Build Output API).
5. Ajouter les variables d'environnement nécessaires.
6. Deploy.
