const express = require('express')
const index = require('./index')
const audio = require('./audio')
const info = require('./info')
const video = require('./video')
const help = require('./help')
module.exports = (app) => {
    
    

    app.use(express.json())

    app.use('/', index)
    app.use('/audio', audio)
    app.use('/info', info)
    app.use('/video', video)
    app.use('/help', help)
    app.use((req, res, next) => {
        res.status(404).send('This page do not exist');
    });
    
}