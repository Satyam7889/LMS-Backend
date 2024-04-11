// const express = require('express')
import express from 'express'
// const { register, login, logout, profile } = require('../controllers/user.controller')
import {register, login, logout, profile, forgotPassword, resetPassword, changePassword, updateUser} from '../controllers/user.controller.js'
// const { isLoggedIn } = require('../middleware/auth.middleware')
import { isLoggedIn } from '../middleware/auth.middleware.js'
import upload from '../middleware/multer.middleware.js  '


const userRouter = express.Router()


userRouter.post('/register', upload.single('avatar'), register)
userRouter.post('/login', login)
userRouter.get('/logout', isLoggedIn, logout)
userRouter.get('/profile', isLoggedIn, profile)
userRouter.post('/reset', forgotPassword)
userRouter.post('/reset/:resetToken', resetPassword)
userRouter.post('/change-password', isLoggedIn, changePassword)
userRouter.put('/updateUser', isLoggedIn, upload.single('avatar'), updateUser)


export {
    userRouter
}