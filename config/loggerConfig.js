const log4j = require('log4js')
require('dotenv').config()
const level = process.env.ENV || 'debug'

log4j.configure(require('./log4j.json'))

const logger = log4j.getLogger("dev")

module.exports = logger