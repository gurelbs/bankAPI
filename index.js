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
    findUserID,
    depositCash
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
        let isExist = findUserID(id) > -1
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

// depositing cash to users/:id

app.put('/api/users/:id', (req, res) => {
    const { id } = req.params
    const cashAmount = req.query.amount
    const user = userDetails(id)
    const { name, passport } = user
    try {
        depositCash(id,name,passport,parseInt(cashAmount))
        res.json(`${cashAmount}$ deposited to ${name}`)
    } catch (e) {
        res.json(`error: ${e.message}`)
    }
})
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.listen(PORT, () => console.log(`server run at http://localhost:${PORT}`))