// lib/stripe.ts
import Stripe from "stripe";

// Lazy singleton — avoids crashing at build time when env vars aren't set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-10-28.endive" as any,
    });
  }
  return _stripe;
}

export { getStripe as stripe };

