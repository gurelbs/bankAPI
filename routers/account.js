const Account = require('./../modules/account')
const User = require('./../modules/user')

const express = require('express')
const mongoose = require('mongoose')

const router = new express.Router()
const pathName = process.env.NODE_ENV === "development"
    ? '/api/account/create'
    : 'user/api/account/create'
router.post(pathName, async (req,res) => {
    try {
        const user = await User.findOne({_id: req.body.owner})
        if (!user) res.status(404).json('i can`t find this account owner...')
        const newAcount = new Account(req.body)
        const updateAccount = await User.findOneAndUpdate(
            {_id: user._id}, 
            {"$push": {"accounts": newAcount._id}},
            { "new": true, "upsert": true });
        if (updateAccount){
            try {
                res.status(201).json(`hey ${user.name}, your account created!. this is your accout number: ${newAcount._id}`)
            } catch (e) {
                res.status(500).json(`there is some error ${e}`)
            }
        } else {
            res.status(500).json('cant update user...')
        }
    } catch (e) {
        res.status(500).json(`there is some error ${e}`)
    }
})


module.exports = router