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

const Render = (req,res) => {
    res.render("audio/list",{quee:Cache})
}

const checkForm = async (req,res, next)=>{
    console.log(req.body)
    if(req.body.id == undefined){
        req.body.id = "expected a video id"
        res.status(400).send(req.body)
        return
    }
    next()
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
        
        let send = (value)=>{
            res.send(value)
            send = (value)=>{}
        };

        const YD = new YoutubeMp3Downloader({
            "ffmpegPath": pathToFfmpeg,        // FFmpeg binary location
            "outputPath": mp3_local,    // Output file location (default: the home directory)
            "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
            "queueParallelism": os.cpus().length,                  // Download parallelism (default: 1)
            "progressTimeout": 200,                // Interval in ms for the progress reports (default: 1000)
            "allowWebm": false                      // Enable download from WebM sources (default: false)
        })
        
        YD.on("finished",(err, data)=>{
            data.progress = Cache[req.body.id].progress
            data.stats = "finished"
            data.file = data.file.replace("./public","")
            Cache[req.body.id] = data
        })

        YD.on("progress",(progress)=>{
            progress.stats = "downloading"
            Cache[progress.videoId] = progress;
            send(Cache[progress.videoId])
        })
        YD.on("error", function(error) {
            res.json(error)
        })
        YD.download(req.body.id);
    }else{
        res.json(Cache[req.body.id])
    }
}

module.exports={
    Render,
    syncDownload,
    asyncDownload,
    checkForm
}