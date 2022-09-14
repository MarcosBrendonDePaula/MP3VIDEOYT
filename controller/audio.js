const os = require("os")
const fs = require('fs');
const YoutubeMp3Downloader = require("../remake/YoutubeMp3DownloaderMV");

const CacheController = require('./Cache').Get();

(async ()=>{
    if (!fs.existsSync("./public")) {
        fs.mkdirSync("./public")
    }
    if(!fs.existsSync("./public/mp3")){
        fs.mkdirSync("./public/mp3")
    }
})();

var Cache = {
};

const onChangeCache = (cache) => {
    Cache = cache
    // console.log("updated", cache)
}
CacheController.addListner(onChangeCache)

const base_url = process.env.LINKBASE || "http://127.0.0.1:3000"
const remove_timeout = process.env.RTIMEOUT || (10*60000)
const remove_timeout_delay = process.env.RTIMEOUTDELAY || 5000


var pathToFfmpeg = require('ffmpeg-static');
const console = require("console");

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
    setTimeout(async ()=>{
        let  file = Cache[id]
        fs.unlinkSync("./public/mp3/"+file.videoTitle+".mp3");
        CacheController.remObject(id)
    },600000)
}

const download = async(req, res) =>{
    let video_id = req.body.id
    let cache = Cache[video_id]
    if(!cache){
        CacheController.addObject(video_id, {})

        let send = (value)=>{
            res.send(value)
            send = (value)=>{}
        };

        const YD = new YoutubeMp3Downloader({
            "ffmpegPath": pathToFfmpeg,        // FFmpeg binary location
            "outputPath": mp3_local,    // Output file location (default: the home directory)
            "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
            "queueParallelism": os.cpus().length,                  // Download parallelism (default: 1)
            "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
            "allowWebm": false                      // Enable download from WebM sources (default: false)
        })
        
        YD.on("finished",async (err, data)=>{
            data.progress = Cache[video_id].progress
            data.stats = "finished"
            data.file = encodeURI(data.file.replace("./public",base_url))
            CacheController.addObject(video_id, data)
            storage_manipulation(video_id)
        })

        YD.on("progress",async (progress)=>{
            progress.stats = "downloading"
            CacheController.addObject(video_id, progress)
            send(progress)
        })

        YD.on("error", function(error) {
            res.json(error)
        })
        YD.download(video_id);
    }else{
        res.json(cache)
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