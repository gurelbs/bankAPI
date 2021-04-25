const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = require('mongoose').Types.ObjectId;
const validator = require('validator');
const faker = require('faker');

const accountSchema = new mongoose.Schema({
    credit: {
        type: Number,
        required: true,
        default: 0,
        validate(value){
            if (value < 0){
                throw new Error('cant set negative number')
            }
        }
    },
    cash: {
        type: Number,
        required: true,
        default: 0,
        validate(value){
            if (value < 0){
                throw new Error('cant set negative number')
            }
        }
    },
    owner:  { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
        validate(value){
            if (!ObjectId.isValid(value)){
                throw new Error('cant find owner id...')
            }
        }
    }
})

const Account = mongoose.model('Account',accountSchema)

module.exports = Account