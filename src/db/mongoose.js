const mongoose = require('mongoose');
require('dotenv').config();

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.hqzsj45.mongodb.net/?retryWrites=true&w=majority`).then(() => {
    console.log('Connected to MongoDB');
})
    .catch((e) => console.log(e))