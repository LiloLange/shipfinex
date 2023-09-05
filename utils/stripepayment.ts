const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createCustomer = async (name, email, phone) => {
  try {
    const customer = await stripe.customers.create({
      name: name,
      email: email,
      phone: phone,
    });

    console.log(customer);
    return customer;
  } catch (error) {
    console.log(error);
  }
};

export { createCustomer };
