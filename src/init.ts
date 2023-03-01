


import { webSocket } from "rxjs/internal-compatibility";

export class init{
  hello(){
    const socketUrl = `ws://localhost:8001`
    const socket = webSocket(socketUrl)

    console.log(socket)
  }
}

