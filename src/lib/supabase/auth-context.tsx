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
  signIn: (payload: CustomerLogin) => Promise<void>;
  signUp: (payload: CustomerRegistration) => Promise<void>;
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

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<CustomerAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCustomer = useCallback(async () => {
    if (!supabase || !user) {
      setCustomer(null);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("customers")
      .select("id, auth_user_id, first_name, last_name, phone, email, default_address, created_at, updated_at")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (queryError) {
      setError("Impossible de charger le profil client.");
      return;
    }

    setCustomer(data ? mapCustomer(data) : null);
  }, [user]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    refreshCustomer();
  }, [refreshCustomer]);

  const signIn = useCallback(async ({ email, password }: CustomerLogin) => {
    if (!supabase) throw new Error("Supabase n'est pas configuré.");
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      throw signInError;
    }
  }, []);

  const signUp = useCallback(async (payload: CustomerRegistration) => {
    if (!supabase) throw new Error("Supabase n'est pas configuré.");
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
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
    }

    await refreshCustomer();
  }, [refreshCustomer]);

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
