import logger from './logger.js';

let stripeInstance = null;
let stripeInitialized = false;

const getStripe = async () => {
  if (stripeInitialized) return stripeInstance;
  stripeInitialized = true;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes('your_stripe')) {
    logger.warn('Stripe not configured — payments disabled');
    return null;
  }
  try {
    const { default: Stripe } = await import('stripe');
    stripeInstance = new Stripe(key);
    return stripeInstance;
  } catch {
    logger.warn('Stripe package unavailable');
    return null;
  }
};

export const createPaymentIntent = async (amount, metadata = {}) => {
  const s = await getStripe();
  if (!s) throw new Error('Payment service not configured');
  const pi = await s.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    metadata,
  });
  logger.info(`Payment intent created: ${pi.id}`);
  return pi;
};

export const confirmPayment = async (paymentIntentId) => {
  const s = await getStripe();
  if (!s) throw new Error('Payment service not configured');
  const pi = await s.paymentIntents.retrieve(paymentIntentId);
  return pi.status === 'succeeded';
};

export const createRefund = async (paymentIntentId, amount) => {
  const s = await getStripe();
  if (!s) throw new Error('Payment service not configured');
  const refund = await s.refunds.create({
    payment_intent: paymentIntentId,
    amount: Math.round(amount * 100),
  });
  logger.info(`Refund created: ${refund.id}`);
  return refund;
};

export default { createPaymentIntent, confirmPayment, createRefund };