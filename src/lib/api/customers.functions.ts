import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { CATEGORIES } from "@/data/menu";
import type { BackOfficeCustomer } from "@/lib/supabase/types";

const profileSchema = z.object({
  authUserId: z.string().uuid().nullable().optional(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  phone: z.string().trim().min(6),
  email: z.string().trim().email(),
  defaultAddress: z.string().trim().min(3),
});

const orderLineSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.number().int().positive(),
});

const orderSchema = z.object({
  accessToken: z.string().optional(),
  paymentIntentId: z.string().optional(),
  customer: profileSchema,
  delivery: z.object({
    address: z.string().trim().min(3),
    date: z.string().trim().min(1),
    time: z.string().trim().min(1),
  }),
  lines: z.array(orderLineSchema).min(1),
  total: z.number().nonnegative(),
});

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("SUPABASE_URL ou VITE_SUPABASE_URL est manquant.");
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY est manquant.");

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function customerStatus(orders: number, spent: number): BackOfficeCustomer["status"] {
  if (spent >= 500 || orders >= 12) return "VIP";
  if (orders >= 4) return "Régulier";
  if (orders <= 1) return "Nouveau";
  return "À surveiller";
}

function mapBackOfficeCustomer(row: Record<string, unknown>): BackOfficeCustomer {
  const firstName = String(row.first_name ?? "");
  const lastName = String(row.last_name ?? "");
  const orders = Number(row.orders_count ?? 0);
  const spent = Number(row.total_spent ?? 0);
  const average = Number(row.average_spent ?? 0);
  const lastOrder = row.last_order_at ? new Date(String(row.last_order_at)).toLocaleDateString("fr-FR") : "Aucune";
  const topProducts = Array.isArray(row.top_products) ? row.top_products.map(String).slice(0, 5) : [];

  return {
    id: String(row.id),
    name: `${firstName} ${lastName}`.trim() || String(row.email ?? "Client"),
    firstName,
    lastName,
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    orders,
    spent,
    average,
    lastOrder,
    address: String(row.default_address ?? ""),
    status: customerStatus(orders, spent),
    topProducts,
  };
}

function mapCustomerTableRow(row: Record<string, unknown>): BackOfficeCustomer {
  const firstName = String(row.first_name ?? "");
  const lastName = String(row.last_name ?? "");

  return {
    id: String(row.id),
    name: `${firstName} ${lastName}`.trim() || String(row.email ?? "Client"),
    firstName,
    lastName,
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    orders: 0,
    spent: 0,
    average: 0,
    lastOrder: "Aucune",
    address: String(row.default_address ?? ""),
    status: "Nouveau",
    topProducts: [],
  };
}

async function upsertCustomer(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  data: z.infer<typeof profileSchema>,
) {
  const { data: customer, error } = await supabase
    .from("customers")
    .upsert(
      {
        auth_user_id: data.authUserId ?? null,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        email: data.email.toLowerCase(),
        default_address: data.defaultAddress,
      },
      { onConflict: data.authUserId ? "auth_user_id" : "email" },
    )
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { customerId: customer.id as string };
}

export const listBackOfficeCustomers = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("customer_backoffice")
    .select("*")
    .order("last_order_at", { ascending: false, nullsFirst: false });

  if (error) {
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("id, first_name, last_name, phone, email, default_address, created_at")
      .order("created_at", { ascending: false });

    if (customersError) throw new Error(customersError.message);
    return (customers ?? []).map((row) => mapCustomerTableRow(row));
  }

  return (data ?? []).map((row) => mapBackOfficeCustomer(row));
});

export const upsertCustomerProfile = createServerFn({ method: "POST" })
  .inputValidator(profileSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    return upsertCustomer(supabase, data);
  });

export const recordCustomerOrder = createServerFn({ method: "POST" })
  .inputValidator(orderSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    let verifiedAuthUserId = data.customer.authUserId ?? null;

    if (data.accessToken) {
      const { data: authData, error } = await supabase.auth.getUser(data.accessToken);
      if (!error && authData.user) verifiedAuthUserId = authData.user.id;
    }

    const profile = {
      ...data.customer,
      authUserId: verifiedAuthUserId,
    };

    const { customerId } = await upsertCustomer(supabase, profile);
    const productById = new Map(CATEGORIES.flatMap((category) => category.items.map((product) => [product.id, product])));
    const normalizedLines = data.lines.map((line) => {
      const originalProductId = line.productId.startsWith("promo-") ? line.productId.split("-").slice(2).join("-") : line.productId;
      const product = productById.get(line.productId) ?? productById.get(originalProductId);
      return {
        product_id: line.productId,
        product_name: product?.name ?? line.productId,
        unit_price: product?.price ?? 0,
        quantity: line.quantity,
        line_total: Number(((product?.price ?? 0) * line.quantity).toFixed(2)),
      };
    });

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        status: "paid",
        total_amount: data.total,
        payment_provider: "stripe",
        payment_reference: data.paymentIntentId ?? null,
        delivery_address: data.delivery.address,
        scheduled_date: data.delivery.date,
        scheduled_time: data.delivery.time,
      })
      .select("id")
      .single();

    if (orderError) throw new Error(orderError.message);

    const { error: itemsError } = await supabase.from("order_items").insert(
      normalizedLines.map((line) => ({
        order_id: order.id,
        ...line,
      })),
    );

    if (itemsError) throw new Error(itemsError.message);
    return { orderId: order.id as string };
  });
