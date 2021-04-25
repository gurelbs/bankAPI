const mongoose = require('mongoose')
const validator = require('validator');
const faker = require('faker');
const ObjectId = require('mongoose').Types.ObjectId;
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    id: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        validate(v){
            if (!validator.isEmail(v)) {
                throw new Error('is not a valid email!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(v){
            if (v.length < 6){
                throw new Error('your password is to short!')
            }
        }
    },
    accounts: {
        type: [Schema.Types.ObjectId],
        default: []
    }
})

const User = mongoose.model('User',userSchema)

module.exports = User