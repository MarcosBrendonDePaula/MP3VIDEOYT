const express = require('express')
const router = express.Router()


router.get('/', (req, res) => {
    res.render('home', {title: 'MP3VIDEOYT'})
})



module.exports = router