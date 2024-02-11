const { createClient } = require('redis')
const logger = require('../config/loggerConfig')

const client = createClient()
    .on('error', err => logger.error('Redis Client Error', err.message))
    .on('connect', () => {
        logger.info(`Redis Connected`)
    })

module.exports = client.connect()