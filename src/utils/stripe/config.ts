import Stripe from "stripe";

console.log("process.env.STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY);

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_LIVE ??
    process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ??
    "",
  {
    // https://github.com/stripe/stripe-node#configuration
    // https://stripe.com/docs/api/versioning
    // @ts-ignore
    apiVersion: null,
    // Register this as an official Stripe plugin.
    // https://stripe.com/docs/building-plugins#setappinfo
    appInfo: {
      name: "App Condominio",
      version: "0.0.0",
      url: "https://github.com/vercel/nextjs-subscription-payments",
    },
  }
);
