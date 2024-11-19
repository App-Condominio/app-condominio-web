import { stripe } from "@/utils/stripe/config";
import { DBService } from "./db";

// Change to control trial period length

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin privileges and overwrites RLS policies!

// const upsertProductRecord = async (product: Stripe.Product) => {
//   const productData: Product = {
//     id: product.id,
//     active: product.active,
//     name: product.name,
//     description: product.description ?? null,
//     image: product.images?.[0] ?? null,
//     metadata: product.metadata,
//   };

//   const { error: upsertError } = await supabaseAdmin
//     .from("products")
//     .upsert([productData]);
//   if (upsertError)
//     throw new Error(`Product insert/update failed: ${upsertError.message}`);
//   console.log(`Product inserted/updated: ${product.id}`);
// };

// const upsertPriceRecord = async (
//   price: Stripe.Price,
//   retryCount = 0,
//   maxRetries = 3
// ) => {
//   const priceData: Price = {
//     id: price.id,
//     product_id: typeof price.product === "string" ? price.product : "",
//     active: price.active,
//     currency: price.currency,
//     type: price.type,
//     unit_amount: price.unit_amount ?? null,
//     interval: price.recurring?.interval ?? null,
//     interval_count: price.recurring?.interval_count ?? null,
//     trial_period_days: price.recurring?.trial_period_days ?? TRIAL_PERIOD_DAYS,
//   };

//   const { error: upsertError } = await supabaseAdmin
//     .from("prices")
//     .upsert([priceData]);

//   if (upsertError?.message.includes("foreign key constraint")) {
//     if (retryCount < maxRetries) {
//       console.log(`Retry attempt ${retryCount + 1} for price ID: ${price.id}`);
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//       await upsertPriceRecord(price, retryCount + 1, maxRetries);
//     } else {
//       throw new Error(
//         `Price insert/update failed after ${maxRetries} retries: ${upsertError.message}`
//       );
//     }
//   } else if (upsertError) {
//     throw new Error(`Price insert/update failed: ${upsertError.message}`);
//   } else {
//     console.log(`Price inserted/updated: ${price.id}`);
//   }
// };

// const deleteProductRecord = async (product: Stripe.Product) => {
//   const { error: deletionError } = await supabaseAdmin
//     .from("products")
//     .delete()
//     .eq("id", product.id);
//   if (deletionError)
//     throw new Error(`Product deletion failed: ${deletionError.message}`);
//   console.log(`Product deleted: ${product.id}`);
// };

// const deletePriceRecord = async (price: Stripe.Price) => {
//   const { error: deletionError } = await supabaseAdmin
//     .from("prices")
//     .delete()
//     .eq("id", price.id);
//   if (deletionError)
//     throw new Error(`Price deletion failed: ${deletionError.message}`);
//   console.log(`Price deleted: ${price.id}`);
// };

// const upsertCustomerToSupabase = async (uuid: string, customerId: string) => {
//   const { error: upsertError } = await supabaseAdmin
//     .from("customers")
//     .upsert([{ id: uuid, stripe_customer_id: customerId }]);

//   if (upsertError)
//     throw new Error(
//       `Supabase customer record creation failed: ${upsertError.message}`
//     );

//   return customerId;
// };

const createOrRetrieveCustomer = async ({
  email,
  id,
}: {
  email: string;
  id: string;
}) => {
  const existingCustomer = await DBService.read({ table: "condominiums", id });
  const productID = process.env.NEXT_PUBLIC_INITIAL_PRODUCT_ID;
  const product = await stripe.products.retrieve(productID!);
  if (!product) throw new Error("Product retrieval failed.");

  const price = await stripe.prices.retrieve(product.default_price as string);
  let stripeCustomerId = existingCustomer?.stripe_customer_id;

  if (!stripeCustomerId) {
    const stripeCustomers = await stripe.customers.list({ email });
    stripeCustomerId = stripeCustomers.data[0]?.id;
  }

  if (!stripeCustomerId) {
    const newCustomer = await stripe.customers.create({ email });
    stripeCustomerId = newCustomer.id;

    await DBService.upsert({
      table: "condominiums",
      id,
      payload: { stripe_customer_id: stripeCustomerId },
    });
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
  });

  if (subscriptions.data.length === 0) {
    await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: price.id }],
      trial_period_days: 30,
    });
  }

  return { customerID: stripeCustomerId, product, trialDays: 30 };
};
/**
 * Copies the billing details from the payment method to the customer object.
 */
// const copyBillingDetailsToCustomer = async (
//   uuid: string,
//   payment_method: Stripe.PaymentMethod
// ) => {
//   //Todo: check this assertion
//   const customer = payment_method.customer as string;
//   const { name, phone, address } = payment_method.billing_details;
//   if (!name || !phone || !address) return;
//   //@ts-ignore
//   await stripe.customers.update(customer, { name, phone, address });
//   const { error: updateError } = await supabaseAdmin
//     .from("users")
//     .update({
//       billing_address: { ...address },
//       payment_method: { ...payment_method[payment_method.type] },
//     })
//     .eq("id", uuid);
//   if (updateError)
//     throw new Error(`Customer update failed: ${updateError.message}`);
// };

// const manageSubscriptionStatusChange = async (
//   subscriptionId: string,
//   customerId: string,
//   createAction = false
// ) => {
//   // Get customer's UUID from mapping table.
//   const { data: customerData, error: noCustomerError } = await supabaseAdmin
//     .from("customers")
//     .select("id")
//     .eq("stripe_customer_id", customerId)
//     .single();

//   if (noCustomerError)
//     throw new Error(`Customer lookup failed: ${noCustomerError.message}`);

//   const { id: uuid } = customerData!;

//   const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
//     expand: ["default_payment_method"],
//   });
//   // Upsert the latest status of the subscription object.
//   const subscriptionData: TablesInsert<"subscriptions"> = {
//     id: subscription.id,
//     user_id: uuid,
//     metadata: subscription.metadata,
//     status: subscription.status,
//     price_id: subscription.items.data[0].price.id,
//     //TODO check quantity on subscription
//     // @ts-ignore
//     quantity: subscription.quantity,
//     cancel_at_period_end: subscription.cancel_at_period_end,
//     cancel_at: subscription.cancel_at
//       ? toDateTime(subscription.cancel_at).toISOString()
//       : null,
//     canceled_at: subscription.canceled_at
//       ? toDateTime(subscription.canceled_at).toISOString()
//       : null,
//     current_period_start: toDateTime(
//       subscription.current_period_start
//     ).toISOString(),
//     current_period_end: toDateTime(
//       subscription.current_period_end
//     ).toISOString(),
//     created: toDateTime(subscription.created).toISOString(),
//     ended_at: subscription.ended_at
//       ? toDateTime(subscription.ended_at).toISOString()
//       : null,
//     trial_start: subscription.trial_start
//       ? toDateTime(subscription.trial_start).toISOString()
//       : null,
//     trial_end: subscription.trial_end
//       ? toDateTime(subscription.trial_end).toISOString()
//       : null,
//   };

//   const { error: upsertError } = await supabaseAdmin
//     .from("subscriptions")
//     .upsert([subscriptionData]);
//   if (upsertError)
//     throw new Error(
//       `Subscription insert/update failed: ${upsertError.message}`
//     );
//   console.log(
//     `Inserted/updated subscription [${subscription.id}] for user [${uuid}]`
//   );

//   // For a new subscription copy the billing details to the customer object.
//   // NOTE: This is a costly operation and should happen at the very end.
//   if (createAction && subscription.default_payment_method && uuid)
//     //@ts-ignore
//     await copyBillingDetailsToCustomer(
//       uuid,
//       subscription.default_payment_method as Stripe.PaymentMethod
//     );
// };

export {
  //   upsertProductRecord,
  //   upsertPriceRecord,
  //   deleteProductRecord,
  //   deletePriceRecord,
  createOrRetrieveCustomer,
  //   manageSubscriptionStatusChange,
};
