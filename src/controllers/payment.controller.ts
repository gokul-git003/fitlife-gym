import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

// We use require because Razorpay types can sometimes be tricky or missing
const Razorpay = require('razorpay');

const prisma = new PrismaClient();

// Initialize Razorpay
// Note: We fallback to test keys here just in case env vars are missing so the app doesn't crash on boot
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyId',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestKeySecret',
});

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { amount, description, member_id } = req.body;
    
    // amount in req.body should be in INR (or USD). Razorpay expects the amount in the smallest currency unit (paise/cents).
    // E.g., 500 INR = 50000 paise.
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR", // Assuming INR for UPI
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        description,
        member_id
      }
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ error: "Failed to create Razorpay order" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Something went wrong creating the order" });
  }
};

export const verifyRazorpaySignature = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, member_id, amount, description } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'YourTestKeySecret';

    // Verify the signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ error: "Transaction not legit!" });
    }

    // If legit, record the payment in our database
    const payment = await prisma.payment.create({
      data: {
        memberId: member_id,
        amount: Number(amount),
        status: 'completed',
        // We could store the Razorpay payment ID here if we had a column for it
      }
    });

    res.json({ success: true, payment, msg: "Payment verified successfully" });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Verification failed" });
  }
};
