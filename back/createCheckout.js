
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function createCheckout(req, res) { 
     const data = JSON.parse(req.body);
     const plan = data.plan
     const email = data.email
 
     const prices = {
         A: process.env.PRICE_ID_A,
         B: process.env.PRICE_ID_B,
         C: process.env.PRICE_ID_C,
     };
     const baseLimit = {
         A: 10,
         B: 30,
         C: 50
     }

 
     try {
         const session = await stripe.checkout.sessions.create({
             payment_method_types: ["card"],
             mode: "subscription",
             customer_email: email,
             line_items: [{ price: prices[plan], quantity: 1 }],
             metadata: {
                 card: plan,
                 baseLimit: baseLimit[plan],
                 extraSheets: 0,
               
             },
             success_url: "http://localhost:3000/success",
             cancel_url: "http://localhost:3000/cancel",
         });
 
         await res.json({ id: session.id });
     } catch (error) {
         console.error("❌ Error creating session:", error);
         res.status(500).send("Failed to create session");
     }
}
module.exports = { createCheckout };