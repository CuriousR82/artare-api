const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const postRouter = require('./routers/post')
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json())
app.use(userRouter)
app.use(postRouter)

app.get('/', (req, res) => {
    res.send('root handler');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
}) 