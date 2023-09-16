const express = require('express')
const auth = require('../middleware/auth')
const Notification = require('../models/notification')

const router = new express.Router();

// create new notifications
router.post('/notifications', auth, async (req, res) => {
    const notification = new Notification({
        ...req.body,
        user: req.user._id
    })

    try {
        await notification.save()
        res.status(201).send(notification)
    }
    catch (e) {
        res.status(400).send(e)
    }
})

// retrieve all notifications
router.get('/notifications', async (req, res) => {
    try {
        const notifications = await Notification.find({})
        res.send(notifications)
    }
    catch (e) {
        res.status(500).send(e)
    }
})

// retrieve an user's notifications
router.get('/notifications/:id', async (req, res) => {

    const _id = req.params.id;

    try {
        const notifications = await Notification.find({ notReceiverId: _id })
        res.send(notifications)
    }
    catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router;
