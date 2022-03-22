const express = require('express');
const { engine } = require ('express-handlebars');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require('path');
const app = express();

app.use(logger('tiny'));
app.use(bodyParser.json());

// Handlebars
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')

// Public
app.use(express.static(path.join(__dirname, 'public')))

module.exports = app