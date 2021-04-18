const express = require('express')
const { fstat } = require('fs')
const path = require('path')
const PORT = process.env.PORT || 3000
const app = express()
const { 
    dataBase,
    createUser,
    userDetails,
    findUserIndex,
    depositCash,
    updateCredit,
    withdrawFromUser,
    withdrawP2P,
} = require('./utils.js')


app.get('/',express.static(path.join(__dirname, 'public')))
// create all users or uniq user by query
app.post(`/api/create`, (req, res) => {
    let { q } = req.query
    q = parseInt(q)
    if (!q) res.json({
        "message": `try to add query and number`,
        "Exmple": '/api/create?q=3'
    })
    if (q && q > 0 && q < 101){
        try {
            createUser(q)
            res.json(`users created. go to /api/users to see all users`)
        } catch (e) {
            res.json(`error: ${e.message}`)
        }
    } else {
        try {
            res.json(`try to user number between 1 to 100`)
        } catch (e) {
            res.json(`error: ${e.message}`)
        }
    }
})
// get users
app.get(`/api/users`, (req, res) => {
    const { id } = req.query
    console.log(id);
    const isNoQeary = !Object.values(req.query).length
    if (isNoQeary){
        try {
            res.json(dataBase())
        } catch (e) {
            res.json({
                error: 'there is some error...',
                errorDetails: e.message
            })
        }
    } else {
        if (id){
            try {
                let isExist = findUserIndex(id) > -1
                if (isExist) {
                    res.json(userDetails(id))
                } else {
                    res.json('user Not Found...')
                }
            } catch (e) {
                res.json({
                    "error details": e.message,
                    'tip': 'check user by id (look like this: uwLSQJjsXn48V6MZz8RCPA)'
                })
            }
        } else {
            try {
                res.json({
                    "oops...":'try again with the right query... ',
                    "exmple": '/api/users?id=4MEkU9xufxSJvT2NrzYY58'
                })
            } catch (e) {
                res.json({
                    error: 'there is some error...',
                    errorDetails: e.message
                })
            }
        }
    }
})

// put cash ot credit to user
// exmple: /api/users?q=[id]&cash=[number]&credit=[number]

app.put('/api/users', (req, res) => {
    const {id, cash, credit} = req.query || ''
    const user = userDetails(id)
    const { name, passport } = user || ''
    let checkIfIncludes = !!id && (!!cash || !!credit)
    let notDuplicatedQuery = typeof cash !== 'object' && typeof credit !== 'object' && typeof credit !== 'object'
    let cashIsMoreThen0 = parseInt(cash) > 0
    let creditIsVaild = parseInt(credit) >= 0;
    let isQuery = Object.values(req.query).length > 1
    console.log(id,isQuery,  checkIfIncludes , notDuplicatedQuery);
    if (checkIfIncludes && notDuplicatedQuery) {
        if (cash && !credit && cashIsMoreThen0){
            try {
                depositCash(id,passport,cash)
                res.json({
                    "nice!": `<h1>${cash}$ deposited to ${name}</h1>`,
                    "what next?":`go to /api/users/${id}`
                })
            } catch (e) {
                res.json(`error: ${e.message}`)
            }
        } else if (credit && !cash && creditIsVaild){
            try {
                updateCredit(id, passport, credit)
                res.json({
                    "nice!": `<h1>you just updated your client '${name}' credit card to ${credit}$</h1>`,
                    "what next?":`go to /api/users/${id}`
                })
            } catch (e) {
                res.json(`error: ${e.message}`) 
            }
        } else if (cash && credit && cashIsMoreThen0 && creditIsVaild){
            try {
                depositCash(id,passport,cash)
                updateCredit(id, passport, credit)
                res.json({
                    "nice!": `<h1>you just updated your client '${name}' credit card to ${credit}$ and he also deposite ${cash}$ to his account</h1>`,
                    "what next?":`go to /api/users/${id}`
                })
            } catch (e) {
                res.json(`error: ${e.message}`)
            }
        } else {
            res.json('you can`t do that na...')
        }
    } else {
        res.json('you can`t do that now...')
    }
})

app.put('/api/users/:id/withdraw', (req, res) => {
    const { amount } = req.query
    const { id } = req.params
    const user = userDetails(id)
    let { cash, credit, passport } = user
    const maxWithdraw = cash + credit
    cash = parseInt(cash)
    credit = parseInt(credit)
    amountNumber = parseInt(amount)
    let isValid = 
        cash > 0 && amountNumber <= cash ||
        cash >= 0 && amountNumber <= (cash + credit) ||
        cash <= 0 && amountNumber <= credit
    if (credit >= 0 && amountNumber > 0 && isValid){
        try {
            // withdrawFromUser(id,passport,amountNumber)
            res.json({
                "message": `${withdrawFromUser(id,passport,amountNumber)}`,
                "what next?": `go to /api/users/${id} to see the user details..`
            })
        } catch (e) {
            res.json(`error: ${e.message}`)
        }
    } else {
        try {
            return ( amountNumber > maxWithdraw
                ? res.json('you try to Withdraw more then the user have!')
                : res.json('try again with numbers...')  
            )  
        } catch (e) {
            res.json(`error: ${e.message}`)
        }
    }
})

app.put('/api/users/:id/withdrawP2P', (req, res) => {
    const { to, amount } = req.query;
    const { id } = req.params;
    let fromUserData = userDetails(id)
    const { cash, credit } = fromUserData
    let toUserData = userDetails(to)
    const fromUserIndex = findUserIndex(id)
    const toUserIndex = findUserIndex(to)
    const amountNum = parseInt(amount)
    const validCases =  (amountNum <= cash && cash > 0) 
        || (cash >= 0 && amountNum > cash && amountNum <= (cash + credit)) 
        || (cash <= 0 && amountNum <= credit) 
    const IsValid = (amountNum > 0)
        && (id !== to)
        && (fromUserIndex !== toUserIndex)
        console.log(IsValid && validCases,IsValid ,validCases);
    if (IsValid && validCases){
        try {
            res.json({
                "message": `${withdrawP2P(fromUserData,toUserData, amountNum)}`,
                "what next?": `go to /api/users/${to} to see the user details..`
            })
        } catch (e) {
            res.json(`error: ${e.message}`)
        }
    } else {
        try {
            return amount >= amountNum
            ? res.json(`${fromUserData.name} dont have enough money`)
            : typeof amount !== 'number'
            ? res.json(`try again with positive number`)
            : res.json(`you can't do that...`)
        } catch (e) {
            res.json(`error: ${e.message}`)
        }
    }
})


app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
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
app.listen(PORT, () => console.log(`server run at http://localhost:${PORT}`))