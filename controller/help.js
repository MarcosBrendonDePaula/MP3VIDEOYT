const os = require("os")
const base_url = process.env.LINKBASE || "http://127.0.0.1:3000"

const helper = {
    
    methods:{
        ad:"await to download",
        sd:"stram download"
    },

    download:{
        get: {
            mp3 : {
                method: "ad",
                field: "file",
                url: base_url + "/audio/get/{vid}"
            },
            
            video: {
                method: "sd",
                field: undefined,
                url: base_url + "/video/get/{vid}/{format}",
            }
        },
    },
}

const get = (req, res)=>{
    res.json(helper)
}

module.exports={
    get
}