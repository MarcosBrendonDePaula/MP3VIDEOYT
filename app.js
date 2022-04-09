const express = require('express');
const handlebars = require ('express-handlebars');
const bodyParser = require('body-parser');
const cluster = require('cluster')
const logger = require('morgan');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.set('port', PORT);
app.set('env', NODE_ENV);

app.use(logger('tiny'));
app.use(bodyParser.json());

const ytdl = require('ytdl-core');

async function forceLoad(){
  while (true) {
    try{
      await ytdl.getInfo("41tWZlh4SP8")
      return;
    } catch(err) {
      cluster.emit("exit");
    }
  }
  
}

(async()=>{
  await forceLoad()
  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });

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

  // Routes
  require('./routes/routes')(app)

})();




module.exports = app