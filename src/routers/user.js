const express = require('express');
const User = require('../models/user');
const multer = require('multer');
const sharp = require('sharp');
const auth = require('../middleware/auth')

// original router
const router = new express.Router();

// helpers
const upload = multer({
    limits: {
        fileSize: 100000000
    }
})

// create new user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        res.status(201).send(user)
    }
    catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

// fetch user

router.get('/users', async (req, res) => {

    try {
        const users = await User.find({})
        res.send(users)
    }
    catch (e) {
        res.status(500).send()
    }
})

// login user router
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    }
    catch (e) {
        res.status(500).send(e)
    }
})

// delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return res.status(400).send()
        }

        res.send()
    }
    catch (e) {
        res.status(500).send(e)
    }
})

// fetch a single user
router.get('/users/:id', async (req, res) => {
    try {
        const _id = req.params.id

        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    }
    catch (e) {
        res.status(500).send(e)
    }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    if (req.user.avatar != null) {
        req.user.avatar = null
    }
    req.user.avatar = buffer
    req.user.avatarExists = true
    // await req.user.save()
    // console.log(req.user.avatar)
    res.send(buffer)

}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

module.exports = router 