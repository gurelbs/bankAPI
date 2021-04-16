const fs = require('fs')
const db = 'database.json'
const faker = require('faker');
const uuid = require('short-uuid');
const { parse } = require('path');
const createID = uuid(); // Defaults to flickrBase58

const createNewJSON = () => {
    let data = ["nice! now you have database !"]
    const isExists = fs.existsSync(db)
    if (!isExists) fs.writeFileSync(db, JSON.stringify(data))
}

const getData = () => {
    let data = fs.readFileSync(db)
    return JSON.parse(data.toString())
}

const checkCreateNumber = x => {
    let num = parseInt(x)
    return (num < 0 || num > 100) ? false : true
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
    let database = getData()
    return database.findIndex(users => users.id === id)
} 
const userDetails = id => {
    let userID = findUserIndex(id)
    let database = getData()
    return database[userID]
}
const depositCash = (id,passport,cashAmount) => {
    const userID = findUserIndex(id);
    const user = userDetails(id)
    const data = getData()
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
    const data = getData()
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
    const { id, passport, cash, credit } = userData
    let data = getData()
    if (userIndex > -1 && id === userID && passport === userPassport ){
        if (withdrawAmount <= cash){
            console.log('update cash. credit should not update');
            let userUpdated = {
                ...userData,
                "cash": cash - withdrawAmount,
            }
            data.splice(userIndex,1,userUpdated)
            fs.writeFileSync(db,JSON.stringify(data))
        } else {
            if (withdrawAmount <= (cash + parseInt(credit)) && withdrawAmount > cash){
                let userUpdated = {
                    ...userData,
                    "cash": 0,
                    "credit": parseInt(credit) - (withdrawAmount - cash)
                }
                data.splice(userIndex,1,userUpdated)
                fs.writeFileSync(db,JSON.stringify(data))
            } else {
                return 'more then user can..'
            }
        }
    } else {
        return 'user Not Found...'
    }
}

const withdrawP2P = (fromUser,toUser,maxWithdraw, amount) => {
    const data = getData()
    const fromUserIndex = findUserIndex(fromUser.id)
    const toUserIndex = findUserIndex(toUser.id)
    const fromUserData = userDetails(fromUser.id)
    const toUserData = userDetails(toUser.id)
    const checkIfValid = ( amount <= maxWithdraw 
        && amount > 0
        && fromUserData.id !== toUserData.id
        && fromUserIndex !== toUserIndex ) ? true : false;
        
    let endMsg = '';

    if (checkIfValid) {
        if (amount <= fromUserData.cash){
            let updatedFromUser = {
                ...fromUserData,
                "cash": fromUserData.cash - amount
            }
            let updatedToUser = {
                ...toUserData,
                "cash": toUserData.cash + amount
            }
            data.splice(fromUserIndex,1,updatedFromUser)
            data.splice(toUserIndex,1,updatedToUser)
            fs.writeFileSync(db,JSON.stringify(data))
            endMsg = `transfer successful! deposite ${amount}$ from ${updatedFromUser.name} to ${updatedToUser.name}`
        } else if (amount > fromUserData.cash && (amount < fromUserData.cash + fromUserData.credit) ){
            const creditAmount = (amount - fromUserData.cash) + fromUserData.credit 
            const isCreditLeft = creditAmount < 0 ? false : true
            if (isCreditLeft){
                let updatedFromUser = {
                    ...fromUserData,
                    "cash": 0,
                    "credit": creditAmount
                }
                let updatedToUser = {
                    ...toUserData,
                    "cash": toUserData.cash + amount
                }
                data.splice(fromUserIndex,1,updatedFromUser)
                data.splice(toUserIndex,1,updatedToUser)
                fs.writeFileSync(db,JSON.stringify(data))
                endMsg = `transfer successful! deposite ${amount}$ from ${updatedFromUser.name} to ${updatedToUser.name}`
            } else {
                endMsg = `${fromUserData.name} don't have enogth money...`
            }
        } else {
            endMsg = 'is not valid...'
        }
    } else {
        endMsg = 'is not valid...'
        // endMsg = `${fromUser.name} don't have enogth money`
    }
    console.log('console.log: ' + endMsg);
    return endMsg
}

module.exports = {
    createNewJSON,
    getData,
    checkCreateNumber,
    createUser,
    userDetails,
    findUserIndex,
    depositCash,
    updateCredit,
    withdrawFromUser,
    withdrawP2P
}