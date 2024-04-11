
// const jwt = require('jsonwebtoken')
import jwt from 'jsonwebtoken'
// const AppError = require("../utils/apiError");
import AppError from '../utils/appError.js';

const isLoggedIn = async function(req, _, next){

    const {token} = req.cookies;

    if(!token) {
        return next(new AppError('Unauthorized, Please Login', 401))
    }

    const tokenDetails = jwt.verify(token, process.env.JWT_SECRET)

    req.user = tokenDetails

    next()

}



const authorizedRoles = (...roles) => async (req,res,next) => {
    
    const currentRole = req.user.role

    if(!roles.includes(currentRole)){
        return next (
            new AppError('You do not has permission to access this route', 403)
        )
    }
    
    next()
}


const authorizedSubscriber = async (req, res, next) => {

    const subscriptionStatus = req.user.subscription.status
    const currentRole = req.user.role

    if( currentRole !== 'ADMIN' && subscriptionStatus !== 'active'){
        return next(
            new AppError('Please subscribe to access this route', 400)
        )
    }


    next()
}



 export {
    isLoggedIn,
    authorizedRoles,
    authorizedSubscriber
}