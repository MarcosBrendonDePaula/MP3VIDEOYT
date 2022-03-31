const express = require('express');
const handlebars = require ('express-handlebars');
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
var hbs = handlebars.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
      compare_strings: require('./helpers/compare_strings'),
      video_formats: require('./helpers/print_videoFormats')
    }
  });

app.engine('handlebars', hbs.engine)
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