const cluster = require('cluster')
const os = require('os')

const app = require('./app');


const numCpus = os.cpus().length; 

if (cluster.isMaster){
  for(let i=0; i<numCpus; i++){ 
    cluster.fork()
  }
  
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });

}else{
  
  console.log(`Worker ${process.pid} started`);

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