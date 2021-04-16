const express = require('express')
const { fstat } = require('fs')
const path = require('path')
const PORT = process.env.PORT || 3000
const app = express()
const { 
    createNewJSON, 
    getData, 
    checkCreateNumber, 
    createUser,
    userDetails,
    findUserIndex,
    depositCash,
    updateCredit,
    withdrawFromUser,
    withdrawP2P,
} = require('./utils.js')

app.get('/api', (req, res) => {
    try {
        createNewJSON()
        res.json({
            'hey': "nice! now you have database!",
            'what next?': "go to /api/create",
        })
    } catch (e) {
        res.json({
            error: 'there is some error...',
            errorDetails: e.message
        })
    }
})

app.get(`/api/users`, (req, res) => {
    res.json(getData())
})

app.get(`/api/users/:id`, (req, res) => {
    const { id } = req.params
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
})
app.get(`/api/create`, (req, res) => {
    try {
        res.json({
            'create user': 'to create user go to /api/create/[number]',
            'query': 'positive integer number between 1 - 100'
        })
    } catch (e) {
        res.json(`error: ${e.message}`)
    }
})
app.get(`/api/create/:number`, (req, res) => {
    const { number } = req.params
    try {
        if (checkCreateNumber(number)) {
            createUser(number)
            res.json(`users created. go to /api/users to see all users`)
        } else {
            res.json(`error: try to create users (number between 1-100)`)
        }
    } catch (e) {
        res.json(`error: ${e.message}`)
    }
})

// depositing cash to users/:id or update credit

app.put('/api/users/:id', (req, res) => {
    const cash = req.query.cash
    const credit = req.query.credit
    const querys = Object.keys(req.query)
    const { id } = req.params
    const user = userDetails(id)
    const { name, passport } = user
    let checkIfIncludes = querys.includes('cash') || querys.includes('credit')
    let notDuplicated = typeof req.query.cash !== 'object' && typeof req.query.credit !== 'object' 
    let cashIsMoreThen0 = parseInt(cash) > 0
    let creditIsVaild = parseInt(credit) >= 0;
    if (checkIfIncludes && notDuplicated && (cashIsMoreThen0 || creditIsVaild)) {
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
            res.json('you can`t do that...')
        }
    } else {
        res.json('you can`t do that...')
    }
})

app.put('/api/users/:id/withdraw', (req, res) => {
    const { amount } = req.query
    const { id } = req.params
    const user = userDetails(id)
    let { cash, credit, passport } = user
    cash = parseInt(cash)
    credit = parseInt(credit)
    const maxWithdraw = cash + credit
    amountNumber = parseInt(amount)
    if (amountNumber <= maxWithdraw && amountNumber > 0){
        try {
            withdrawFromUser(id,passport,amountNumber)
            res.json({
                "nice!": 'withdraw complete successfully!',
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

app.put('/api/users/:id/P2Pwithdraw', (req, res) => {
    const { to, amount } = req.query;
    const { id } = req.params;
    let fromUserData = userDetails(id)
    let toUserData = userDetails(to)
    // console.log(fromUserData,toUserData);
    const amountNum = parseInt(amount)
    const maxWithdraw = fromUserData.cash + fromUserData.credit
    if (amountNum <= maxWithdraw){
        try {
            withdrawP2P(fromUserData,toUserData,maxWithdraw, amountNum)
            res.json({
                "message": `${withdrawP2P(fromUserData,toUserData,maxWithdraw, amountNum)}`,
                // "nice!": `withdraw from ${id} to ${to} complete successfully!`,
                // "what next?": `go to /api/users/${id} to see the user details..`
            })
        } catch (e) {
            res.json(`error: ${e.message}`)
        }
    } else {
        try {
            return amount > maxWithdraw
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
app.listen(PORT, () => console.log(`server run at http://localhost:${PORT}`))