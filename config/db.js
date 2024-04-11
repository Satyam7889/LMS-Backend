import mongoose from 'mongoose'


const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`)
        console.log(`\n MongoDB connected!! DB HOST: ${connectionInstance.connection.host}`);
    }

    catch(error){
        console.log("MONGODB connection Error" , error);
        process.exit(1)
    }
}

export default connectDB