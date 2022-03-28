const Express = require('express')
const Router = Express.Router()

const controller = require('../controller/info')
//https://www.npmjs.com/package/youtube-mp3-downloader
//https://www.npmjs.com/package/node-youtube-music

Router.get("/",controller.Render)
Router.get("/get/:videoId",controller.checkForm,controller.getInfo)
Router.post("/",controller.checkForm,controller.getInfo)

module.exports = Router