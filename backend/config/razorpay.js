const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Razorpay = require('razorpay');

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error('Missing Razorpay credentials. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env');
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;
