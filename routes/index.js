const express = require('express')
const router = express.Router()
const ytdl = require('ytdl-core')
const fs = require('fs')

router.get('/', (req, res) => {
    res.render('home')
})

//TESTANDO

router.post('/video', (req, res) => {
    const url = req.body.testando

    if (url.length > 0) {
        
        const id = ytdl.getURLVideoID(url)

        const teste = ytdl.getInfo(id)

        teste.then(test => {
            // console.log(test.formats)
            // ytdl(url).pipe(fs.createWriteStream(test.videoDetails.title + '.mp4'))
            res.render('home', {video: test})
        })
    }else{
        res.render('home')
    }
})

router.get('/download/:id', (req, res) => {
    const teste = ytdl.getInfo(req.params.id)
    teste.then(test => {
        res.header('Content-Disposition', 'attachment; filename='+test.videoDetails.title+'.mp4')
        ytdl(req.params.id, {format: 'mp4'}).pipe(res)
    })
    
})

module.exports = router