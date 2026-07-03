import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured, useCustomerAuth } from "@/lib/supabase/auth-context";

type Mode = "login" | "signup";

const initialForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
  address: "",
};

export function CustomerAccess({ className }: { className?: string }) {
  const { customer, loading, signIn, signUp, signOut } = useCustomerAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingFirstName, setPendingFirstName] = useState<string | null>(null);

  const firstName = customer?.firstName?.trim() || pendingFirstName;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      if (mode === "login") {
        await signIn({ email: form.email, password: form.password });
        setPendingFirstName(null);
        setOpen(false);
      } else {
        const result = await signUp({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          password: form.password,
          address: form.address,
        });
        setPendingFirstName(result.firstName);
        setForm(initialForm);
        setOpen(false);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className={cn("h-20 w-44 rounded-2xl bg-cream/5", className)} />;
  }

  if (firstName) {
    return (
      <div className={cn("flex flex-col items-end gap-2 text-right", className)}>
        <div className="inline-flex items-center gap-2 rounded-full border border-cream/10 bg-ink-elevated px-4 py-2 text-sm font-semibold text-cream shadow-lg">
          <UserRound className="h-4 w-4 text-crimson" />
          Bonjour {firstName} !
        </div>
        {customer ? (
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-cream"
          >
            <LogOut className="h-3.5 w-3.5" />
            Se déconnecter
          </button>
        ) : (
          <span className="max-w-56 text-xs leading-relaxed text-muted-foreground">
            Compte créé, confirmez l'e-mail reçu pour activer la connexion.
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-end gap-2 text-right", className)}>
      <button
        type="button"
        onClick={() => {
          setMode("login");
          setOpen(true);
        }}
        className="rounded-full bg-crimson px-5 py-2.5 text-sm font-bold uppercase tracking-[0.16em] text-crimson-foreground shadow-lg shadow-crimson/20 transition hover:-translate-y-0.5 hover:bg-crimson/90"
      >
        Se connecter
      </button>
      <button
        type="button"
        onClick={() => {
          setMode("signup");
          setOpen(true);
        }}
        className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition hover:text-cream"
      >
        Créer un compte
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button aria-label="Fermer" className="absolute inset-0" onClick={() => setOpen(false)} />
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              className="relative w-full max-w-md rounded-3xl border border-cream/10 bg-ink-elevated p-5 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-subtitle text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Compte client
                  </p>
                  <h2 className="mt-1 font-display text-3xl text-cream">
                    {mode === "login" ? "Connexion" : "Créer un compte"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-ink text-cream"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {!isSupabaseConfigured && (
                <p className="mt-4 rounded-2xl border border-[#f4a23d]/35 bg-[#f4a23d]/10 px-4 py-3 text-xs leading-relaxed text-[#f4a23d]/80">
                  Supabase n'est pas encore configuré dans les variables d'environnement du site.
                </p>
              )}

              <div className="mt-5 space-y-3">
                {mode === "signup" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <AuthField label="Prénom" value={form.firstName} onChange={(value) => setForm({ ...form, firstName: value })} />
                      <AuthField label="Nom" value={form.lastName} onChange={(value) => setForm({ ...form, lastName: value })} />
                    </div>
                    <AuthField label="Téléphone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
                    <AuthField label="Adresse" value={form.address} onChange={(value) => setForm({ ...form, address: value })} />
                  </>
                )}
                <AuthField label="E-mail" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
                <AuthField label="Mot de passe" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
              </div>

              {message && (
                <p className="mt-4 rounded-2xl border border-cream/10 bg-ink px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !isSupabaseConfigured}
                className={cn(
                  "mt-5 w-full rounded-2xl py-3 font-subtitle text-sm uppercase tracking-[0.18em] transition",
                  submitting || !isSupabaseConfigured
                    ? "cursor-not-allowed bg-[#2a2a2a] text-muted-foreground"
                    : "bg-crimson text-crimson-foreground crimson-glow",
                )}
              >
                {submitting ? "Veuillez patienter..." : mode === "login" ? "Se connecter" : "Créer le compte"}
              </button>

              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="mt-3 w-full text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition hover:text-cream"
              >
                {mode === "login" ? "Créer un compte" : "J'ai déjà un compte"}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AuthField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-cream/15 bg-ink px-3 py-2.5 text-sm text-cream placeholder:text-muted-foreground/60 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson"
      />
    </label>
  );
}
