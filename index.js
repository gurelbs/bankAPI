require('./DB/mongoose')
const express = require('express')
const cors = require('cors')
const path = require('path')
const port = process.env.PORT || 5000
const app = express()
const userRouter = require('./routers/user')
const accountRouter = require('./routers/account')
app.use(express.static(path.join(__dirname, 'client/build')));
// app.use(express.static(path.join(__dirname, 'public')))
app.use(cors());
app.use(express.json())
app.use(userRouter)
app.use(accountRouter)

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});
app.listen(port, () => console.log(`server run at http://localhost:${port}`))