import { getAccessToken } from "@/utils/authority";
import { Observable } from "rxjs";
import { } from "rxjs/operators";
import { message, notification } from "antd";

let ws: WebSocket | undefined;
let clientWS: WebSocket | undefined;
let count = 0;
const subs = {};
let timer: any = {};
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const initMyWebSocket = () =>{
  clearInterval(timer);
  const uuid = guid();
  const wsUrl = `ws://127.0.0.1:8848/local/ws?type=client&id=` + uuid;
  if(!clientWS) {
    try {
      clientWS = new WebSocket(wsUrl);
      clientWS.onopen = () => {
        console.log("hello")
      };
      clientWS.onclose = () => {
        clientWS = undefined;
        setTimeout(initMyWebSocket, 5000 * count);
      };
      clientWS.onmessage = (msg: any) => {
        console.log("hello -> ", msg)
      }
    } catch (e) {
      setTimeout(initMyWebSocket, 5000 * count);
    }
  }
};
const initWebSocket = () => {
    clearInterval(timer);
    const wsUrl = `${document.location.protocol.replace('http', 'ws')}//${document.location.host}/jetlinks/messaging/${getAccessToken()}?:X_Access_Token=${getAccessToken()}`;
    if (!ws && count < 5) {
        try {
            console.log("wsUrl -> ", wsUrl);
            count += 1;
            ws = new WebSocket(wsUrl);
            ws.onclose = () => {
                ws = undefined;
                setTimeout(initWebSocket, 5000 * count);
            }
            ws.onmessage = (msg: any) => {

                const data = JSON.parse(msg.data);
                if (data.type === 'error') {
                    notification.error({ key: 'wserr', message: data.message });
                }
                if (subs[data.requestId]) {
                    if (data.type === 'complete') {
                        subs[data.requestId].forEach((element: any) => {
                            element.complete();
                        });
                    } else if (data.type === 'result') {
                        subs[data.requestId].forEach((element: any) => {
                            element.next(data)
                        });
                    }
                }
            }
        } catch (error) {
            setTimeout(initWebSocket, 5000 * count);
        }
    }
    timer = setInterval(() => {
        try {
            ws?.send(JSON.stringify({ "type": "ping" }))
        } catch (error) {
            console.error(error, '发送心跳错误');
        }
    }, 2000);
    return ws;
}

const getWebsocket = (id: string, topic: string, parameter: any): Observable<any> =>
    new Observable<any>(subscriber => {
        if (!subs[id]) {
            subs[id] = [];
        }
        subs[id].push({
            next: (val: any) => {
                subscriber.next(val);
            },
            complete: () => {
                subscriber.complete();
            }
        });
        const msg = JSON.stringify({ id, topic, parameter, type: 'sub' });
        const thisWs = initWebSocket();
        const tempQueue: any[] = [];

        if (thisWs) {
            try {
                if (thisWs.readyState === 1) {
                    thisWs.send(msg);
                } else {
                    tempQueue.push(msg);
                }

                if (tempQueue.length > 0 && thisWs.readyState === 1) {
                    tempQueue.forEach((i: any, index: number) => {
                        thisWs.send(i);
                        tempQueue.splice(index, 1);
                    });
                }
            } catch (error) {
                initWebSocket();
                message.error({ key: 'ws', content: 'websocket服务连接失败' });
            }
        }

        return () => {
            const unsub = JSON.stringify({ id, type: "unsub" });
            delete subs[id];
            if (thisWs) {
                thisWs.send(unsub);
            }
        }
    });
export { getWebsocket, initWebSocket, initMyWebSocket };
