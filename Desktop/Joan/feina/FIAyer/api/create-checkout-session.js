import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { planId, origin } = req.body;

  const planMap = {
    pack:    { name: "Pack 5 Crèdits", amount: 499 },
    pro:     { name: "Pla Pro (100 Crèdits)", amount: 1499 },
    premium: { name: "Pla Premium Agència", amount: 3900 }
  };

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: planMap[planId].name },
          unit_amount: planMap[planId].amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}?payment=success&credits=${planId === 'pack' ? 5 : 100}`,
      cancel_url: `${origin}?payment=cancel`,
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}