import mongoose from 'mongoose'

export class MongoDBClient{
    static async connect(){
        try{
            const uri = process.env.MONGODB_URI;

            const conn = await mongoose.connect(uri, {
                dbName: process.env.MONGODB_NAME, // <--- Esto fuerza el nombre "sweet-medical"
            });
            
            console.log(`MongoDB esta conectado ${conn.connection.host}`)
        } catch(error){
            console.error(`Error: ${error.message}`)
            process.exit(1)
        }
    }
}