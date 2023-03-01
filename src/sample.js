
// const my_ws = new WebSocket('ws://localhost:8081');
// my_ws.onopen = function(){
//     console.log('open');
//     // ws.send("hello")
// }
// // my_ws.addEventListener('message', function(event){
// //     console.log('message');
// // })
// my_ws.onclose = function(event){
//     console.log('close');
// }
let http = require('http');
let express = require("express");
let RED = require("node-red");
//Create an Express app
let app = express();
// Add a simple route for static content served from 'public'
app.use("/",express.static("public"));

// Create a server
let server = http.createServer(app);

// Create the settings object - see default settings.js file for other options
let settings = {
  httpAdminRoot:"/red",
  httpNodeRoot: "/api",
  userDir:"C:/Users/luo'xing'yue/.node-red",
  functionGlobalContext: { }    // enables global context
};

// Initialise the runtime with a server and settings
RED.init(server, settings);

// Serve the editor UI from /red
app.use(settings.httpAdminRoot, RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot, RED.httpNode);

server.listen(8001);

setTimeout(
  function(){
    RED.start().then(function(){
      console.info("------ Engine started! ------");
    });
  },
  2000
)




// wsServer.on('connection', function(ws, request){
//   console.log("YES")
// })
// const socketUrl = `ws://localhost:8080`
// let socket = new WebSocket(socketUrl)
// // if("WebSocket" in window){
// //   console.log("hello")
// // }
// socket.onopen = (e) =>{
//   console.log("hello")
// }
// socket.onerror = () =>{
//   console.log("error")
// }
//
// socket.onclose = (e) =>{
//   console.log("close", e)
// }
// console.log(socket)


