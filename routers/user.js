const express = require('express')
const validator = require('validator');
const User = require('./../modules/user')
const Account = require('./../modules/account')
const mongoose = require('mongoose')
// const { 
//     dataBase,
//     createUser,
//     userDetails,
//     findUserIndex,
//     depositCash,
//     updateCredit,
//     withdrawFromUser,
//     withdrawP2P,
// } = require('./utils');
const { ObjectId } = require('bson');

const router = new express.Router()

router.post('/api/user/create', async (req,res) => {
    const user = new User(req.body)
    try {
        user.save( (err,user) => {
            return err
            ? res.status(500).json(err)
            : res.status(201).json(`hey ${user.name}, user created!`)
        })
    } catch (e) {
        res.status(500).json(`there is some error ${e}`)
    }   
})
router.get('/api/user/:id/:account', async (req,res) => {
    const {id, account} = req.params
    const user = await User.findOne({_id: id})
    const accountDetails = await Account.findOne({_id: account})
    try {
        if (!user){
            res.status(404).json(`user not found`)
        }
        res.status(200).json({
            "user": user,
            "accountDetails":accountDetails
        })
    } catch (e) {
        res.status(500).json(`there is some error ${e}`)
    }
})
router.put('/api/user/:id/:account', async (req,res) => {
    const {id, account} = req.params
    const credit = req.body
    const user = await User.findOne({_id: id})
    const accountDetails = await Account.findOne({_id: account})
    try {
        if (!user){
            res.status(404).json(`user not found`)
        }
        if (!accountDetails){
            res.status(404).json(`account not found`)
        }
        if (credit < 0){
            res.status(404).json(`requested credit must be more then 0`)
        }
        await Account.findOneAndUpdate({_id: accountDetails._id},credit)
        const updateAccount = await Account.findOne({_id: account})
        res.status(200).json({
            "message": 'account updated',
            "accountDetails":updateAccount
        })
    } catch (e) {
        res.status(500).json(`there is some error ${e}`)
    }
})
router.put('/api/user/:id/:account/deposit', async (req,res) => {
    const {id, account} = req.params
    const cashAmount = req.body
    const user = await User.findOne({_id: id})
    const accountDetails = await Account.findOne({_id: account})
    const cash = parseFloat(accountDetails.cash) + parseFloat(cashAmount.cash)
    try {
        if (!user){
            res.status(404).json(`user not found`)
        }
        if (!accountDetails || parseFloat(cash) < 0){
            res.status(404).json(`not valid`)
        }
        await Account.findOneAndUpdate({_id: accountDetails._id}, {"cash": cash})
        const updatedAccount = await Account.findOne({_id: account})
        res.status(200).json({
            "message": 'account updated',
            "accountDetails": updatedAccount
        })
    } catch (e) {
        res.status(500).json(`there is some error ${e}`)
    }
})
router.put('/api/user/:id/:account/withdraw', async (req,res) => {
    let {id, account} = req.params
    let withdrawAmount = req.body
    let user = await User.findOne({_id: id})
    let accountDetails = await Account.findOne({_id: account})
    let withdrawCash = parseFloat(withdrawAmount.cash)
    let accCash = parseFloat(accountDetails.cash)
    let accCredit = parseFloat(accountDetails.credit)
    let newCredit,newCash,updatedAccount
    try {
        if (!user){
            res.status(404).json(`user not found`)
        }
        if (!accountDetails){
            res.status(404).json(`account not found`)
        }
        if (accCredit < 0){
            res.status(404).json(`withdraw amount is not valid`)
        }
        if (withdrawCash <= accCash && accCash >= 0){
            const cash = accCash - withdrawCash
            await Account.findOneAndUpdate({_id: accountDetails._id}, {"cash": cash})
            updatedAccount = await Account.findOne({_id: account})
            res.status(200).json({
                "message": 'account updated',
                "accountDetails":updatedAccount
            })
        } else if ((withdrawCash > accCash && accCash >= 0) && withdrawCash <= (accCash + accCredit)){
            const remind = withdrawCash - accCash
            newCredit = accCredit - remind
            newCash = 0 - remind
            await Account.findOneAndUpdate({_id: accountDetails._id}, {"cash": newCash, "credit": newCredit})
            updatedAccount = await Account.findOne({_id: account})
            res.status(200).json({
                "message": 'account updated',
                "accountDetails":updatedAccount
            })
        } else if (withdrawCash > accCash && accCash < 0 && withdrawCash <= accCredit && accCredit >= 0){
            newCash = accCash - withdrawCash
            newCredit = accCredit - withdrawCash
            await Account.findOneAndUpdate({_id: accountDetails._id}, {"cash": newCash, "credit": newCredit})
            updatedAccount = await Account.findOne({_id: account})
            res.status(200).json({
                "message": 'account updated',
                "accountDetails":updatedAccount
            })
        } else {
            res.status(500).json(`withdraw not valid`)
        }
    } catch (e) {
        res.status(500).json(`there is some error ${e}`)
    }
})
router.put('/api/user/:id/:account/withdrawP2P', async(req,res) => {
    let { id, account} = req.params
    let toAccount = req.body.to 
    let amount = req.body.amount
    amount = parseFloat(amount)
    let fromUserDetails = await User.findOne({_id: id})
    let fromAccountDetails = await Account.findOne({_id: account})
    let toAccountDetails = await Account.findOne({_id: toAccount})
    console.log(fromUserDetails,fromAccountDetails,amount,toAccount)
    let fromUserCash = parseFloat(fromAccountDetails.cash)
    let fromUserCredit = parseFloat(fromAccountDetails.credit)
    let fromUserTotal = parseFloat(fromAccountDetails.credit)
    try {
        const updatedSuccessed = async res => {
            const updatedFromAccount = await Account.findOne({_id: account})
            const updatedToAccount = await Account.findOne({_id: toAccountDetails._id})
            return res.status(200).json({
                "message": 'accounts updated',
                "fromAccount":updatedFromAccount,
                "toAccount":updatedToAccount
            })
        }
        // console.log({
        //     'not valid': !fromUserDetails || !fromAccountDetails || !toAccountDetails || !amount,
        //     'valid': amount <= fromUserCash && fromUserCash >= 0 && amount > 0,
        //     'valid': (amount > fromUserCash && fromUserCash >= 0) && amount <= (fromUserCash + fromUserCredit) && amount > 0,
        //     'valid': amount > fromUserCash && fromUserCash < 0 && amount <= fromUserCredit && fromUserCredit >= 0 && amount > 0
        // })
        if (!fromUserDetails || !fromAccountDetails || !toAccountDetails || !amount){
            res.status(404).send('request not valid')
        }
        if (amount <= fromUserCash && fromUserCash >= 0 && amount > 0){
            const cashFrom = fromUserCash - amount
            const cashTo = parseFloat(toAccountDetails.cash) + amount
            await Account.findOneAndUpdate({_id: fromAccountDetails._id}, {"cash": cashFrom})
            await Account.findOneAndUpdate({_id: toAccountDetails._id}, {"cash": cashTo})
            updatedSuccessed(res)
        }
        else if ((amount > fromUserCash && fromUserCash >= 0) && amount <= (fromUserCash + fromUserCredit) && amount > 0){
            const remind = amount - fromUserCash
            const cashTo = parseFloat(toAccountDetails.cash) + amount 
            let newCredit = fromUserCredit - remind
            let newCash = 0 - remind
            await Account.findOneAndUpdate({_id: fromAccountDetails._id}, {"cash": newCash, "credit": newCredit})
            await Account.findOneAndUpdate({_id: toAccountDetails._id}, {"cash": cashTo})
            updatedSuccessed(res)
        } else if (amount > fromUserCash && fromUserCash < 0 && amount <= fromUserCredit && fromUserCredit >= 0 && amount > 0){
            let cashFrom = fromUserCash - amount
            const cashTo = parseFloat(toAccountDetails.cash) + amount 
            let newCredit = fromUserCredit - amount
            await Account.findOneAndUpdate({_id: fromAccountDetails._id}, {"cash": cashFrom, "credit": newCredit})
            await Account.findOneAndUpdate({_id: toAccountDetails._id}, {"cash": cashTo})
            updatedSuccessed(res)
        } else {
            res.status(200).json('sorry... is not a not valid transaction')
        }
    } catch (error) {
        res.status(404).send(error)
    }
})
let pathName = '/api/user/:id' || '/user/api/user/:id'
router.get(pathName, async (req,res) => {
    const {id} = req.params
    console.log(id)
    try {
        if (id){
            const user = await User.findOne({_id: id}).exec()
            console.log(user)
            res.status(200).json(user)
        } else {
            res.status(500).json(`there is some error..`)
        }
    } catch (e) {
        res.status(500).json(`there is some error ${e}`)
    }
})
router.get('/api/user', async (req,res) => {
    const {email, password} = req.query
    const user = await User.findOne({email: email, password: password }).exec()
    try {
        res.status(200).json(user)
    } catch (e) {
        res.status(500).json(`there is some error ${e}`)
    }
})

// create all users or uniq user by query
// router.post(`/api/create`, (req, res) => {
//     let { q } = req.query
//     q = parseInt(q)
//     if (!q) res.json({
//         "message": `try to add query and number`,
//         "Exmple": '/api/create?q=3'
//     })
//     if (q && q > 0 && q < 101){
//         try {
//             createUser(q)
//             res.json(`users created. go to /api/users to see all users`)
//         } catch (e) {
//             res.json(`error: ${e.message}`)
//         }
//     } else {
//         try {
//             res.json(`try to user number between 1 to 100`)
//         } catch (e) {
//             res.json(`error: ${e.message}`)
//         }
//     }
// })
// // get users
// router.get(`/api/users`, (req, res) => {
//     const { id } = req.query
//     console.log(id);
//     const isNoQeary = !Object.values(req.query).length
//     if (isNoQeary){
//         try {
//             res.json(dataBase())
//         } catch (e) {
//             res.json({
//                 error: 'there is some error...',
//                 errorDetails: e.message
//             })
//         }
//     } else {
//         if (id){
//             try {
//                 let isExist = findUserIndex(id) > -1
//                 if (isExist) {
//                     res.json(userDetails(id))
//                 } else {
//                     res.json('user Not Found...')
//                 }
//             } catch (e) {
//                 res.json({
//                     "error details": e.message,
//                     'tip': 'check user by id (look like this: uwLSQJjsXn48V6MZz8RCPA)'
//                 })
//             }
//         } else {
//             try {
//                 res.json({
//                     "oops...":'try again with the right query... ',
//                     "exmple": '/api/users?id=4MEkU9xufxSJvT2NrzYY58'
//                 })
//             } catch (e) {
//                 res.json({
//                     error: 'there is some error...',
//                     errorDetails: e.message
//                 })
//             }
//         }
//     }
// })

// // put cash ot credit to user
// // exmple: /api/users?q=[id]&cash=[number]&credit=[number]

// router.put('/api/users', (req, res) => {
//     const {id, cash, credit} = req.query || ''
//     const user = userDetails(id)
//     const { name, passport } = user || ''
//     let checkIfIncludes = !!id && (!!cash || !!credit)
//     let notDuplicatedQuery = typeof cash !== 'object' && typeof credit !== 'object' && typeof credit !== 'object'
//     let cashIsMoreThen0 = parseInt(cash) > 0
//     let creditIsVaild = parseInt(credit) >= 0;
//     let isQuery = Object.values(req.query).length > 1
//     console.log(id,isQuery,  checkIfIncludes , notDuplicatedQuery);
//     if (checkIfIncludes && notDuplicatedQuery) {
//         if (cash && !credit && cashIsMoreThen0){
//             try {
//                 depositCash(id,passport,cash)
//                 res.json({
//                     "nice!": `<h1>${cash}$ deposited to ${name}</h1>`,
//                     "what next?":`go to /api/users/${id}`
//                 })
//             } catch (e) {
//                 res.json(`error: ${e.message}`)
//             }
//         } else if (credit && !cash && creditIsVaild){
//             try {
//                 updateCredit(id, passport, credit)
//                 res.json({
//                     "nice!": `<h1>you just updated your client '${name}' credit card to ${credit}$</h1>`,
//                     "what next?":`go to /api/users/${id}`
//                 })
//             } catch (e) {
//                 res.json(`error: ${e.message}`) 
//             }
//         } else if (cash && credit && cashIsMoreThen0 && creditIsVaild){
//             try {
//                 depositCash(id,passport,cash)
//                 updateCredit(id, passport, credit)
//                 res.json({
//                     "nice!": `<h1>you just updated your client '${name}' credit card to ${credit}$ and he also deposite ${cash}$ to his account</h1>`,
//                     "what next?":`go to /api/users/${id}`
//                 })
//             } catch (e) {
//                 res.json(`error: ${e.message}`)
//             }
//         } else {
//             res.json('you can`t do that na...')
//         }
//     } else {
//         res.json('you can`t do that now...')
//     }
// })

// router.put('/api/users/:id/withdraw', (req, res) => {
//     const { amount } = req.query
//     const { id } = req.params
//     const user = userDetails(id)
//     let { cash, credit, passport } = user
//     const maxWithdraw = cash + credit
//     cash = parseInt(cash)
//     credit = parseInt(credit)
//     amountNumber = parseInt(amount)
//     let isValid = 
//         cash > 0 && amountNumber <= cash ||
//         cash >= 0 && amountNumber <= (cash + credit) ||
//         cash <= 0 && amountNumber <= credit
//     if (credit >= 0 && amountNumber > 0 && isValid){
//         try {
//             // withdrawFromUser(id,passport,amountNumber)
//             res.json({
//                 "message": `${withdrawFromUser(id,passport,amountNumber)}`,
//                 "what next?": `go to /api/users/${id} to see the user details..`
//             })
//         } catch (e) {
//             res.json(`error: ${e.message}`)
//         }
//     } else {
//         try {
//             return ( amountNumber > maxWithdraw
//                 ? res.json('you try to Withdraw more then the user have!')
//                 : res.json('try again with numbers...')  
//             )  
//         } catch (e) {
//             res.json(`error: ${e.message}`)
//         }
//     }
// })

// router.put('/api/users/:id/withdrawP2P', (req, res) => {
//     const { to, amount } = req.query;
//     const { id } = req.params;
//     let fromUserData = userDetails(id)
//     const { cash, credit } = fromUserData
//     let toUserData = userDetails(to)
//     const fromUserIndex = findUserIndex(id)
//     const toUserIndex = findUserIndex(to)
//     const amountNum = parseInt(amount)
//     const validCases =  (amountNum <= cash && cash > 0) 
//         || (cash >= 0 && amountNum > cash && amountNum <= (cash + credit)) 
//         || (cash <= 0 && amountNum <= credit) 
//     const IsValid = (amountNum > 0)
//         && (id !== to)
//         && (fromUserIndex !== toUserIndex)
//         console.log(IsValid && validCases,IsValid ,validCases);
//     if (IsValid && validCases){
//         try {
//             res.json({
//                 "message": `${withdrawP2P(fromUserData,toUserData, amountNum)}`,
//                 "what next?": `go to /api/users/${to} to see the user details..`
//             })
//         } catch (e) {
//             res.json(`error: ${e.message}`)
//         }
//     } else {
//         try {
//             return amount >= amountNum
//             ? res.json(`${fromUserData.name} dont have enough money`)
//             : typeof amount !== 'number'
//             ? res.json(`try again with positive number`)
//             : res.json(`you can't do that...`)
//         } catch (e) {
//             res.json(`error: ${e.message}`)
//         }
//     }
// })

module.exports = router