const express = require('express')
const index = require('./index')

module.exports = (app) => {
    app.use(express.json())

    app.use('/', index)

    app.use((req, res, next) => {
        res.status(404).send('This page do not exist');
    });
    
}