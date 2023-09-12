const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const Post = require('../models/post');

// new router
const router = new express.Router();

const auth = require('../middleware/auth');

// helpers
const upload = multer({
    limits: {
        fileSize: 100000000
    }
})

// POST post router
router.post('/posts', auth, async (req, res) => {
    const post = new Post({
        ...req.body,
        user: req.user._id
    })

    try {
        await post.save()
        res.status(201).send(post)
    }
    catch (err) {
        res.status(400).send(err)
    }
})

// add image to post route
router.post('/uploadPostImage/:id', auth, upload.single('upload'), async (req, res) => {
    const post = await Post.findOne({ _id: req.params.id })
    console.log(post)
    if (!post) {
        throw new Error('Cannot find the post')
    }
    const buffer = await sharp(req.file.buffer).resize({ width: 350, height: 350 }).png().toBuffer()
    console.log(buffer)
    post.image = buffer
    await post.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// fetch posts
router.get('/posts', auth, async (req, res) => {
    try {
        const posts = await Post.find({})
        res.send(posts)
    }
    catch (err) {
        res.status(500).send(err)
    }
})

// fetch post image
router.get('/posts/:id/image', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post && !post.image) {
            throw new Error('Post image does not exist')
        }
        res.set('Content-Type', 'image/jpg')
        res.send(post.image)
    }
    catch (err) {
        res.status(404).send(err)
    }
})

module.exports = router;