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

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error('The user does not exist')
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    }
    catch (e) {
        res.status(404).send(e)
    }
})

// for following
router.put('/users/:id/follow', auth, async (req, res) => {
    if (req.user.id != req.params.id) {
        try {
            const user = await User.findById(req.params.id)
            if (!user.followers.includes(req.user.id)) {
                await user.updateOne({ $push: { followers: req.user.id } })
                await req.user.updateOne({ $push: { followings: req.params.id } })
                res.status(200).json('User has been followed')
            }
            else {
                res.status(403).json('You already follow this user')
            }
        }
        catch (e) {
            res.status(500).json(e)
        }
    }
    else {
        res.status(403).json('You cannot follow yourself')
    }
})

// for unfollowing
router.put('/users/:id/unfollow', auth, async (req, res) => {
    // params is the person the user is requesting to unfollow
    if (req.user.id != req.params.id) {
        try {
            // user is the user getting unfollowed
            const user = await User.findById(req.params.id)

            // if the person getting unfollowed has the requesting user in their followers list
            if (user.followers.includes(req.user.id)) {
                // remove requesting user from the person getting unfollowed's followers list, and vice versa
                await user.updateOne({ $pull: { followers: req.user.id } })
                await req.user.updateOne({ $pull: { followings: req.params.id } })
                res.status(200).json('User has been unfollowed')
            }
            // not following requested user
            else {
                res.status(403).json('You do not follow this user')
            }
        }
        catch (e) {
            res.status(500).json(e)
        }
    }
    else {
        res.status(403).json('You cannot unfollow yourself')
    }
})

module.exports = router 