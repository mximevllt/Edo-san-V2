import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Elements, ExpressCheckoutElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ArrowLeft, CalendarDays, Clock, Lock, ShieldCheck } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { formatPrice, useCart, type CartEntry } from "@/lib/cart-context";
import { createPaymentIntent } from "@/lib/api/payments.functions";
import { recordCustomerOrder } from "@/lib/api/customers.functions";
import { supabase } from "@/lib/supabase/client";
import { useCustomerAuth } from "@/lib/supabase/auth-context";

type Slot = "midi-today" | "soir-today" | "midi-tomorrow" | "soir-tomorrow" | "later";
type CheckoutStep = "details" | "payment";

type Billing = { name: string; email: string; phone: string };
type Address = { number: string; street: string; city: string };

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[+0-9 .()-]{8,}$/;
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

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
  const { items, total, clear } = useCart();
  const { customer, user } = useCustomerAuth();
  const deliveryFee = 3.5;
  const grandTotal = total + deliveryFee;
  const [step, setStep] = useState<CheckoutStep>("details");
  const [billing, setBilling] = useState<Billing>({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState<Address>({ number: "", street: "", city: "" });
  const [paymentReady, setPaymentReady] = useState(false);

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

  // Auto-scroll the time list into view when it appears
  const [timeListMounted, setTimeListMounted] = useState(false);
  useEffect(() => {
    if (pickedDate && !pickedTime) setTimeListMounted(true);
  }, [pickedDate, pickedTime]);

  useEffect(() => {
    if (!formOk && step === "payment") setStep("details");
  }, [formOk, step]);

  useEffect(() => {
    if (step !== "payment") setPaymentReady(false);
  }, [step]);

  useEffect(() => {
    if (!customer) return;
    setBilling((current) => ({
      name: current.name || `${customer.firstName} ${customer.lastName}`.trim(),
      email: current.email || customer.email,
      phone: current.phone || customer.phone,
    }));
    if (customer.defaultAddress) {
      setAddress((current) => {
        if (current.number || current.street || current.city) return current;
        return { number: "", street: customer.defaultAddress, city: "" };
      });
    }
  }, [customer]);

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
            items={items}
            billing={billing}
            address={address}
            pickedDate={pickedDate}
            pickedTime={pickedTime}
            total={total}
            deliveryFee={deliveryFee}
            grandTotal={grandTotal}
            customerAuthUserId={user?.id ?? null}
            onReadyChange={setPaymentReady}
            onPaid={clear}
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
            type="submit"
            form="stripe-payment-form"
            whileTap={paymentReady ? { scale: 0.98 } : undefined}
            disabled={!paymentReady}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-subtitle text-base uppercase tracking-wider transition",
              paymentReady
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
  items,
  billing,
  address,
  pickedDate,
  pickedTime,
  total,
  deliveryFee,
  grandTotal,
  customerAuthUserId,
  onReadyChange,
  onPaid,
}: {
  items: CartEntry[];
  billing: Billing;
  address: Address;
  pickedDate: Date | undefined;
  pickedTime: string | null;
  total: number;
  deliveryFee: number;
  grandTotal: number;
  customerAuthUserId: string | null;
  onReadyChange: (ready: boolean) => void;
  onPaid: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [serverAmount, setServerAmount] = useState<number | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);
  const publishableKeyMissing = !stripePromise;

  useEffect(() => {
    let cancelled = false;
    onReadyChange(false);
    setClientSecret(null);
    setServerAmount(null);
    setPaymentError(null);

    if (publishableKeyMissing) {
      setLoadingIntent(false);
      setPaymentError("La clé publique Stripe n'est pas configurée.");
      return () => {
        cancelled = true;
      };
    }

    if (!pickedDate || !pickedTime) {
      setLoadingIntent(false);
      setPaymentError("Le créneau de livraison est incomplet.");
      return () => {
        cancelled = true;
      };
    }

    setLoadingIntent(true);
    createPaymentIntent({
      data: {
        lines: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        customer: billing,
        delivery: {
          ...address,
          date: pickedDate.toISOString(),
          time: pickedTime,
        },
      },
    })
      .then((result) => {
        if (cancelled) return;
        setClientSecret(result.clientSecret);
        setServerAmount(result.amount);
        setPaymentError(null);
      })
      .catch((error) => {
        if (cancelled) return;
        setPaymentError(error instanceof Error ? error.message : "Impossible de préparer le paiement Stripe.");
      })
      .finally(() => {
        if (!cancelled) setLoadingIntent(false);
      });

    return () => {
      cancelled = true;
    };
  }, [address, billing, items, onReadyChange, pickedDate, pickedTime, publishableKeyMissing]);

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
            <span>{formatPrice(serverAmount != null ? serverAmount / 100 : grandTotal)}</span>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h3 className="font-subtitle text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Paiement sécurisé Stripe
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Carte bancaire, Apple Pay, Google Pay et PayPal sont affichés par Stripe selon le navigateur, l'appareil et les moyens activés dans votre compte Stripe.
        </p>
      </section>

      {loadingIntent && (
        <div className="mt-5 rounded-2xl border border-cream/10 bg-ink p-4 text-sm text-muted-foreground">
          Préparation du paiement sécurisé...
        </div>
      )}

      {paymentError && (
        <div className="mt-5 rounded-2xl border border-[#f4a23d]/35 bg-[#f4a23d]/10 px-4 py-3 text-xs leading-relaxed text-[#f4a23d]/80">
          {paymentError}
          <br />
          Ajoutez `STRIPE_SECRET_KEY` et `VITE_STRIPE_PUBLISHABLE_KEY` dans Vercel pour activer l'encaissement réel.
        </div>
      )}

      {clientSecret && stripePromise && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "night",
              variables: {
                colorPrimary: "#e43b4f",
                colorBackground: "#111111",
                colorText: "#f8f1df",
                colorDanger: "#f4a23d",
                borderRadius: "12px",
                fontFamily: "Inter, system-ui, sans-serif",
              },
            },
          }}
        >
          <StripePaymentForm
            items={items}
            billing={billing}
            address={address}
            pickedDate={pickedDate}
            pickedTime={pickedTime}
            grandTotal={serverAmount != null ? serverAmount / 100 : grandTotal}
            customerAuthUserId={customerAuthUserId}
            onReadyChange={onReadyChange}
            onPaid={onPaid}
          />
        </Elements>
      )}
    </motion.div>
  );
}

function StripePaymentForm({
  items,
  billing,
  address,
  pickedDate,
  pickedTime,
  grandTotal,
  customerAuthUserId,
  onReadyChange,
  onPaid,
}: {
  items: CartEntry[];
  billing: Billing;
  address: Address;
  pickedDate: Date | undefined;
  pickedTime: string | null;
  grandTotal: number;
  customerAuthUserId: string | null;
  onReadyChange: (ready: boolean) => void;
  onPaid: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    onReadyChange(Boolean(stripe && elements) && !submitting);
  }, [elements, onReadyChange, stripe, submitting]);

  async function confirmStripePayment() {
    if (!stripe || !elements) return;

    setSubmitting(true);
    setMessage(null);
    onReadyChange(false);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/`,
        payment_method_data: {
          billing_details: {
            name: billing.name,
            email: billing.email,
            phone: billing.phone,
          },
        },
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message ?? "Le paiement n'a pas pu aboutir.");
      setSubmitting(false);
      onReadyChange(true);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      setMessage("Paiement validé. Merci, votre commande est confirmée.");
      const { data: sessionData } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      try {
        await recordCustomerOrder({
          data: {
            accessToken: sessionData.session?.access_token,
            paymentIntentId: paymentIntent.id,
            customer: {
              authUserId: customerAuthUserId,
              firstName: billing.name.trim().split(/\s+/)[0] ?? "Client",
              lastName: billing.name.trim().split(/\s+/).slice(1).join(" ") || "Edo-San",
              phone: billing.phone,
              email: billing.email,
              defaultAddress: `${address.number} ${address.street}, ${address.city}`.trim(),
            },
            delivery: {
              address: `${address.number} ${address.street}, ${address.city}`.trim(),
              date: pickedDate ? pickedDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
              time: pickedTime ?? "",
            },
            lines: items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
            })),
            total: grandTotal,
          },
        });
        onPaid();
      } catch {
        setMessage("Paiement validé. La commande est payée, mais l'enregistrement back-office devra être vérifié.");
      }
    } else {
      setMessage("Paiement en cours de confirmation.");
    }
    setSubmitting(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await confirmStripePayment();
  }

  return (
    <form id="stripe-payment-form" onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div className="rounded-2xl border border-cream/10 bg-ink p-4">
        <p className="mb-3 font-subtitle text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Paiement express
        </p>
        <ExpressCheckoutElement onConfirm={confirmStripePayment} />
      </div>
      <div className="rounded-2xl border border-cream/10 bg-ink p-4">
        <p className="mb-3 font-subtitle text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Carte, PayPal et autres moyens disponibles
        </p>
        <PaymentElement options={{ layout: { type: "accordion", defaultCollapsed: false, radios: "always" } }} />
      </div>
      {message && (
        <p className="rounded-2xl border border-cream/10 bg-ink px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          {message}
        </p>
      )}
      {submitting && (
        <p className="text-center text-xs text-muted-foreground">
          Validation du paiement en cours...
        </p>
      )}
    </form>
  );
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
