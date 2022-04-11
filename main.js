const cluster = require('cluster')
const os = require('os')

const app = require('./app');


const numCpus = os.cpus().length; 

cluster.on('exit',(worker, code, signal)=>{
  if (!cluster.isMaster){
    console.log(`worker morreu!`)
    console.log("Iniciando novo worker")
    cluster.fork()

    app.listen(app.get('port'), () => {
      console.log(
        `worker ${process.pid} on Port ${app.get(
          'port'
        )} | Environment : ${app.get('env')}`
      );
    });
  }
})

if (cluster.isMaster){
  for(let i=0; i<numCpus; i++){ 
    cluster.fork()
  }
  
}else{
  app.listen(app.get('port'), () => {
    console.log(
      `worker ${process.pid} on Port ${app.get(
        'port'
      )} | Environment : ${app.get('env')}`
    );
  });
}
// app.listen(app.get('port'), () => {
//   console.log(
//     `worker ${process.pid} on Port ${app.get(
//       'port'
//     )} | Environment : ${app.get('env')}`
//   );
// });