"use strict";
const ytdl = require('ytdl-core')

const YT_KEY = process.env.YTKEY || "AIzaSyBBNRRlenbcURj_WMmQjzIZHAMYlx5OfeA"; 

const Info_cahce = {}

const checkForm = async (req,res,next) =>{
    if(req.params.videoId){
        req.body.id = req.params.videoId 
    }
    if(!req.body.id){
        req.body.id = "expected a video id"
        res.status(400).json(req.body)
        return; 
    }
    next()
}

const Render = async(req,res)=>{

};

const getInfo = async(req,res)=>{
    let video_id = req.body.id
    
    if(Info_cahce[video_id]){
        res.json(Info_cahce[video_id])
        return
    }

    let url = video_id
    if(url.indexOf("https://") == -1) {
        url = `https://www.youtube.com/watch?v=${url}`
    }

    const id = ytdl.getURLVideoID(url)
    let inf = await ytdl.getInfo(id)
    
    let response = {
        "Details":inf.videoDetails,
        "Formats": {
            video:[],
            audio:[
            {
                link:`/audio/get/${id}`,
                mimeType:"application/json",
                responseType:"json"
            }]
        }
    }

    for(let format of inf.formats) {
        if(format.container == 'mp4'){
            response.Formats.video.push({
                link:`/video/get/${id}/${format.itag}`,
                resolution: format.height,
                mimeType: format.mimeType,
                appLength: format.contentLength,
                responseType: "mp4"
            })
        }
    }
    Info_cahce[video_id] = response
    res.json(response)
};

module.exports= {
    checkForm,
    getInfo,
    Render
}