module.exports = async (models, config, logger, stripe) => {
  // stripe create product
  async function stripe_createProduct(params) {
    const product = await stripe.products.create({
      ...params,
    });

    return product;
  }

  // stripe update product
  async function stripe_updateProduct(id, params) {
    const product = await stripe.products.update(id, { ...params });

    return product;
  }

  // stripe delete product
  async function stripe_deleteProduct(id) {
    const deleted = await stripe.products.del(id);

    return deleted;
  }

  // stripe create price and associate product
  async function stripe_createPrice(params) {
    const price = await stripe.prices.create({
      ...params,
    });

    return price;
  }

  // stripe update price and associate product
  async function stripe_updatePrice(id, params) {
    const price = await stripe.prices.update(id, {
      ...params,
    });

    return price;
  }

  // create customer
  async function stripe_createCustomer(params) {
    const customer = await stripe.customers.create({
      ...params,
    });
    return customer;
  }

  // update customer
  async function stripe_updateCustomer(id, params) {
    const customer = await stripe.customers.update(id, {
      ...params,
    });
    return customer;
  }

  // delete customer
  async function stripe_deleteCustomer(id) {
    const customer = await stripe.customers.del(id);
    return customer;
  }

  // create setup indent
  async function stripe_createSetupIntent(customer_id) {
    const setupIntent = await stripe.setupIntents.create({
      customer: customer_id,
      payment_method_types: ["card"],
    });

    return setupIntent;
  }

  // list user payment methods from stripe
  async function stripe_listPaymentMethods(customer_id) {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer_id,
      type: "card",
    });
    return paymentMethods;
  }

  // list detached user payment methods from stripe
  async function stripe_deatachedPaymentMethods(payment_method_id) {
    const paymentMethod = await stripe.paymentMethods.detach(payment_method_id);
    return paymentMethod;
  }

  // stripe create subscription
  async function stripe_createSubscription(params) {
    const subscription = await stripe.subscriptions.create({ ...params });

    return subscription;
  }

  // stripe update subscription
  async function stripe_updateSubscription(subscription_id, subscriptionData) {
    const subscription = await stripe.subscriptions.update(
      subscription_id,
      subscriptionData
    );

    return subscription;
  }

  return {
    stripe_createProduct,
    stripe_updateProduct,
    stripe_deleteProduct,
    stripe_createPrice,
    stripe_updatePrice,
    stripe_createCustomer,
    stripe_updateCustomer,
    stripe_deleteCustomer,
    stripe_createSetupIntent,
    stripe_listPaymentMethods,
    stripe_deatachedPaymentMethods,
    stripe_createSubscription,
    stripe_updateSubscription,
  };
};
