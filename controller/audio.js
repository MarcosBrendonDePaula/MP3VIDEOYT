const os = require("os")
const fs = require('fs');
const cluster = require('cluster')
const YoutubeMp3Downloader = require("../remake/YoutubeMp3DownloaderMV");

const redis = require('redis');
let client = redis.createClient({
    password:"RcYKFz0MxXXjDBqBdkQQ8yZJS2Uz3miI",
    port: 17680,
    url:"redis://:RcYKFz0MxXXjDBqBdkQQ8yZJS2Uz3miI@redis-17680.c74.us-east-1-4.ec2.cloud.redislabs.com:17680"
});

(async ()=>{
    client.on('connect', () => {
        console.log('REDIS READY');
        if(cluster.isMaster){
            client.flushAll('ASYNC', ()=>{});
        }
    });
    
    client.on('error', (e) => {
        console.log('REDIS ERROR', e);
    });
    
    await client.connect()

    if (!fs.existsSync("./public")) {
        fs.mkdirSync("./public")
    }
    if(!fs.existsSync("./public/mp3")){
        fs.mkdirSync("./public/mp3")
    }
})();

async function getCache(id=""){
    let res = await client.get(id)
    if(!res) return null;
    return JSON.parse(await client.get(id))
}

async function setCache(id="",obj={}){
    await client.set(id,JSON.stringify(obj))
}

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
    setTimeout(async ()=>{
        let  file = await client.get(id)
        fs.unlinkSync("./public/mp3/"+file.videoTitle+".mp3");
        await client.del(id)
    },600000)
}

const download = async(req, res) =>{
    let video_id = req.body.id
    let cache = await getCache(video_id)
    if(!cache){
        await setCache(video_id,{})

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
            data.progress = (await getCache(video_id)).progress
            data.stats = "finished"
            data.file = encodeURI(data.file.replace("./public",base_url))
            await setCache(video_id,data)
            storage_manipulation(video_id)
        })

        YD.on("progress",async (progress)=>{
            progress.stats = "downloading"
            await setCache(video_id,progress)
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