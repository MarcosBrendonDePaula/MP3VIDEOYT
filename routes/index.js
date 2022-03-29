const express = require('express')
const router = express.Router()
const ytdl = require('ytdl-core')
const fs = require('fs')

router.get('/', (req, res) => {
    res.render('home')
})

//TESTANDO

const stream = require('stream');
const cp = require('child_process');
const ffmpeg = require('ffmpeg-static');
const ytmux = (link, marcos, options = {}) => {
    const result = new stream.PassThrough({ highWaterMark: options.highWaterMark || 1024 * 512 });
    console.log(marcos)
    ytdl.getInfo(link, options).then(info => {                            //Aqui que define a resolução no caso o highest é a melhor disponivel no video
        audioStream = ytdl.downloadFromInfo(info, { ...options, quality: 'highestaudio' });
        videoStream = ytdl.downloadFromInfo(info, { ...options, quality: marcos });
        let ffmpegProcess = cp.spawn(ffmpeg, [
            '-loglevel', '8', '-hide_banner',
            '-i', 'pipe:3', '-i', 'pipe:4',
            '-map', '0:a', '-map', '1:v',
            '-c', 'copy',
            '-f', 'matroska', 'pipe:5'
        ], {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe', 'pipe', 'pipe'
            ]
        });
        audioStream.pipe(ffmpegProcess.stdio[3]);
        videoStream.pipe(ffmpegProcess.stdio[4]);
        ffmpegProcess.stdio[5].pipe(result);
    });
    return result;
};


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

router.post('/download/:id/format', (req, res) => {
    const info = ytdl.getInfo(req.params.id)
    
    info.then(info => {
        let format = ytdl.chooseFormat(info.formats, { quality: req.body.itag})
        res.header('Content-Disposition', 'attachment; filename='+info.videoDetails.title+'.mp4')
        ytmux("https://www.youtube.com/watch?v="+req.params.id, req.body.itag).pipe(res)
    })
    
})

module.exports = router