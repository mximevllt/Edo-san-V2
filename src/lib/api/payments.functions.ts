import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CATEGORIES } from "@/data/menu";

const DELIVERY_FEE_CENTS = 350;

const lineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const createPaymentIntent = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      lines: z.array(lineSchema).min(1),
      customer: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(8),
      }),
      delivery: z.object({
        number: z.string().min(1),
        street: z.string().min(2),
        city: z.string().min(2),
        date: z.string().min(1),
        time: z.string().min(1),
      }),
    }),
  )
  .handler(async ({ data }) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured.");
    }

    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2026-06-24.dahlia",
    });

    const productById = new Map(CATEGORIES.flatMap((category) => category.items.map((product) => [product.id, product])));
    const amountFromProducts = data.lines.reduce((sum, line) => {
      const product = productById.get(line.productId);
      if (!product) {
        throw new Error(`Unknown product: ${line.productId}`);
      }
      return sum + Math.round(product.price * 100) * line.quantity;
    }, 0);
    const amount = amountFromProducts + DELIVERY_FEE_CENTS;

    if (amount < 50) {
      throw new Error("Payment amount is too low.");
    }

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      receipt_email: data.customer.email,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerName: data.customer.name,
        customerPhone: data.customer.phone,
        deliveryAddress: `${data.delivery.number} ${data.delivery.street}, ${data.delivery.city}`,
        deliverySlot: `${data.delivery.date} ${data.delivery.time}`,
        source: "edo-san-web",
      },
      shipping: {
        name: data.customer.name,
        phone: data.customer.phone,
        address: {
          line1: `${data.delivery.number} ${data.delivery.street}`,
          city: data.delivery.city,
          country: "FR",
        },
      },
    });

    if (!intent.client_secret) {
      throw new Error("Stripe did not return a client secret.");
    }

    return {
      clientSecret: intent.client_secret,
      amount,
    };
  });
