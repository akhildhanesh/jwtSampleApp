const express = require('express')
const router = express.Router()
const { readFileSync } = require('fs')
const { sign } = require('jsonwebtoken')
const privateKey = readFileSync('./keys/secret.key')
const User = require('../db/userModel')
const Admin = require('../db/adminModel')
const bcrypt = require('bcrypt')
const logger = require('../config/loggerConfig')
const client = require('../redis/config')
const { authenticateAdmin } = require('../middleware/authMiddleware')

router.use(express.json())

router.post('/login', async (req, res) => {
    const admin = await Admin.findOne({ username: req.body.username })
    if (!admin) {
        logger.error('Invalid Username')
        return res.status(401).json({
            error: "Wrong Credentails"
        })
    }
    bcrypt.compare(req.body.password, admin.password)
        .then(async result => {
            if (result) {
                let token = sign({
                    name: admin.username,
                    role: 'admin'
                }, privateKey, { algorithm: 'RS256', expiresIn: '1m' })
                await (await client).set(admin.username, token, {
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

router.get('/hi', authenticateAdmin, (req, res) => {
    res.status(200).json({
        message: `Hello ${res.decodedValue.name} : Admin`
    })
})

router.post('/logout', authenticateAdmin, async (req, res) => {
    await (await client).del(res.decodedValue.name)
    res.status(200).json({
        message: `You are logged Out`
    })
})

module.exports = router