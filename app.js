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

// Routes
require('./routes/routes')(app)

module.exports = app