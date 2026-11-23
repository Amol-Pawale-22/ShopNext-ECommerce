const Razorpay = require("razorpay");
const crypto = require("crypto");

const getKeySecret = () =>
  process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRETE;

const hasConfiguredKey = (value) =>
  Boolean(value && !/(signup_data|placeholder|your[_ -]?key)/i.test(value));

const createdOrder = async function (req, res) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = getKeySecret();

    if (!hasConfiguredKey(keyId) || !hasConfiguredKey(keySecret)) {
      return res.status(503).json({
        message:
          "Razorpay is not configured. Use Student Bypass Mode to place a test order.",
      });
    }

    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "A valid payment amount is required." });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const orderOptions = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    const order = await instance.orders.create(orderOptions);
    res.status(200).json({ ...order, keyId });
  } catch (error) {
    res.status(500).json({
      message: "Unable to create the Razorpay order.",
      error: error.message,
    });
  }
};

// This is the verification payment logics

const verifyPayment = async function (req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const keySecret = getKeySecret();

    if (!hasConfiguredKey(keySecret)) {
      return res
        .status(503)
        .json({ message: "Razorpay payment verification is not configured." });
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    const expected = Buffer.from(generatedSignature, "hex");
    const received = Buffer.from(razorpay_signature || "", "hex");
    if (
      expected.length === received.length &&
      crypto.timingSafeEqual(expected, received)
    ) {
      res.status(200).json({ message: "Payment Verified Successfully " });
    } else {
      res.status(400).json({ message: "Payment Verification Failed" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Unable to verify the Razorpay payment.",
      error: error.message,
    });
  }
};

module.exports = {
  createdOrder,
  verifyPayment,
};
