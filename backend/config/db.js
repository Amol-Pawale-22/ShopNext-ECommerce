const mongoose = require("mongoose");



async function connectDB() {

    try{
        const conn = await mongoose.connect(process.env.MONGO_URL);
         console.log("Backend Database Connected");   
}

catch(error){
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
}

};




module.exports = connectDB;

