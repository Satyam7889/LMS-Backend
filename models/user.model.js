// const {Schema, default: mongoose} = require('mongoose')
import mongoose, {Schema} from 'mongoose' 
// const bcrypt = require('bcryptjs')
import bcrypt from 'bcryptjs'
// const jwt = require('jsonwebtoken')
import jwt from 'jsonwebtoken'

import crypto from 'crypto'
import { type } from 'os'

const userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, "Fullname is required"],
        minLength: [5, 'name must be at-least 5 character'],
        maxLength: [50, 'name must should be less than 50 character'],
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: [true, "Email is already used"],
        lowercase: true,
        trim: true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid email address"]
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minLength: [8, 'Password must be at-least 8 character'],
        select: false
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    avatar: {
        public_id: {
            type: String,
        },
        secure_url: {
            type: String,
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,

    subscription: {
        id: String,
        status: String
    }
    

}, {timestamps: true})


userSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods = {
    comparePassword: async function(PlainTextPassword){
        return await bcrypt.compare(PlainTextPassword, this.password)
    },

    generateJWTToken: async function(){
        return jwt.sign(
            {
            id: this.id,
            role: this.role,
            subscription: this.subscription,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY
            }
        )
    },

    generatePasswordToken: async function(){
        const resetToken = crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken = crypto
                                        .createHash('sha256')
                                        .update(resetToken)
                                        .digest('hex')

        this.forgotPasswordExpiry = Date.now() + 15*60*1000  //15 minutes

        return resetToken

    }
}



export const User = mongoose.model("User" , userSchema)
