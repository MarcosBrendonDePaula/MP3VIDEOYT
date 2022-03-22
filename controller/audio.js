const os = require("os")
const fs = require('fs');

const YoutubeMp3Downloader = require("youtube-mp3-downloader");
var pathToFfmpeg = require('ffmpeg-static');

const mp3_local = "./public/mp3"
(async ()=>{
    if (!fs.existsSync("./public")) {
        fs.mkdirSync("./public")
    }
    if(!fs.existsSync("./public/mp3")){
        fs.mkdirSync("./public/mp3")
    }
})();

const checkForm = async (req,res, next)=>{
    if(!req.body.id){
        req.body.id = "expected a video id"
        res.code(400);
        res.send(req.body)
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
            res.json(JSON.stringify(data))
            console.log(JSON.stringify(data));
        })
        .on("error", function(error) {
            console.log(error);
            res.json(error)
        })
        .download(req.body.id);
        
} 

module.exports={
    basic,
    syncDownload
}