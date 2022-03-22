const app = require('./app');

// Routes
require('./routes/routes')(app)

app.listen(app.get('port'), () => {
  console.log(
    `Express Server started on Port ${app.get(
      'port'
    )} | Environment : ${app.get('env')}`
  );
});