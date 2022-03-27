const Express = require('express')
const Router = Express.Router()

const controller = require('../controller/audio')
//https://www.npmjs.com/package/youtube-mp3-downloader
//https://www.npmjs.com/package/node-youtube-music

Router.get("/",controller.Render)
Router.get("/get/:videoId",controller.checkForm,controller.download)
Router.post("/",controller.checkForm,controller.download)

module.exports = Router