const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('home')
})

router.get('/teste', (req, res) => {
    res.send('ola')
})

module.exports = router