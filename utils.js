const fs = require('fs')
const db = 'database.json'
const faker = require('faker');
const uuid = require('short-uuid');
const { parse } = require('path');
const { json } = require('express');
const { LOADIPHLPAPI } = require('dns');
const createID = uuid(); // Defaults to flickrBase58

const dataBase = () => {
    const isDataExists = fs.existsSync(db)
    const createDB = () => {
        const firstMsg = {
            'nice!': "now you have database!",
            'what next?': "go to /api/create to create some users",
        }
        fs.writeFileSync(db, JSON.stringify(firstMsg))
        return getDB()
    }
    const getDB = () => {
        const database = fs.readFileSync(db)
        return JSON.parse(database.toString())
    }
    return !isDataExists 
        ? createDB()
        : getDB()
    }

const createUser = (number) => {
    let data = []
    for (let i = 0; i < number; i++){
        data.push({
            id: createID.new(),
            name: `${faker.name.firstName()} ${faker.name.lastName()}`,
            passport: faker.datatype.number({max: 499999999}),
            cash: 0,
            credit: 0,
        })
    }
    fs.writeFileSync(db, JSON.stringify(data))
}
const findUserIndex = id => {
    let database = dataBase()
    return database.findIndex(users => users.id === id)
} 
const userDetails = id => {
    let userID = findUserIndex(id)
    let database = dataBase()
    return database[userID]
}
const depositCash = (id,passport,cashAmount) => {
    const userID = findUserIndex(id);
    const user = userDetails(id)
    const data = dataBase()
    const cash = parseInt(cashAmount)
    if (Number.isInteger(cash) && cash > 0){
        if (userID > -1 && user.passport === passport){
            const updatedUser = {
                ...user,
                "cash": parseInt(user.cash) + cash
            }
            data.splice(userID,1,updatedUser)
            fs.writeFileSync(db, JSON.stringify(data))
        } else {
            console.log(`user nor found.`);
        }
    }
}
const updateCredit = (id, passport, creditAmount) => {
    const userID = findUserIndex(id);
    const user = userDetails(id)
    const data = dataBase()
    const credit = parseInt(creditAmount)
    if (credit && credit > 0){
        if (passport === user.passport && userID > -1){
            let updatedUser = {
                ...user,
                "credit": parseInt(creditAmount)
            }
            data.splice(userID,1,updatedUser)
            fs.writeFileSync(db,JSON.stringify(data))
        } else {
            console.log(`user not found`);
        }
    }
}

const withdrawFromUser = (userID,userPassport, withdrawAmount) => {
    let userIndex = findUserIndex(userID)
    let userData = userDetails(userID)
    let data = dataBase()
    let endMsg = ''
    const { id, passport, cash, credit } = userData
    let creditNum = parseInt(credit)
    const userExist = userIndex > -1 && id === userID && passport === userPassport
    if (userExist){
        if (cash > 0 && withdrawAmount <= cash){ // handle just with cash
            let userUpdated = {
                ...userData,
                "cash": cash - withdrawAmount,
            }
            data.splice(userIndex,1,userUpdated)
            fs.writeFileSync(db,JSON.stringify(data))
            endMsg = `hey, ${userData.name}, you just withdraw ${withdrawAmount}$ from your account!`
        } else if (cash >= 0 && withdrawAmount <= (cash + creditNum)){ 
            let subFromCredit = withdrawAmount - cash;
            if (subFromCredit <= creditNum){
                let userUpdated = {
                    ...userData,
                    "cash": cash - withdrawAmount,
                    "credit": creditNum - subFromCredit
                }
                data.splice(userIndex,1,userUpdated)
                fs.writeFileSync(db,JSON.stringify(data))
                endMsg = `hey, ${userData.name}, you just withdraw ${withdrawAmount}$ from your account!`
            } else {
                endMsg = 'more then user can..'
            }
        } else if (cash <= 0 && withdrawAmount <= creditNum){
            let userUpdated = {
                ...userData,
                "cash": cash - withdrawAmount,
                "credit": creditNum - withdrawAmount
            } 
            data.splice(userIndex,1,userUpdated)
            fs.writeFileSync(db,JSON.stringify(data))
            endMsg = `hey, ${userData.name}, you just withdraw ${withdrawAmount}$ from your account!`
        } else {
            endMsg =  'more then user have..'
        }
    } else {
        endMsg = 'not valid...'
    }
    return endMsg
}

const withdrawP2P = (fromUser,toUser, amount) => {
    const data = dataBase()
    const fromUserIndex = findUserIndex(fromUser.id)
    const toUserIndex = findUserIndex(toUser.id)
    const { cash, credit, name} = fromUser
    let endMsg = '';
    if (amount <= cash && cash > 0){
        let updatedFromUser = {
            ...fromUser,
            "cash": cash - amount
        }
        let updatedToUser = {
            ...toUser,
            "cash": toUser.cash + amount
        }
        data.splice(fromUserIndex,1,updatedFromUser)
        data.splice(toUserIndex,1,updatedToUser)
        fs.writeFileSync(db,JSON.stringify(data))
        endMsg = `transfer successful! deposite ${amount}$ from ${name} to ${updatedToUser.name}`
    } else if (cash > 0 && amount > cash && amount <= (cash + credit)){
        const creditAmount = credit - (amount - cash) 
        const isCreditLeft = creditAmount > 0 ? true : false
        if (isCreditLeft){
            let updatedFromUser = {
                ...fromUser,
                "cash": cash - amount,
                "credit": creditAmount
            }
            let updatedToUser = {
                ...toUser,
                "cash": toUser.cash + amount
            }
            data.splice(fromUserIndex,1,updatedFromUser)
            data.splice(toUserIndex,1,updatedToUser)
            fs.writeFileSync(db,JSON.stringify(data))
            endMsg = `transfer successful! deposite ${amount}$ from ${name} to ${updatedToUser.name}`
        }
    } else if (cash <= 0 && amount <= credit){
        let updatedFromUser = {
            ...fromUser,
            "cash": cash - amount,
            "credit": credit - amount
        }
        let updatedToUser = {
            ...toUser,
            "cash": toUser.cash + amount
        }
        data.splice(fromUserIndex,1,updatedFromUser)
        data.splice(toUserIndex,1,updatedToUser)
        fs.writeFileSync(db,JSON.stringify(data))
        endMsg = `transfer successful! deposite ${amount}$ from ${name} to ${updatedToUser.name}`
    }
    return endMsg
}

module.exports = {
    dataBase,
    createUser,
    userDetails,
    findUserIndex,
    depositCash,
    updateCredit,
    withdrawFromUser,
    withdrawP2P
}