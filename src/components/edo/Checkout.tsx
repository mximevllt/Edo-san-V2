import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, CreditCard, Lock, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { formatPrice, useCart } from "@/lib/cart-context";

type Slot = "midi-today" | "soir-today" | "midi-tomorrow" | "soir-tomorrow" | "later";
type CheckoutStep = "details" | "payment";
type PaymentMethod = "apple-pay" | "google-pay" | "paypal" | "card";

type Billing = { name: string; email: string; phone: string };
type Address = { number: string; street: string; city: string };
type CardDetails = { number: string; expiry: string; cvc: string; name: string };

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[+0-9 .()-]{8,}$/;

function buildTimes() {
  const out: string[] = [];
  // 11:15 → 21:45 every 15 min
  for (let m = 11 * 60 + 15; m <= 21 * 60 + 45; m += 15) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    out.push(`${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  }
  return out;
}
const TIMES = buildTimes();

function getPeriod(d: Date): "evening" | "earlymorning" | "morning" | "day" {
  const minutes = d.getHours() * 60 + d.getMinutes();
  if (minutes >= 19 * 60 || minutes < 4 * 60 + 30) return "evening"; // 19h - 4h30
  if (minutes < 11 * 60) return "morning"; // 4h30 - 11h
  return "day"; // 11h - 19h
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function Checkout({ onBack }: { onBack: () => void }) {
  const { total } = useCart();
  const deliveryFee = 3.5;
  const grandTotal = total + deliveryFee;
  const [step, setStep] = useState<CheckoutStep>("details");
  const [billing, setBilling] = useState<Billing>({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState<Address>({ number: "", street: "", city: "" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [card, setCard] = useState<CardDetails>({ number: "", expiry: "", cvc: "", name: "" });

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [pickedDate, setPickedDate] = useState<Date | undefined>(undefined);
  const [pickedTime, setPickedTime] = useState<string | null>(null);

  const period = useMemo(() => getPeriod(new Date()), []);

  // Options for the 3 buttons based on current time
  const slotOptions = useMemo<{ id: Exclude<Slot, "later">; label: string }[]>(() => {
    if (period === "evening") {
      return [
        { id: "midi-tomorrow", label: "Commander pour demain midi" },
        { id: "soir-tomorrow", label: "Commander pour demain soir" },
      ];
    }
    if (period === "morning") {
      return [
        { id: "midi-today", label: "Commander pour ce midi" },
        { id: "soir-today", label: "Commander pour ce soir" },
      ];
    }
    return [
      { id: "soir-today", label: "Commander pour ce soir" },
      { id: "soir-tomorrow", label: "Commander pour demain soir" },
    ];
  }, [period]);

  // When picking a quick slot, set date automatically and jump to time picker
  function handleQuickSlot(slot: Exclude<Slot, "later">) {
    setSelectedSlot(slot);
    setPickedTime(null);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (slot === "midi-today" || slot === "soir-today") {
      setPickedDate(today);
    } else {
      setPickedDate(addDays(today, 1));
    }
  }

  function handleLater() {
    setSelectedSlot("later");
    setPickedDate(undefined);
    setPickedTime(null);
  }

  // Validation
  const billingOk =
    billing.name.trim().length >= 2 && emailRe.test(billing.email.trim()) && phoneRe.test(billing.phone.trim());
  const addressOk =
    address.number.trim().length > 0 && address.street.trim().length >= 2 && address.city.trim().length >= 2;
  const scheduleOk = !!pickedDate && !!pickedTime;
  const formOk = billingOk && addressOk && scheduleOk;
  const cardOk =
    card.number.replace(/\D/g, "").length >= 15 &&
    /^\d{2}\/\d{2}$/.test(card.expiry.trim()) &&
    card.cvc.replace(/\D/g, "").length >= 3 &&
    card.name.trim().length >= 2;
  const paymentOk = paymentMethod === "card" ? cardOk : true;

  // Auto-scroll the time list into view when it appears
  const [timeListMounted, setTimeListMounted] = useState(false);
  useEffect(() => {
    if (pickedDate && !pickedTime) setTimeListMounted(true);
  }, [pickedDate, pickedTime]);

  useEffect(() => {
    if (!formOk && step === "payment") setStep("details");
  }, [formOk, step]);

  const backLabel = step === "payment" ? "Commande" : "Panier";
  const handleBack = () => {
    if (step === "payment") {
      setStep("details");
      return;
    }
    onBack();
  };

  return (
    <motion.div
      key="checkout"
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="flex h-full flex-col bg-ink-elevated"
    >
      <div className="flex items-center justify-between border-b border-cream/10 px-6 py-5 pr-16 lg:pr-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-cream"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </button>
        <h2 className="font-display text-2xl text-cream">{step === "payment" ? "Paiement" : "Commande"}</h2>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === "details" ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-y-auto px-6 py-5"
          >
            <section>
              <h3 className="font-subtitle text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Détail de facturation
              </h3>
              <div className="mt-3 space-y-3">
                <Field
                  label="Prénom et Nom"
                  placeholder="Juste Leblanc"
                  value={billing.name}
                  onChange={(v) => setBilling({ ...billing, name: v })}
                />
                <Field
                  label="Adresse e-mail"
                  type="email"
                  placeholder="juste.leblanc@email.com"
                  value={billing.email}
                  onChange={(v) => setBilling({ ...billing, email: v })}
                />
                <Field
                  label="Numéro de téléphone"
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={billing.phone}
                  onChange={(v) => setBilling({ ...billing, phone: v })}
                />
              </div>
            </section>

            <section className="mt-8">
              <h3 className="font-subtitle text-xs uppercase tracking-[0.22em] text-muted-foreground">Livraison</h3>
              <div className="mt-3 grid grid-cols-[90px_minmax(0,1fr)] gap-3">
                <Field
                  label="Numéro"
                  placeholder="6 bis"
                  value={address.number}
                  onChange={(v) => setAddress({ ...address, number: v })}
                />
                <Field
                  label="Rue"
                  placeholder="Rue Marceau"
                  value={address.street}
                  onChange={(v) => setAddress({ ...address, street: v })}
                />
              </div>
              <div className="mt-3">
                <Field
                  label="Ville"
                  placeholder="Le Val"
                  value={address.city}
                  onChange={(v) => setAddress({ ...address, city: v })}
                />
              </div>

              <div className="mt-6">
                <p className="font-subtitle text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Quand récupérer la commande ?
                </p>
                <div className="mt-3 space-y-2">
                  {slotOptions.map((opt) => {
                    const active = selectedSlot === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleQuickSlot(opt.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition",
                          active
                            ? "border-crimson bg-crimson/10 text-cream"
                            : "border-cream/15 bg-ink text-cream hover:border-cream/30",
                        )}
                      >
                        <span className="font-medium">{opt.label}</span>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </button>
                    );
                  })}

                  <button
                    onClick={handleLater}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition",
                      selectedSlot === "later"
                        ? "border-crimson bg-crimson/10 text-cream"
                        : "border-cream/15 bg-ink text-cream hover:border-cream/30",
                    )}
                  >
                    <span className="font-medium">Commander pour plus tard</span>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </button>

                  <AnimatePresence initial={false}>
                    {selectedSlot === "later" && (
                      <motion.div
                        key="cal"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 rounded-xl border border-cream/15 bg-ink p-2">
                          <Calendar
                            mode="single"
                            selected={pickedDate}
                            onSelect={(d) => {
                              setPickedDate(d ?? undefined);
                              setPickedTime(null);
                            }}
                            disabled={{ before: new Date() }}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence initial={false}>
                    {pickedDate && (
                      <motion.div
                        key="times"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 rounded-xl border border-cream/15 bg-ink p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {pickedDate ? formatDate(pickedDate) : ""}
                            </span>
                            {pickedTime && <span className="font-display text-base text-cream">{pickedTime}</span>}
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {TIMES.map((t) => {
                              const active = pickedTime === t;
                              return (
                                <button
                                  key={t}
                                  onClick={() => setPickedTime(t)}
                                  className={cn(
                                    "rounded-md border px-2 py-1.5 text-xs tabular-nums transition",
                                    active
                                      ? "border-crimson bg-crimson text-crimson-foreground"
                                      : "border-cream/15 text-cream hover:border-cream/40",
                                  )}
                                >
                                  {t}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <PaymentStep
            key="payment"
            billing={billing}
            address={address}
            pickedDate={pickedDate}
            pickedTime={pickedTime}
            total={total}
            deliveryFee={deliveryFee}
            grandTotal={grandTotal}
            paymentMethod={paymentMethod}
            onMethodChange={setPaymentMethod}
            card={card}
            onCardChange={setCard}
            paymentOk={paymentOk}
          />
        )}
      </AnimatePresence>

      {step === "details" ? (
        <div className="border-t border-cream/10 bg-ink px-6 py-5">
          <motion.button
            whileTap={formOk ? { scale: 0.98 } : undefined}
            disabled={!formOk}
            onClick={() => setStep("payment")}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-subtitle text-base uppercase tracking-wider transition",
              formOk
                ? "bg-crimson text-crimson-foreground crimson-glow animate-pay-ready"
                : "cursor-not-allowed bg-[#2a2a2a] text-muted-foreground",
            )}
          >
            Payer
          </motion.button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Paiement sécurisé · Livraison 25–35 min</p>
        </div>
      ) : (
        <div className="border-t border-cream/10 bg-ink px-6 py-5">
          <motion.button
            whileTap={paymentOk ? { scale: 0.98 } : undefined}
            disabled={!paymentOk}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-subtitle text-base uppercase tracking-wider transition",
              paymentOk
                ? "bg-crimson text-crimson-foreground crimson-glow animate-pay-ready"
                : "cursor-not-allowed bg-[#2a2a2a] text-muted-foreground",
            )}
          >
            <Lock className="h-4 w-4" />
            Payer {formatPrice(grandTotal)}
          </motion.button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Transaction chiffrée · Aucune carte stockée sur le site
          </p>
        </div>
      )}
    </motion.div>
  );
}

function PaymentStep({
  billing,
  address,
  pickedDate,
  pickedTime,
  total,
  deliveryFee,
  grandTotal,
  paymentMethod,
  onMethodChange,
  card,
  onCardChange,
  paymentOk,
}: {
  billing: Billing;
  address: Address;
  pickedDate: Date | undefined;
  pickedTime: string | null;
  total: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  card: CardDetails;
  onCardChange: (card: CardDetails) => void;
  paymentOk: boolean;
}) {
  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.2 }}
      className="flex-1 overflow-y-auto px-6 py-5"
    >
      <section className="rounded-2xl border border-cream/10 bg-ink p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-subtitle text-xs uppercase tracking-[0.22em] text-muted-foreground">Résumé</p>
            <p className="mt-1 text-sm font-semibold text-cream">{billing.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {address.number} {address.street}, {address.city}
              <br />
              {pickedDate ? formatDate(pickedDate) : ""} · {pickedTime}
            </p>
          </div>
          <ShieldCheck className="h-5 w-5 shrink-0 text-crimson" />
        </div>
        <div className="mt-4 space-y-1.5 border-t border-cream/10 pt-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Sous-total</span>
            <span className="text-cream">{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Livraison</span>
            <span className="text-cream">{formatPrice(deliveryFee)}</span>
          </div>
          <div className="flex justify-between pt-2 font-display text-2xl text-cream">
            <span>Total</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h3 className="font-subtitle text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Moyen de paiement
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <PaymentMethodButton
            method="apple-pay"
            active={paymentMethod === "apple-pay"}
            title="Apple Pay"
            icon={<Smartphone className="h-4 w-4" />}
            onClick={onMethodChange}
          />
          <PaymentMethodButton
            method="google-pay"
            active={paymentMethod === "google-pay"}
            title="Google Pay"
            icon={<Wallet className="h-4 w-4" />}
            onClick={onMethodChange}
          />
          <PaymentMethodButton
            method="paypal"
            active={paymentMethod === "paypal"}
            title="PayPal"
            icon={<Wallet className="h-4 w-4" />}
            onClick={onMethodChange}
          />
          <PaymentMethodButton
            method="card"
            active={paymentMethod === "card"}
            title="Carte bancaire"
            icon={<CreditCard className="h-4 w-4" />}
            onClick={onMethodChange}
          />
        </div>
      </section>

      <AnimatePresence mode="wait" initial={false}>
        {paymentMethod === "card" ? (
          <motion.section
            key="card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="mt-5 rounded-2xl border border-cream/10 bg-ink p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-subtitle text-xs uppercase tracking-[0.22em] text-muted-foreground">Carte bancaire</p>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                Sécurisé
              </div>
            </div>
            <div className="space-y-3">
              <Field
                label="Numéro de carte"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                value={card.number}
                onChange={(number) => onCardChange({ ...card, number })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Expiration"
                  inputMode="numeric"
                  placeholder="MM/AA"
                  value={card.expiry}
                  onChange={(expiry) => onCardChange({ ...card, expiry })}
                />
                <Field
                  label="CVC"
                  inputMode="numeric"
                  placeholder="123"
                  value={card.cvc}
                  onChange={(cvc) => onCardChange({ ...card, cvc })}
                />
              </div>
              <Field
                label="Nom sur la carte"
                placeholder="Juste Leblanc"
                value={card.name}
                onChange={(name) => onCardChange({ ...card, name })}
              />
            </div>
          </motion.section>
        ) : (
          <motion.section
            key={paymentMethod}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="mt-5 rounded-2xl border border-cream/10 bg-ink p-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-crimson" />
              <div>
                <p className="text-sm font-semibold text-cream">{paymentLabel(paymentMethod)} sélectionné</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  En production, ce bouton ouvrira la fenêtre sécurisée du service choisi pour confirmer le paiement.
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {!paymentOk && (
        <p className="mt-3 rounded-2xl border border-[#f4a23d]/35 bg-[#f4a23d]/10 px-4 py-3 text-xs leading-relaxed text-[#f4a23d]/80">
          Complétez les informations de carte pour activer le paiement.
        </p>
      )}
    </motion.div>
  );
}

function PaymentMethodButton({
  method,
  active,
  title,
  icon,
  onClick,
}: {
  method: PaymentMethod;
  active: boolean;
  title: string;
  icon: React.ReactNode;
  onClick: (method: PaymentMethod) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(method)}
      className={cn(
        "flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-center transition",
        active ? "border-crimson bg-crimson/10 text-cream" : "border-cream/15 bg-ink text-muted-foreground hover:border-cream/35 hover:text-cream",
      )}
    >
      <span className={cn("grid h-9 w-9 place-items-center rounded-full", active ? "bg-crimson text-crimson-foreground" : "bg-cream/10")}>
        {icon}
      </span>
      <span className="text-xs font-semibold">{title}</span>
    </button>
  );
}

function paymentLabel(method: PaymentMethod) {
  if (method === "apple-pay") return "Apple Pay";
  if (method === "google-pay") return "Google Pay";
  if (method === "paypal") return "PayPal";
  return "Carte bancaire";
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-lg border border-cream/15 bg-ink px-3 py-2.5 text-sm text-cream placeholder:text-muted-foreground/60 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson"
      />
    </label>
  );
}
