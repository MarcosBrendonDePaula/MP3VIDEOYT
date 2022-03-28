"use strict";
const os = require("os")
const fs = require('fs');

const base_url = process.env.LINKBASE || "http://127.0.0.1"
const remove_timeout = process.env.RTIMEOUT || (10*60000)
const remove_timeout_delay = process.env.RTIMEOUTDELAY || 5000

console.log(base_url,remove_timeout,remove_timeout_delay)

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
    
    if(req.params.videoId){
        req.body.id = req.params.videoId
    }

    if(req.body.id == undefined){
        req.body.id = "expected a video id"
        res.status(400).json(req.body)
        return
    }
    next()
}

const storage_manipulation = async (id)=>{
    try{
        while (Cache[id]){
            if(Cache[id].deleting <= 0)
            {
                fs.unlinkSync("./public/mp3/"+Cache[id].videoTitle+".mp3");
                delete Cache[id];
                return;    
            }
            Cache[id].deleting -= remove_timeout_delay
            await new Promise(r => setTimeout(r, remove_timeout_delay));
        }
    }catch(err){
        console.log(err);
        return;
    }
}

const download = async(req, res) =>{
    let video_id = req.body.id
    if(Cache[video_id] == undefined){
        Cache[video_id] = {}
        
        let send = (value)=>{
            res.send(value)
            send = (value)=>{}
        };

        const YD = new YoutubeMp3Downloader({
            "ffmpegPath": pathToFfmpeg,        // FFmpeg binary location
            "outputPath": mp3_local,    // Output file location (default: the home directory)
            "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
            "queueParallelism": os.cpus().length,                  // Download parallelism (default: 1)
            "progressTimeout": 1000,                // Interval in ms for the progress reports (default: 1000)
            "allowWebm": false                      // Enable download from WebM sources (default: false)
        })
        
        YD.on("finished",(err, data)=>{
            data.progress = Cache[video_id].progress
            data.deleting = remove_timeout
            data.stats = "finished"
            data.file = data.file.replace("./public",base_url)
            Cache[video_id] = data
            storage_manipulation(video_id)
        })

        YD.on("progress",(progress)=>{
            progress.stats = "downloading"
            Cache[video_id] = progress;
            send(Cache[video_id])
        })

        YD.on("error", function(error) {
            res.json(error)
        })
        YD.download(video_id);
    }else{
        res.json(Cache[video_id])
    }
}

module.exports={
    Render,
    download,
    checkForm
}