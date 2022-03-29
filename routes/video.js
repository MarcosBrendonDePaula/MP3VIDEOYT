const Express = require('express')
const Router = Express.Router()
const controller = require('../controller/video')

Router.post('/', controller.get)
Router.get('/get/:id', controller.downloadBest)
Router.post('/get/:id/format', controller.downloadSpecific)


module.exports = Router