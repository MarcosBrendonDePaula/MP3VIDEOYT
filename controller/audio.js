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


const base_url = process.env.LINKBASE || "http://127.0.0.1"
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
    let info;
    let videoUrl = "https://www.youtube.com/watch?v="+req.body.id;
    try {
      info = await ytdl.getInfo(videoUrl, { quality: 'highestaudio'})
    } catch (err){
      res.json(err)
    }

    const videoTitle = sanitize(info.videoDetails.title);
    
    let artist = 'Unknown';
    let title = 'Unknown';

    if (videoTitle.indexOf('-') > -1) {
      let temp = videoTitle.split('-');
      if (temp.length >= 2) {
        artist = temp[0].trim();
        title = temp[1].trim();
      }
    } else {
      title = videoTitle;
    }

    const stream = ytdl.downloadFromInfo(info, { quality: 'highestaudio'});
    
    let size = -20

    stream.on('response', function(httpResponse) {
      size = parseInt((httpResponse.headers['content-range'])?httpResponse.headers['content-range'].split('/')[1]:httpResponse.headers['content-length']);
    })

    stream.on('error', function(err){
      size = -21;
      callback(err, null);
    });

    // waiting stream response
    while(size < -19){
      //check if erro
      if(size == -21){
        return;
      }
      //sleeping
      await new Promise(r => setTimeout(r, 1));
    }

    const audioBitrate = info.formats.find(format => !!format.audioBitrate).audioBitrate
    let outputOptions = [
      '-id3v2_version', '4',
      '-metadata', 'title=' + title,
      '-metadata', 'artist=' + artist
    ];

    const proc = new ffmpeg(stream)
    .audioBitrate(audioBitrate || 192)
    .withAudioCodec('libmp3lame')
    .toFormat('mp3')
    .outputOptions(...outputOptions)
    res.header('Content-Disposition', 'attachment; filename='+encodeURI(info.videoDetails.title)+'.mp3')
    //res.header('Content-Length',`${size}`)
    proc.on("error", (err)=>{
        console.log("Um stream foi cancelado")
    })
    proc.pipe(res)
}

module.exports={
    Render,
    download,
    checkForm,
    direct_download
}