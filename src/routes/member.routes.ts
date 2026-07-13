import { Router } from 'express';
import { getAvailableClasses, bookClass, cancelBooking, getBookingHistory, getDashboardStats, getPayments, createPayment, createClass } from '../controllers/member.controller';
import { createRazorpayOrder, verifyRazorpaySignature } from '../controllers/payment.controller';

const router = Router();

router.get('/classes', getAvailableClasses);
router.post('/classes', createClass);
router.post('/bookings', bookClass);
router.post('/bookings/cancel', cancelBooking);
router.get('/bookings/history', getBookingHistory);
router.get('/dashboard', getDashboardStats);
router.get('/payments', getPayments);
router.post('/payments', createPayment);
router.post('/payments/order', createRazorpayOrder);
router.post('/payments/verify', verifyRazorpaySignature);

export default router;
