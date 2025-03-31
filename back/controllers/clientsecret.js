
const stripe = require('stripe')('sk_test_51R3ZkBL2pnAZFd0h3SRJQn3onCgCYqeFmo1qezgtM1Ri9qAgTg06dqDQuqn5Hx1aqCKAs1E4TkQWtbTIZljLqLPK00dfMsV9tS'); // Use your Stripe secret key


const clientSecret = async (req, res) => {
    const { extraSheets } = JSON.parse(req.body); 
    
    try {
      const amount = extraSheets * 100;  // Amount in cents (100 = $1)
  
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        metadata: { extraSheets },
      });
  
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      res.status(500).send('内部サーバーエラー');
    }
};

module.exports = { clientSecret };