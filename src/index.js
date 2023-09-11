const express = require('express')
// const Post = require('./models/post')
require('./db/mongoose')
const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('root handler');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})