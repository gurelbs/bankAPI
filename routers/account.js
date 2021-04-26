const Account = require('./../modules/account')
const User = require('./../modules/user')

const express = require('express')
const mongoose = require('mongoose')

const router = new express.Router()

router.post('/api/account/create', async (req,res) => {
    try {
        const newAcount = new Account(req.body)
        const user = await User.findById(req.body.owner)
        const updateAccount = await User.findOneAndUpdate(
            {_id: user._id}, 
            {"$push": {"accounts": newAcount._id}},
            { "new": true, "upsert": true });
        if (!user) res.status(404).json('i can`t find this account owner...')
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