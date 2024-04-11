// const cookieParser = require('cookie-parser')
import cookieParser from 'cookie-parser'
// const express = require('express')
import express from 'express'
// const cors = require('cors')
import cors from 'cors'
// const connectDB = require('./config/db.js')
import connectDB from './config/db.js'
// const router = require('./routes/user.route.js')
import {userRouter} from './routes/user.route.js'
// const errorMiddleware = require('./middleware/error.middleware.js')
import errorMiddleware from './middleware/error.middleware.js'
// const morgan = require('morgan')
import morgan from 'morgan'
import { config } from 'dotenv';
import courseRouter from './routes/course.route.js'
import paymentRouter from './routes/payment.route.js'
config();



const app = express()


connectDB()

app.use(express.json())

app.use(cors({
    origin: [process.env.CLIENT_URL],
    credentials: true
}))

app.use(morgan('dev'))

app.use(cookieParser())

app.use('/ping', (req, res) => {
    res.send('Pong')
})
 
// 3 route config
app.use('/api/lms/user', userRouter)
app.use('/api/lms/courses', courseRouter)
app.use('/api/lms/payment',paymentRouter)

app.all('*', (req, res) => {
    res.status(404).send('404 - Page not found')
})


app.use(errorMiddleware);


export {app}