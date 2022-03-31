const ytdl = require('ytdl-core')
const fs = require('fs')
//TESTANDO

const stream = require('stream');
const cp = require('child_process');
const ffmpeg = require('ffmpeg-static');
const base_url = process.env.LINKBASE || "http://127.0.0.1:3000"

(async()=>{
    ytdl.getVideoID("EG8VoodMIBM")
})()

const ytmux = (link, marcos, options = {}) => {
    const result = new stream.PassThrough({ highWaterMark: options.highWaterMark || 1024 * 512 });
    ytdl.getInfo(link, options).then(info => {                            //Aqui que define a resolução no caso o highest é a melhor disponivel no video
        audioStream = ytdl.downloadFromInfo(info, { ...options, quality: 'highestaudio' });
        videoStream = ytdl.downloadFromInfo(info, { ...options, quality: marcos });
        let ffmpegProcess = cp.spawn(ffmpeg, [
            '-loglevel', '8', '-hide_banner',
            '-i', 'pipe:3', '-i', 'pipe:4',
            '-map', '0:a', '-map', '1:v',
            '-c', 'copy',
            '-f', 'matroska', 'pipe:5',
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

const get = async (req, res) => {
}

const Render = async (req, res) => {
    let url = req.params.id || req.body.id
    
    if (url && url.length > 0) {
        
        if(url.indexOf("https://") == -1) {
            url = `https://www.youtube.com/watch?v=${url}`
        }
 
        const id = ytdl.getURLVideoID(url)
        
        ytdl.getInfo(id).then(info =>{
            // console.log(info.formats)
            res.render('home', {video: info, title: info.videoDetails.title})
        })

    }else{
        res.render('home', {title: 'MP3VIDEOYT'})
    }
}

const downloadBest = (req, res) => {
    const teste = ytdl.getInfo(req.params.id)
    teste.then(test => {
        res.header('Content-Disposition', 'attachment; filename='+test.videoDetails.title+'.mp4')
        ytdl(req.params.id, {format: 'mp4'}).pipe(res)
    })
}

const downloadSpecific = async (req, res) => {
    let url = req.params.id || req.body.id
    let format = req.params.format || req.body.itag

    if (url && url.length > 0) {
        
        if(url.indexOf("https://") == -1) {
            url = `https://www.youtube.com/watch?v=${url}`
        }
 
        const id = ytdl.getURLVideoID(url)
        ytdl.getInfo(id).then((teste) =>{
            res.header('Content-Disposition', 'attachment; filename='+encodeURI(teste.videoDetails.title)+'.mp4')
            ytmux("https://www.youtube.com/watch?v="+id, format).pipe(res)
        })
    }
    
}

module.exports = {
    Render,
    get,
    downloadBest,
    downloadSpecific,
}