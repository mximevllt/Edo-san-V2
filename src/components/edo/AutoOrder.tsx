import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Check, ChevronRight, Minus, Plus, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { formatPrice, useCart } from "@/lib/cart-context";
import {
  AUTO_CATEGORY_OPTIONS,
  STAR_INGREDIENTS,
  budgetFromSlider,
  generateAutoOrder,
  getRecommendedBudget,
  sliderFromBudget,
  type AppetiteLevel,
  type AutoCategory,
  type AutoOrderInput,
  type AutoOrderResult,
  type CollectivePreference,
  type PersonPreference,
  type Sex,
  type StarIngredient,
} from "@/lib/auto-order";

const ingredientLabels: Record<StarIngredient, string> = {
  saumon: "Saumon",
  thon: "Thon",
  crevette: "Crevette",
  poulet: "Poulet",
  crabe: "Crabe",
  bar: "Bar",
  daurade: "Daurade",
};

type Stage = "people" | "mode" | "intro" | "person" | "budget" | "collective" | "loading";

function defaultPerson(): PersonPreference {
  return {
    sex: "homme",
    age: 32,
    appetite: 3,
    preferredIngredients: [],
    excludedIngredients: [],
    includedCategories: [],
    wantsDessert: false,
  };
}

function defaultCollective(peopleCount: number): CollectivePreference {
  return {
    men: Math.ceil(peopleCount / 2),
    women: Math.floor(peopleCount / 2),
    appetite: 3,
    preferredIngredients: [],
    excludedIngredients: [],
    includedCategories: [],
    wantsDessert: false,
  };
}

export function AutoOrder({
  onBack,
  onComplete,
}: {
  onBack: () => void;
  onComplete: (result: AutoOrderResult, input: AutoOrderInput) => void;
}) {
  const { replaceWithAutoMix } = useCart();
  const [stage, setStage] = useState<Stage>("people");
  const [peopleCount, setPeopleCount] = useState(2);
  const [mode, setMode] = useState<"individual" | "collective">("collective");
  const [people, setPeople] = useState<PersonPreference[]>([defaultPerson(), defaultPerson()]);
  const [activePerson, setActivePerson] = useState(0);
  const [collective, setCollective] = useState(() => defaultCollective(2));
  const [budgetSlider, setBudgetSlider] = useState(0);
  const [budgetTouched, setBudgetTouched] = useState(false);

  useEffect(() => {
    setPeople((prev) =>
      Array.from({ length: peopleCount }, (_, index) => prev[index] ?? defaultPerson()),
    );
    setCollective((prev) => {
      const men = Math.min(prev.men, peopleCount);
      const women = Math.min(prev.women, peopleCount - men);
      return { ...prev, men, women };
    });
    setActivePerson((prev) => Math.min(prev, peopleCount - 1));
  }, [peopleCount]);

  const budget = budgetFromSlider(budgetSlider);

  const input = useMemo<AutoOrderInput>(() => {
    if (mode === "individual") {
      return { mode, peopleCount, budget, people };
    }
    return { mode, peopleCount, budget, collective };
  }, [mode, peopleCount, budget, people, collective]);

  const recommendation = useMemo(() => getRecommendedBudget(input), [input]);

  useEffect(() => {
    if (budgetTouched || (stage !== "budget" && stage !== "collective")) return;
    const defaultBudget = Math.round((recommendation.min + recommendation.max) / 2);
    setBudgetSlider(sliderFromBudget(defaultBudget));
  }, [budgetTouched, recommendation.max, recommendation.min, stage]);

  const updateBudgetSlider = (next: number) => {
    setBudgetTouched(true);
    setBudgetSlider(next);
  };

  const raiseBudgetToMinimum = () => {
    setBudgetTouched(true);
    setBudgetSlider(sliderFromBudget(recommendation.min));
  };

  function launch(fillRemaining = false) {
    setStage("loading");
    const result = generateAutoOrder(input, { fillRemaining });
    window.setTimeout(() => {
      replaceWithAutoMix(result.entries);
      onComplete(result, input);
    }, 2000);
  }

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="flex h-full flex-col bg-ink-elevated"
    >
      <div className="flex items-center justify-between border-b border-cream/10 px-6 py-5 pr-16 lg:pr-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-cream"
        >
          <ArrowLeft className="h-4 w-4" />
          Panier
        </button>
        <h2 className="font-display text-2xl text-cream">Auto-mix</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <AnimatePresence mode="wait" initial={false}>
          {stage === "loading" ? (
            <LoadingMix key="loading" />
          ) : (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="space-y-5"
            >
              {stage === "people" && (
                <StepShell
                  eyebrow="Étape 1"
                  title="Combien de personnes ?"
                  description="On calibre les quantités avant de parler goûts et budget."
                >
                  <Counter value={peopleCount} min={1} max={12} onChange={setPeopleCount} />
                  <PrimaryButton onClick={() => setStage("mode")}>Continuer</PrimaryButton>
                </StepShell>
              )}

              {stage === "mode" && (
                <StepShell
                  eyebrow="Étape 2"
                  title="Comment renseigner les goûts ?"
                  description="Choisis le mode le plus rapide pour la table."
                >
                  <div className="grid gap-3">
                    <ModeButton
                      active={mode === "individual"}
                      title="Préférences individuelles"
                      text="Chaque personne renseigne ses goûts séparément."
                      onClick={() => setMode("individual")}
                    />
                    <ModeButton
                      active={mode === "collective"}
                      title="Préférences collectives"
                      text="Un seul réglage pour tout le groupe."
                      onClick={() => setMode("collective")}
                    />
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    En individuel, passez l'appareil à chaque invité. En collectif, les préférences sont appliquées une
                    seule fois à toute la commande.
                  </p>
                  <PrimaryButton onClick={() => setStage(mode === "individual" ? "intro" : "collective")}>
                    Valider
                  </PrimaryButton>
                </StepShell>
              )}

              {stage === "intro" && (
                <StepShell
                  eyebrow="Préférences individuelles"
                  title="Chacun son tour"
                  description="Les préférences alimentaires de chaque invité vont être demandées indépendamment. Passez l'appareil à chaque personne pour qu'elle renseigne ses goûts elle-même."
                >
                  <PrimaryButton
                    onClick={() => {
                      setActivePerson(0);
                      setStage("person");
                    }}
                  >
                    Commencer
                  </PrimaryButton>
                </StepShell>
              )}

              {stage === "person" && (
                <StepShell
                  eyebrow={`Personne ${activePerson + 1} / ${peopleCount}`}
                  title="Préférences"
                  description="Chaque profil nourrit une moyenne commune pour composer le panier final."
                >
                  <PersonForm
                    value={people[activePerson]}
                    onChange={(next) =>
                      setPeople((prev) => prev.map((person, index) => (index === activePerson ? next : person)))
                    }
                  />
                  <PrimaryButton
                    onClick={() => {
                      if (activePerson + 1 < peopleCount) {
                        setActivePerson(activePerson + 1);
                      } else {
                        setStage("budget");
                      }
                    }}
                  >
                    {activePerson + 1 < peopleCount ? "Personne suivante" : "Définir le budget"}
                  </PrimaryButton>
                </StepShell>
              )}

              {stage === "budget" && (
                <StepShell
                  eyebrow="Budget commun"
                  title="Budget maximum"
                  description="Le budget s'applique à toute la commande, pas personne par personne."
                >
                  <BudgetPanel
                    budget={budget}
                    slider={budgetSlider}
                    recommendation={recommendation}
                    onSliderChange={updateBudgetSlider}
                    onRaiseBudget={raiseBudgetToMinimum}
                  />
                  <PrimaryButton onClick={() => launch(false)} launch>
                    <span className="hidden min-[430px]:inline">Lancer l'auto-mix</span>
                    <span className="hidden min-[350px]:inline min-[430px]:hidden">Lancer auto-mix</span>
                    <span className="min-[350px]:hidden">Auto-mix</span>
                  </PrimaryButton>
                </StepShell>
              )}

              {stage === "collective" && (
                <StepShell
                  eyebrow="Préférences collectives"
                  title="Réglages de groupe"
                  description="On utilise la répartition hommes/femmes pour ajuster les quantités, sans séparer le panier."
                >
                  <div className="grid grid-cols-2 gap-3">
                    <CounterCard
                      label="Hommes"
                      value={collective.men}
                      min={0}
                      max={peopleCount}
                      onChange={(men) => setCollective((prev) => ({ ...prev, men, women: Math.min(prev.women, peopleCount - men) }))}
                    />
                    <CounterCard
                      label="Femmes"
                      value={collective.women}
                      min={0}
                      max={peopleCount}
                      onChange={(women) => setCollective((prev) => ({ ...prev, women, men: Math.min(prev.men, peopleCount - women) }))}
                    />
                  </div>
                  {peopleCount - collective.men - collective.women > 0 && (
                    <p className="rounded-xl border border-cream/10 bg-ink px-3 py-2 text-xs text-muted-foreground">
                      {peopleCount - collective.men - collective.women} personne
                      {peopleCount - collective.men - collective.women > 1 ? "s" : ""} sera calibrée avec un appétit
                      moyen neutre.
                    </p>
                  )}
                  <CollectiveForm value={collective} onChange={setCollective} />
                  <BudgetPanel
                    budget={budget}
                    slider={budgetSlider}
                    recommendation={recommendation}
                    onSliderChange={updateBudgetSlider}
                    onRaiseBudget={raiseBudgetToMinimum}
                  />
                  <PrimaryButton onClick={() => launch(false)} launch>
                    <span className="hidden min-[430px]:inline">Lancer l'auto-mix</span>
                    <span className="hidden min-[350px]:inline min-[430px]:hidden">Lancer auto-mix</span>
                    <span className="min-[350px]:hidden">Auto-mix</span>
                  </PrimaryButton>
                </StepShell>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function StepShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div>
        <p className="font-subtitle text-xs uppercase tracking-[0.22em] text-crimson">{eyebrow}</p>
        <h3 className="mt-2 font-display text-3xl leading-none text-cream">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function PrimaryButton({
  children,
  onClick,
  launch,
}: {
  children: ReactNode;
  onClick: () => void;
  launch?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-2xl bg-crimson px-4 py-4 font-subtitle text-sm uppercase tracking-wider text-crimson-foreground crimson-glow transition hover:brightness-110",
        launch && "animate-crimson-pulse whitespace-nowrap",
      )}
    >
      {launch && <Sparkles className="h-4 w-4 shrink-0" />}
      {children}
      {!launch && <ChevronRight className="h-4 w-4" />}
    </motion.button>
  );
}

function ModeButton({
  active,
  title,
  text,
  onClick,
}: {
  active: boolean;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
        active ? "border-crimson bg-crimson/10 text-cream" : "border-cream/15 bg-ink text-cream hover:border-cream/30",
      )}
    >
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{text}</span>
      </span>
      <span className={cn("grid h-6 w-6 place-items-center rounded-full border", active ? "border-crimson bg-crimson" : "border-cream/20")}>
        {active && <Check className="h-3.5 w-3.5 text-crimson-foreground" />}
      </span>
    </button>
  );
}

function Counter({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <div className="mx-auto flex max-w-xs items-center justify-center gap-5 rounded-3xl border border-cream/10 bg-ink p-4">
      <RoundIconButton icon="minus" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} />
      <span className="min-w-16 text-center font-display text-5xl leading-none text-cream tabular-nums">{value}</span>
      <RoundIconButton icon="plus" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} />
    </div>
  );
}

function CounterCard({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-cream/10 bg-ink p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <RoundIconButton small icon="minus" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} />
        <span className="font-display text-3xl text-cream tabular-nums">{value}</span>
        <RoundIconButton small icon="plus" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} />
      </div>
    </div>
  );
}

function RoundIconButton({
  icon,
  disabled,
  small,
  onClick,
}: {
  icon: "plus" | "minus";
  disabled?: boolean;
  small?: boolean;
  onClick: () => void;
}) {
  const Icon = icon === "plus" ? Plus : Minus;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-crimson text-crimson-foreground transition disabled:cursor-not-allowed disabled:opacity-35",
        small ? "h-9 w-9" : "h-12 w-12 crimson-glow",
      )}
    >
      <Icon className={small ? "h-4 w-4" : "h-5 w-5"} />
    </button>
  );
}

function PersonForm({ value, onChange }: { value: PersonPreference; onChange: (value: PersonPreference) => void }) {
  return (
    <div className="space-y-5">
      <SegmentedSex value={value.sex} onChange={(sex) => onChange({ ...value, sex })} />
      <AgeField value={value.age} onChange={(age) => onChange({ ...value, age })} />
      <AppetiteSlider value={value.appetite} onChange={(appetite) => onChange({ ...value, appetite })} />
      <IngredientPicker value={value} onChange={onChange} allowExclusions={false} />
      <CategoryPicker value={value.includedCategories} onChange={(includedCategories) => onChange({ ...value, includedCategories })} />
      <DessertToggle checked={value.wantsDessert} onChange={(wantsDessert) => onChange({ ...value, wantsDessert })} />
    </div>
  );
}

function CollectiveForm({ value, onChange }: { value: CollectivePreference; onChange: (value: CollectivePreference) => void }) {
  return (
    <div className="space-y-5">
      <AppetiteSlider value={value.appetite} onChange={(appetite) => onChange({ ...value, appetite })} />
      <IngredientPicker value={value} onChange={onChange} allowExclusions />
      <CategoryPicker value={value.includedCategories} onChange={(includedCategories) => onChange({ ...value, includedCategories })} />
      <DessertToggle checked={value.wantsDessert} onChange={(wantsDessert) => onChange({ ...value, wantsDessert })} />
    </div>
  );
}

function SegmentedSex({ value, onChange }: { value: Sex; onChange: (value: Sex) => void }) {
  return (
    <div>
      <Label>Sexe</Label>
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-cream/10 bg-ink p-1">
        {(["homme", "femme"] as Sex[]).map((sex) => (
          <button
            key={sex}
            type="button"
            onClick={() => onChange(sex)}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-semibold capitalize transition",
              value === sex ? "bg-crimson text-crimson-foreground" : "text-muted-foreground hover:text-cream",
            )}
          >
            {sex}
          </button>
        ))}
      </div>
    </div>
  );
}

function AgeField({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="rounded-2xl border border-cream/10 bg-ink p-4">
      <div className="mb-3 flex items-center justify-between">
        <Label>Âge</Label>
        <span className="font-display text-2xl text-cream">{value} ans</span>
      </div>
      <Slider
        value={[value]}
        min={5}
        max={99}
        step={1}
        onValueChange={([next]) => onChange(Math.max(5, Math.min(99, Math.round(next))))}
        className="py-2"
      />
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>5 ans</span>
        <span>99 ans</span>
      </div>
    </div>
  );
}

function AppetiteSlider({ value, onChange }: { value: AppetiteLevel; onChange: (value: AppetiteLevel) => void }) {
  return (
    <div className="rounded-2xl border border-cream/10 bg-ink p-4">
      <div className="mb-3 flex items-center justify-between">
        <Label>Niveau d'appétit</Label>
        <span className="font-display text-2xl text-cream">{value}/5</span>
      </div>
      <Slider
        value={[value]}
        min={1}
        max={5}
        step={1}
        onValueChange={([next]) => onChange(next as AppetiteLevel)}
        className="py-2"
      />
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>Léger</span>
        <span>Très faim</span>
      </div>
    </div>
  );
}

function IngredientPicker<T extends { preferredIngredients: StarIngredient[]; excludedIngredients: StarIngredient[] }>({
  value,
  onChange,
  allowExclusions,
}: {
  value: T;
  onChange: (value: T) => void;
  allowExclusions: boolean;
}) {
  const togglePreferred = (ingredient: StarIngredient) => {
    if (value.excludedIngredients.includes(ingredient)) return;
    const next = value.preferredIngredients.includes(ingredient)
      ? value.preferredIngredients.filter((item) => item !== ingredient)
      : [...value.preferredIngredients, ingredient];
    onChange({ ...value, preferredIngredients: next });
  };

  const toggleExcluded = (ingredient: StarIngredient) => {
    const excluded = value.excludedIngredients.includes(ingredient)
      ? value.excludedIngredients.filter((item) => item !== ingredient)
      : [...value.excludedIngredients, ingredient];
    onChange({
      ...value,
      excludedIngredients: excluded,
      preferredIngredients: value.preferredIngredients.filter((item) => !excluded.includes(item)),
    });
  };

  return (
    <div className="space-y-4">
      <ChipGroup title="Préférences alimentaires">
        {STAR_INGREDIENTS.map((ingredient) => (
          <Chip
            key={ingredient}
            active={value.preferredIngredients.includes(ingredient)}
            disabled={value.excludedIngredients.includes(ingredient)}
            onClick={() => togglePreferred(ingredient)}
          >
            {ingredientLabels[ingredient]}
          </Chip>
        ))}
      </ChipGroup>
      {allowExclusions && (
        <ChipGroup title="À exclure du mix">
          {STAR_INGREDIENTS.map((ingredient) => (
            <Chip
              key={ingredient}
              active={value.excludedIngredients.includes(ingredient)}
              danger
              onClick={() => toggleExcluded(ingredient)}
            >
              {ingredientLabels[ingredient]}
            </Chip>
          ))}
        </ChipGroup>
      )}
    </div>
  );
}

function CategoryPicker({ value, onChange }: { value: AutoCategory[]; onChange: (value: AutoCategory[]) => void }) {
  return (
    <ChipGroup title="Catégories à inclure">
      {AUTO_CATEGORY_OPTIONS.map((category) => (
        <Chip
          key={category.id}
          active={value.includes(category.id)}
          onClick={() =>
            onChange(value.includes(category.id) ? value.filter((item) => item !== category.id) : [...value, category.id])
          }
        >
          {category.label}
        </Chip>
      ))}
      {value.length === 0 && (
        <p className="basis-full pt-1 text-xs leading-relaxed text-muted-foreground">
          Cochez au moins une catégorie pour indiquer ce que l'Auto-mix peut mettre dans le panier.
        </p>
      )}
    </ChipGroup>
  );
}

function DessertToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
        checked ? "border-crimson bg-crimson/10" : "border-cream/15 bg-ink hover:border-cream/30",
      )}
    >
      <span>
        <span className="block text-sm font-semibold text-cream">Dessert</span>
        <span className="text-xs text-muted-foreground">Ajouter une touche sucrée au mix</span>
      </span>
      <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", checked ? "bg-crimson text-crimson-foreground" : "bg-cream/10 text-muted-foreground")}>
        {checked ? "Oui" : "Non"}
      </span>
    </button>
  );
}

function BudgetPanel({
  budget,
  slider,
  recommendation,
  onSliderChange,
  onRaiseBudget,
}: {
  budget: number;
  slider: number;
  recommendation: { min: number; max: number };
  onSliderChange: (value: number) => void;
  onRaiseBudget: () => void;
}) {
  const tooLow = budget < recommendation.min;
  return (
    <div className="rounded-3xl border border-cream/10 bg-ink p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-subtitle text-xs uppercase tracking-[0.22em] text-muted-foreground">Fourchette conseillée</p>
          <p className="mt-1 text-sm text-cream">
            {formatPrice(recommendation.min)} à {formatPrice(recommendation.max)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Budget max</p>
          <p className="font-display text-3xl leading-none text-cream">{formatPrice(budget)}</p>
        </div>
      </div>
      <div className="mt-5">
        <Slider
          value={[slider]}
          min={0}
          max={100}
          step={1}
          onValueChange={([next]) => onSliderChange(next)}
          className="py-3"
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>0 €</span>
          <span>80 €</span>
          <span>250 €</span>
          <span>600 €</span>
        </div>
      </div>
      {tooLow && (
        <div className="mt-4 rounded-2xl border border-[#f4a23d]/40 bg-[#f4a23d]/10 p-3 text-[#f4a23d]/70">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Budget probablement trop juste</p>
              <p className="mt-1 text-xs leading-relaxed">
                La commande risque de ne pas satisfaire complètement l'appétit choisi.
              </p>
              <button type="button" onClick={onRaiseBudget} className="mt-2 text-xs font-semibold underline underline-offset-4">
                Augmenter au minimum conseillé
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChipGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <Label>{title}</Label>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  disabled,
  danger,
  children,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-35",
        active
          ? danger
            ? "border-crimson bg-crimson text-crimson-foreground"
            : "border-crimson bg-crimson/15 text-cream"
          : "border-cream/15 bg-ink text-muted-foreground hover:border-cream/35 hover:text-cream",
      )}
    >
      {children}
    </button>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{children}</span>;
}

function LoadingMix() {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
      <div className="auto-mix-loader relative grid h-28 w-28 place-items-center">
        <span className="auto-spark auto-spark-1" />
        <span className="auto-spark auto-spark-2" />
        <span className="auto-spark auto-spark-3" />
        <span className="auto-sushi-icon">
          <span />
        </span>
      </div>
      <p className="mt-6 font-display text-3xl text-cream">Composition du mix</p>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        On équilibre appétit, budget, préférences et exclusions.
      </p>
    </div>
  );
}
