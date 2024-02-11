const mongoose = require('mongoose')
const dbConfig = require('../config/db.json')
const logger = require('../config/loggerConfig')

mongoose.connect(dbConfig.uri)
    .then(() => {
        logger.info(`db connected`)
    })
    .catch(err => {
        logger.fatal(err.message)
})