const express = require('express')
const router = express.Router()
const { readFileSync } = require('fs')
const { sign } = require('jsonwebtoken')
const privateKey = readFileSync('./keys/secret.key')
const User = require('../db/userModel')
const bcrypt = require('bcrypt')
const logger = require('../config/loggerConfig')
const client = require('../redis/config')
const { authenticate } = require('../middleware/authMiddleware')

router.use(express.json())

router.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username })
    if (!user) {
        logger.error('Invalid Username')
        return res.status(401).json({
            error: "Wrong Credentails"
        })
    }
    bcrypt.compare(req.body.password, user.password)
        .then(async result => {
            if (result) {
                let token = sign({
                    name: user.username,
                    role: user
                }, privateKey, { algorithm: 'RS256', expiresIn: '1m' })
                await (await client).set(user.username, token, {
                    EX: 60
                })
                res.status(200).json({
                    token
                })
                logger.debug('token Issued', token)
            } else {
                logger.error('Wrong Password')
                res.status(500).json({
                    error: "Wrong Credentails"
                })
            }
        })
        .catch(e => {
            logger.error('ERROR', e.message)
            res.status(500).json({
                error: "Internal Server Error"
            })
        })
})

router.get('/hi', authenticate, (req, res) => {
    res.status(200).json({
        message: `Hello ${res.decodedValue.name}`
    })
})

router.post('/logout', authenticate, async (req, res) => {
    await (await client).del(res.decodedValue.name)
    res.status(200).json({
        message: `You are logged Out`
    })
})

module.exports = router