const mongoose = require('mongoose');

const dbConnect = async () => {
    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(process.env.DATABASE_URI)
    } catch (error) {
        console.log('error', error)
    }
}

module.exports = dbConnect;