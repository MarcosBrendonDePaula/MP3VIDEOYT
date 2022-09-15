const Express = require('express')
const Router = Express.Router()
const controller = require('../controller/help')

Router.get('/', controller.get)

module.exports = Router