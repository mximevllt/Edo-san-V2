import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin } from "lucide-react";
import { Navbar } from "@/components/edo/Navbar";

export const Route = createFileRoute("/evenements")({
  head: () => ({
    meta: [
      { title: "Évènements — Edo-San Sushi" },
      {
        name: "description",
        content:
          "Prestation sushi sur mesure pour vos évènements : anniversaires, séminaires, mariages, traiteur, buffet sushi et animations. Livraison, sur site ou sur place.",
      },
      { property: "og:title", content: "Évènements — Edo-San Sushi" },
      {
        property: "og:description",
        content: "Prestation sushi sur mesure pour vos évènements à Cotignac, Le Val et alentours.",
      },
    ],
  }),
  component: EvenementsPage,
});

function EvenementsPage() {
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-32 lg:pt-40">
        <header className="mb-12 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Edo-San · Sur mesure
          </span>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] text-cream">
            Évènements
          </h1>
        </header>

        <section className="rounded-3xl border border-cream/10 bg-ink-elevated p-8 md:p-12">
          <p className="text-lg leading-relaxed text-cream">
            Edo-San Sushi s'adapte, nous vous proposons une prestation sur mesure pour vos
            évènements :
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            anniversaires, séminaire, mariage, service traiteur, buffet sushi et toutes vos
            animations…
            <br />
            En livraison, sur site ou sur place.
          </p>
          <p className="mt-6 text-base leading-relaxed text-cream">
            Contactez-nous pour nous parler de votre projet.
          </p>
        </section>

        <section className="mt-10 rounded-3xl border border-cream/10 bg-ink-elevated p-8 md:p-12">
          <h2 className="font-display text-3xl text-cream md:text-4xl">Contact</h2>

          <ul className="mt-8 space-y-6">
            <li className="flex items-start gap-4">
              <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cream/15 bg-ink text-crimson">
                <Phone className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Téléphone</p>
                <a
                  href="tel:+33494592903"
                  className="mt-1 block text-lg text-cream transition hover:text-crimson"
                >
                  +33 4 94 59 29 03
                </a>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cream/15 bg-ink text-crimson">
                <Mail className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">E-mail</p>
                <a
                  href="mailto:contact@edosan-sushi.com"
                  className="mt-1 block text-lg text-cream transition hover:text-crimson"
                >
                  contact@edosan-sushi.com
                </a>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cream/15 bg-ink text-crimson">
                <MapPin className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Adresses</p>
                <p className="mt-1 text-lg leading-relaxed text-cream">
                  6, rue Marceau, 83143 Le Val
                  <br />
                  Zone Loup à Loup, 83570 Cotignac
                </p>
              </div>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
