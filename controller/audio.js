const os = require("os")
const fs = require('fs');
const YoutubeMp3Downloader = require("../remake/YoutubeMp3DownloaderMV");

const ytdl = require('ytdl-core');
const sanitize = require('sanitize-filename');
const ffmpeg = require('fluent-ffmpeg');

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


const base_url = process.env.LINKBASE || "http://127.0.0.1:3000"
const remove_timeout = process.env.RTIMEOUT || (10*60000)
const remove_timeout_delay = process.env.RTIMEOUTDELAY || 5000


var pathToFfmpeg = require('ffmpeg-static');

const mp3_local = "./public/mp3";


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

const direct_download = async (req,res) => {
    let video_id = req.body.id

}

module.exports={
    Render,
    download,
    checkForm,
    direct_download
}