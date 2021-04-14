const fs = require('fs')
const db = 'database.json'
const faker = require('faker');
const uuid = require('short-uuid');
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
            passport: faker.random.number({max: 499999999}),
            cash: 0,
            credit: 0,
        })
    }
    fs.writeFileSync(db, JSON.stringify(data))
}
const findUserID = id => {
    let database = getData()
    return database.findIndex(users => users.id === id)
} 
const userDetails = id => {
    let userID = findUserID(id)
    let database = getData()
    return database[userID]
}
const depositCash = (id,name,passport,cashAmount) => {
    const userID = findUserID(id);
    const user = userDetails(id)
    const data = getData()
    console.log(userID > -1,user.passport === passport);
    if (userID > -1 && user.passport === passport){
        const updateUser = {
            ...user,
            "cash": user.cash + parseInt(cashAmount)
        }
        data.splice(userID,1,updateUser)
        fs.writeFileSync(db, JSON.stringify(data))
    }
} 
module.exports = {
    createNewJSON,
    getData,
    checkCreateNumber,
    createUser,
    userDetails,
    findUserID,
    depositCash
}