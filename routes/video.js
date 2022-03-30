const Express = require('express')
const Router = Express.Router()
const controller = require('../controller/video')

Router.get('/view', controller.Render)
Router.post('/view', controller.Render)
Router.get('/view/:id', controller.Render)
//Download post
Router.post('/', controller.downloadSpecific)
//parte da api
Router.get('/get/:id', controller.downloadBest)
Router.get('/get/:id/:format', controller.downloadSpecific)
Router.post('/get/:id/format', controller.downloadSpecific)



module.exports = Router