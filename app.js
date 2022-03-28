const express = require('express');
const { engine } = require ('express-handlebars');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.set('port', PORT);
app.set('env', NODE_ENV);

app.use(logger('tiny'));
app.use(bodyParser.json());

// Handlebars
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')

// Public
app.use(express.static(path.join(__dirname, 'public')))

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});


// Routes
require('./routes/routes')(app)

module.exports = app