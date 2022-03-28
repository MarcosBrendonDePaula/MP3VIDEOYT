"use strict";
const https = require("https");

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

    const options = {
        hostname: 'content-youtube.googleapis.com',
        port: 443,
        path: `/youtube/v3/videos?id=${video_id}&part=snippet&key=${YT_KEY}`,
        method: 'GET'
    }

    const request = https.request(options,resp=>{
        let json = ""
        
        resp.on('data',d=>{
            json+=d
        })

        resp.on('end', function () {
            if (resp.statusCode === 200) {
                try {
                    json = JSON.parse(json)
                    if(json.items[0]){
                        Info_cahce[video_id] = json.items[0]
                        res.json(Info_cahce[video_id])
                    }else{
                        res.status(400).json({id:"id not found"})
                    }
                        
                } catch (error) {
                    res.status(500).json(error)
                }
            } else {
                res.status(500).send("err")
            }
        })
    })

    request.on('error', err=>{
        res.status(500).json(err)
    })

    request.end()
};

module.exports= {
    checkForm,
    getInfo,
    Render
}