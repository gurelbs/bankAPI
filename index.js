require('./DB/mongoose')
const express = require('express')
const cors = require('cors')
const path = require('path')
const port = process.env.PORT || 5000
const app = express()
const userRouter = require('./routers/user')
// app.get('/',express.static(path.join(__dirname, 'public')))
// app.use(express.static(path.join(__dirname, 'public')))
app.use(cors());
app.use(express.json())
app.use(userRouter)

app.use((req, res) => {
// Invalid request
    res.json({
    error: {
        'oops...':'i can`t get this page',
        'status':404,
        'message':'Invalid Request',
        'statusCode':404,
        'go to':'/api/users or api/create'
    }
    });
});
app.listen(port, () => console.log(`server run at http://localhost:${port}`))