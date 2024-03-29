const cluster = require('cluster')
const os = require('os')
const app = require('./app');

// async function forceLoad(){
//   while (true) {
//     try{
//       await require('ytdl-core').getInfo("41tWZlh4SP8")
//       return;
//     } catch(err) {
//       console.log(err)
//       process.exit()
//     }
//   }
// }

const numCpus = os.cpus().length; 
// require('./controller/Cache').Get()

// app.listen(app.get('port'),async () => {
//   await forceLoad()
//   console.log(
//     `worker ${process.pid} on Port ${app.get(
//       'port'
//     )} | Environment : ${app.get('env')}`
//   );
// });

if (cluster.isMaster){
  
  require('./controller/Cache').Get()

  for(let i=0; i<numCpus; i++){ 
    cluster.fork()
  }
  
  cluster.on("exit", async (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
    await new Promise(r => setTimeout(r, 5000));
  });

} else {
  console.log(`Worker ${process.pid} started`);
  app.listen(app.get('port'),async () => {
    // await forceLoad()
    console.log(
      `worker ${process.pid} on Port ${app.get(
        'port'
      )} | Environment : ${app.get('env')}`
    );
  });
}