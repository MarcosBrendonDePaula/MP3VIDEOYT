const os = require("os")
const fs = require('fs');

const YoutubeMp3Downloader = require("../remake/YoutubeMp3DownloaderMV");
var pathToFfmpeg = require('ffmpeg-static');

const mp3_local = "./public/mp3";
(async ()=>{
    if (!fs.existsSync("./public")) {
        fs.mkdirSync("./public")
    }
    if(!fs.existsSync("./public/mp3")){
        fs.mkdirSync("./public/mp3")
    }
})();

const Cache = {

};

const checkForm = async (req,res, next)=>{
    if(req.body.id == undefined){
        req.body.id = "expected a video id"
        res.status(400).send(req.body)
        return
    }
    next()
}

const basic = async (req,res) => {

}

const syncDownload = async (req,res) =>{
    let video_id = req.body.id
    if(Cache[video_id]){
        res.send(Cache[video_id])
        return;
    }

    const YD = new YoutubeMp3Downloader({
        "ffmpegPath": pathToFfmpeg,
        "outputPath": mp3_local,
        "youtubeVideoQuality": "highestaudio", 
        "queueParallelism": os.cpus().length,             
        "allowWebm": false
    })
    YD.on("finished",(err, data)=>{
        data.file = data.file.replace("./public","")
        Cache[video_id] = data
        res.json(data)
    })
    YD.on("error", function(error) {
        res.status(500)
        res.json(error)
    })
    YD.download(video_id);
} 

const asyncDownload = async(req, res) =>{
    if(Cache[req.body.id] == undefined){
        Cache[req.body.id] = {}
        const YD = new YoutubeMp3Downloader({
            "ffmpegPath": pathToFfmpeg,        // FFmpeg binary location
            "outputPath": mp3_local,    // Output file location (default: the home directory)
            "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
            "queueParallelism": os.cpus().length,                  // Download parallelism (default: 1)
            "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
            "allowWebm": false                      // Enable download from WebM sources (default: false)
        })
        YD.on("progress",(progress)=>{
            progress.estimative = ((progress.length / progress.speed)/60)
            Cache[progress.videoId] = progress;
            console.log(progress)
        })
        YD.on("error", function(error) {
            res.json(error)
        })
        YD.download(req.body.id);
        res.json(Cache[req.body.id])
    }else{
        res.json(req.body.id)
    }
}

module.exports={
    basic,
    syncDownload,
    asyncDownload,
    checkForm
}