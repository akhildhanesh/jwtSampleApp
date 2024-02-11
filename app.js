const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080
const appRouter = require('./routers/appRouter')
const adminRouter = require('./routers/adminRouter')
require('dotenv').config()
require('./db/config')
const logger = require('./config/loggerConfig')

app.use('/', appRouter)
app.use('/admin', adminRouter)

app.listen(PORT, () => {
    logger.info(`server started on PORT: ${PORT}`)
})

process.on('SIGINT', () => {
    logger.fatal(`Server Instance Terminated PID: ${process.pid}`)
    setTimeout(() => process.exit(), 100)
})
