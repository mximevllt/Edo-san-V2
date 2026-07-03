import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { CustomerAccount, CustomerLogin, CustomerRegistration } from "@/lib/supabase/types";
import { upsertCustomerProfile } from "@/lib/api/customers.functions";

type CustomerAuthContextValue = {
  user: User | null;
  customer: CustomerAccount | null;
  loading: boolean;
  error: string | null;
  signIn: (payload: CustomerLogin) => Promise<{ needsEmailConfirmation: false }>;
  signUp: (payload: CustomerRegistration) => Promise<{ needsEmailConfirmation: boolean; firstName: string }>;
  signOut: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

function mapCustomer(row: Record<string, unknown>): CustomerAccount {
  return {
    id: String(row.id),
    authUserId: row.auth_user_id ? String(row.auth_user_id) : null,
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    defaultAddress: String(row.default_address ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function metadataValue(user: User, key: string) {
  const value = user.user_metadata?.[key];
  return typeof value === "string" ? value.trim() : "";
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<CustomerAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomerForUser = useCallback(async (currentUser: User | null) => {
    if (!supabase || !currentUser) {
      setCustomer(null);
      return null;
    }

    const { data, error: queryError } = await supabase
      .from("customers")
      .select("id, auth_user_id, first_name, last_name, phone, email, default_address, created_at, updated_at")
      .eq("auth_user_id", currentUser.id)
      .maybeSingle();

    if (queryError) {
      setError("Impossible de charger le profil client.");
      return null;
    }

    if (data) {
      const mapped = mapCustomer(data);
      setCustomer(mapped);
      return mapped;
    }

    const email = currentUser.email ?? "";
    const emailName = email.split("@")[0] || "Client";
    const firstName = metadataValue(currentUser, "first_name") || emailName;
    const lastName = metadataValue(currentUser, "last_name") || "Edo-San";
    const phone = metadataValue(currentUser, "phone") || "Non renseigné";
    const defaultAddress = metadataValue(currentUser, "default_address") || "Non renseignée";

    const { data: repaired, error: repairError } = await supabase
      .from("customers")
      .upsert(
        {
          auth_user_id: currentUser.id,
          first_name: firstName,
          last_name: lastName,
          phone,
          email,
          default_address: defaultAddress,
        },
        { onConflict: "auth_user_id" },
      )
      .select("id, auth_user_id, first_name, last_name, phone, email, default_address, created_at, updated_at")
      .single();

    if (repairError) {
      setError("Compte connecté, mais le profil client n'a pas pu être créé.");
      return null;
    }

    const mapped = mapCustomer(repaired);
    setCustomer(mapped);
    return mapped;
  }, []);

  const refreshCustomer = useCallback(async () => {
    await loadCustomerForUser(user);
  }, [loadCustomerForUser, user]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      await loadCustomerForUser(sessionUser);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      window.setTimeout(() => {
        loadCustomerForUser(nextUser);
      }, 0);
    });

    return () => listener.subscription.unsubscribe();
  }, [loadCustomerForUser]);

  useEffect(() => {
    refreshCustomer();
  }, [refreshCustomer]);

  const signIn = useCallback(async ({ email, password }: CustomerLogin) => {
    if (!supabase) throw new Error("Supabase n'est pas configuré.");
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      throw signInError;
    }
    setUser(data.user);
    await loadCustomerForUser(data.user);
    return { needsEmailConfirmation: false as const };
  }, [loadCustomerForUser]);

  const signUp = useCallback(async (payload: CustomerRegistration) => {
    if (!supabase) throw new Error("Supabase n'est pas configuré.");
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: payload.firstName,
          last_name: payload.lastName,
          phone: payload.phone,
          default_address: payload.address,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      throw signUpError;
    }

    if (data.user) {
      setUser(data.user);
      try {
        await upsertCustomerProfile({
          data: {
            authUserId: data.user.id,
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone,
            email: payload.email,
            defaultAddress: payload.address,
          },
        });
      } catch {
        // The database trigger also creates the profile from auth metadata.
      }
      await loadCustomerForUser(data.user);
    }

    return { needsEmailConfirmation: !data.session, firstName: payload.firstName };
  }, [loadCustomerForUser]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setCustomer(null);
  }, []);

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      user,
      customer,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      refreshCustomer,
    }),
    [customer, error, loading, refreshCustomer, signIn, signOut, signUp, user],
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used inside CustomerProvider");
  return ctx;
}

export { isSupabaseConfigured };
