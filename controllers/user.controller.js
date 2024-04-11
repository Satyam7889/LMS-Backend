
// const AppError = require('../utils/apiError.js')
import { User } from '../models/user.model.js'
import  AppError  from '../utils/appError.js'
import cloudinary from 'cloudinary'
import fs from 'fs'
import sendEmail from '../utils/sendEmail.js'
import crypto from 'crypto'

const register = async (req, res, next) => {
    const {fullName, email, password} = req.body

    if(!fullName || !email || !password){
        return next(new AppError('All fields are required', 400))
    }

    const  userExist = await User.findOne({ email })

    if(userExist){
        return next(new AppError('Email already exists', 409));
    }

    const user = await User.create({
        fullName,
        email,
        password,
        avatar:{
            public_id: email,
            secure_url: ''
        }
    })

    if(!user){
        return next(new AppError('User registration failed, try again', 400))
    }

    // TODO: Upload user picture
    // console.log('file Details -> ', JSON.stringify(req.file ))
    if(req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, 
                {
                    folder: 'lms',
                    width: 250,
                    height: 250,
                    gravity: 'faces',
                    crop: 'fill'
                }
                )
            if(result) {
                user.avatar.public_id = result.public_id
                user.avatar.secure_url = result.secure_url
    
                // remov efile from local Server
                fs.rm(`uploads/${req.file.filename}` , () => {})
            }
        } catch (e) {
            return next(new AppError(e.message || 'File not uploaded, try again', 500))
        }
    }


    await user.save()

    // TODO: set jWT token in cookie

    user.password = undefined

    return res.status(200).json({
        success: true,
        message: 'User registered successfully',
        user
    })
}


const login = async (req, res, next) => {
    
    const { email, password} = req.body

    if(!email || !password){
        return next(new AppError('All fields is required', 400))
    }

    const user = await User.findOne({email}).select('+password')

    if (!(user && (await user.comparePassword(password)))) {
        return next(new AppError('Email or password do not match', 400))
    }

    const token = await user.generateJWTToken()

    user.password = undefined

    const cookieOptions = {
        secure: true,
        maxAge: 7*24*60*60*1000 , //7 days
        httpOnly: true
    }

    res.cookie('token', token, cookieOptions)

    res.status(201).json({
        success: true,
        message: 'User Logged in Successfully',
        user
    })
}


const logout = (req, res) => {
    res.cookie('token', null, {
        secure: true,
        maxAge: 0,
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'User LoggedOut Successfully'
    })
}


const profile = async (req, res) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        message: 'User Details',
        user
    })
}

const forgotPassword = async (req, res,next) => {

    const {email} = req.body

    if( !email ) {
        return next(new AppError('Email is Required' , 400))
    }
    const user = await User.findOne({email}) 

    if(!user) {
        return next(new AppError('User does not exist ', 400))
    }

    const resetToken = await user.generatePasswordToken()

    await user.save()

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    const subject = 'ResetPassword'
    const message = `You Can reset your Password by clicking <a href=${resetPasswordUrl} target="_blank">Reset Your Password</a>`

    console.log(resetPasswordUrl)



    try {
        // create sendEmail 
        await sendEmail(email, subject, message)

        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email} successfully!`
        })

    } catch (e) {
        user.forgotPasswordExpiry = undefined
        user.forgotPasswordToken = undefined

        await user.save()
        return next( new AppError ( e.message, 500))
    }

}


const resetPassword = async (req, res, next) => {
    const {resetToken} = req.params
    const {password} = req.body
    
    const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now()}
    })

    if(!user) {
        return  next( new AppError ('Token is invalid or Expired, Please try again', 400))
    }

    user.password = password
    user.forgotPasswordExpiry = undefined
    user.forgotPasswordToken = undefined

    await user.save()

    res.status(200).json({
        success: true,
        message: 'Password changed Successfully'
    })
}

const changePassword = async (req, res, next) => {
    const {oldPassword, newPassword } = req.body;
    const {id} = req.user

    if(!oldPassword || !newPassword){
        return next(new AppError('All fiels are mendatory',400 ))
    }

    const user = await User.findById(id).select('+password')

    if(!user){
        return next(new AppError('User does not exist',400 ))
    }

    const isPasswordValid = await user.comparePassword(oldPassword)

    if(!isPasswordValid){
        return next(new AppError('Invalid old password',400 ))
    }

    user.password = newPassword
    await user.save()

    user.password = undefined

    res.status(200).json({
        success: true,
        message: 'Password changed Successfully'
    })

}

const updateUser = async (req, res, next) => {
    const {fullName} = req.body
    const {id} = req.user

    const user = await User.findById(id)

    if(!user) {
        return next ( new AppError('User does not exist' , 400))
    }

    if(fullName) {
        user.fullName = fullName
    }

    if(req.file) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id)
        
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, 
                {
                    folder: 'lms',
                    width: 250,
                    height: 250,
                    gravity: 'faces',
                    crop: 'fill'
                }
                )
            if(result) {
                user.avatar.public_id = result.public_id
                user.avatar.secure_url = result.secure_url
    
                // remov efile from local Server
                fs.rm(`uploads/${req.file.filename}`)
            }
        } catch (e) {
        return next(new AppError(e.message || 'File not uploaded, try again', 500))
        }
    
    
    }
    await user.save()

        res.status(200).json({
            success: true,
            message: 'User Details Updated Successfully'
        })

}

// module.exports = {
//     register,
//     login,
//     logout,
//     profile
// }

export {
    register,
    login,
    logout,
    profile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser,
    
}