const { verify } = require('jsonwebtoken')
const { readFileSync } = require('fs')
const publicKey = readFileSync('./keys/secret.key.pub')
const client = require('../redis/config')
const logger = require('../config/loggerConfig')

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decodedValue = verify(token, publicKey)
        if (!await (await client).get(decodedValue.name)) {
            logger.error(`same token after logged out`)
            return res.status(401).json({
                error: "UnAuthorized"
            })
        }
        logger.info(decodedValue.name, 'acessing:', req.path)
        res.decodedValue = decodedValue
        next()
    } catch (error) {
        logger.error(error.message)
        res.status(401).json({
            error: "UnAuthorized"
        })
    }
}

const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decodedValue = verify(token, publicKey)
        if (!await (await client).get(decodedValue.name)) {
            logger.error(`same token after logged out`)
            return res.status(401).json({
                error: "UnAuthorized"
            })
        }
        logger.info(decodedValue.name, 'acessing:', req.path)
        res.decodedValue = decodedValue
        if (decodedValue.role === 'admin') {
            next()
        } else {
            throw new Error("UnAuthorized")
        }
    } catch (error) {
        logger.error(error.message)
        res.status(401).json({
            error: "UnAuthorized"
        })
    }
}


module.exports = {
    authenticate,
    authenticateAdmin
}