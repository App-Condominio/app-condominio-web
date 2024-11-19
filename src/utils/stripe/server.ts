"use server";

import Stripe from "stripe";
import { stripe } from "@/utils/stripe/config";
import {
  getURL,
  getErrorRedirect,
  calculateTrialEndUnixTimestamp,
} from "@/utils/helpers";
import { createOrRetrieveCustomer } from "@/services/payment";
import { User } from "firebase/auth";
import { DBService } from "@/services/db";

type CheckoutResponse = {
  errorRedirect?: string;
  sessionId?: string;
};

// Function to create a checkout session with Stripe for recurring payments and trial period
export async function checkoutWithStripe(user: User, redirectPath: string) {
  try {
    const productID = process.env.NEXT_PUBLIC_INITIAL_PRODUCT_ID;
    const product = await stripe.products.retrieve(productID!);
    if (!product) throw new Error("Product retrieval failed.");

    const price = await stripe.prices.retrieve(product.default_price as string);
    const { email, uid: firebaseUserID } = user;

    // Check if the customer exists or create a new one
    let customer = await stripe.customers.list({ email });
    let customerID = customer.data.length > 0 ? customer.data[0].id : undefined;

    if (!customerID) {
      const newCustomer = await stripe.customers.create({
        email,
        metadata: { firebaseUserID },
      });
      customerID = newCustomer.id;
    }

    await DBService.update({
      table: "condominiums",
      id: firebaseUserID,
      payload: { stripe_customer_id: customerID },
    });

    // Create the checkout session for a subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customerID,
      locale: "pt-BR",
      line_items: [{ price: price.id, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: getURL(redirectPath),
      cancel_url: getURL(),
      subscription_data: {
        trial_period_days: 30, // Set the trial period, if desired
      },
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error("Checkout session creation error:", error);
    throw new Error("Unable to create checkout session.");
  }
}

export async function createStripePortal(user: User, currentPath: string) {
  try {
    const condominium = await DBService.read({
      table: "condominiums",
      id: user.uid,
    });

    try {
      const { url } = await stripe.billingPortal.sessions.create({
        locale: "pt-BR",
        customer: condominium.stripe_customer_id,
        return_url: getURL("/account"),
      });
      if (!url) {
        throw new Error("Could not create billing portal");
      }
      return url;
    } catch (err) {
      console.error(err);
      throw new Error("Could not create billing portal");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return getErrorRedirect(
        currentPath,
        error.message,
        "Please try again later or contact a system administrator."
      );
    } else {
      return getErrorRedirect(
        currentPath,
        "An unknown error occurred.",
        "Please try again later or contact a system administrator."
      );
    }
  }
}

export async function getPaymentStatusByUserId(user: User) {
  try {
    // Retrieve Stripe customer ID from your database
    const customerRecord = await DBService.read({
      table: "condominiums",
      id: user.uid,
    });

    const stripeCustomerId = customerRecord?.stripe_customer_id;
    if (!stripeCustomerId) {
      throw new Error("No Stripe customer ID found for this Firebase user.");
    }

    // List subscriptions for this customer in Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all", // Fetch all statuses
      limit: 1, // Assuming only one active subscription per user
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscriptions found for this customer.");
    }

    // Get the subscription status and other details
    const subscription = subscriptions.data[0];
    return {
      status: subscription.status, // 'active', 'past_due', 'canceled', etc.
      current_period_end: subscription.current_period_end, // Unix timestamp
      cancel_at_period_end: subscription.cancel_at_period_end,
    };
  } catch (error) {
    console.error("Error fetching payment status:", error);
    throw error;
  }
}
