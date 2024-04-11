import {Router} from 'express'
import { buySubscription, cancelSubscription, getAllPayments, getRazorpayApiKey, verifySubscription } from '../controllers/payment.controller.js';
import { authorizedRoles, isLoggedIn } from '../middleware/auth.middleware.js';

const paymentRouter = Router();


paymentRouter
    .route('/razorpay_key')
    .get(isLoggedIn ,getRazorpayApiKey)

paymentRouter
    .route('/subscribe')
    .post(isLoggedIn ,buySubscription)

paymentRouter
    .route('/verify')
    .post(isLoggedIn ,verifySubscription)
            
paymentRouter
    .route('/unsubscribe')
    .post(isLoggedIn ,cancelSubscription)

paymentRouter
    .route('/')
    .get(isLoggedIn ,authorizedRoles('ADMIN') ,getAllPayments)


    export default paymentRouter