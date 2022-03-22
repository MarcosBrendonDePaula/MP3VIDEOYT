const os = require("os")
const fs = require('fs');

const YoutubeMp3Downloader = require("youtube-mp3-downloader");
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

const processando = {

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
    new YoutubeMp3Downloader({
        "ffmpegPath": pathToFfmpeg,        // FFmpeg binary location
        "outputPath": mp3_local,    // Output file location (default: the home directory)
        "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
        "queueParallelism": os.cpus().length,                  // Download parallelism (default: 1)
        "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
        "allowWebm": false                      // Enable download from WebM sources (default: false)
    })
        .on("finished",(err, data)=>{
            data.file = data.file.replace("./public","")
            res.json(data)
        })
        .on("error", function(error) {
            res.status(500).json(error)
            
        })
        .download(req.body.id);
        
} 

const asyncDownload = async(req, res) =>{
    
    if(processando[req.id] == undefined){
        processando[req.body.id] = {}
        new YoutubeMp3Downloader({
            "ffmpegPath": pathToFfmpeg,        // FFmpeg binary location
            "outputPath": mp3_local,    // Output file location (default: the home directory)
            "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
            "queueParallelism": os.cpus().length,                  // Download parallelism (default: 1)
            "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
            "allowWebm": false                      // Enable download from WebM sources (default: false)
        })
        .on("progress",(progress)=>{
            processando[progress.videoId] = progress;
        })
        .on("error", function(error) {
            res.json(error)
        })
        .download(req.body.id);
        res.json(processando[req.body.id])
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