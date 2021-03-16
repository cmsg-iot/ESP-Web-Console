var ws = undefined;
var argv = {};
function WSOn(e) {
  console.log("websocket connected");
}
function WSCe(e) {
  ws.close();
  ws = undefined;
  console.log("connection lost\r\nreconnect...");
  newWS(argv["wsStr"]);
}
function WSMsg(e) {
  if (e.data instanceof Blob) {
    new Response(e.data).arrayBuffer().then(function (buffer) {
      arr = new Uint8Array(buffer);
      self.postMessage(arr);
    });
    return;
  }
  if (e.data === undefined || e.data.indexOf('{"') != 0) {
    return;
  }
  jsData = JSON.parse(e.data);
  self.postMessage(jsData);
}
function WSErr(e) {
  console.log(e.data);
}
function newWS(str) {
  argv["wsStr"] = str;
  console.log("Connect: " + argv["wsStr"]);
  ws = new WebSocket(argv["wsStr"]);
  if (ws) {
    ws.onopen = WSOn;
    ws.onclose = WSCe;
    ws.onmessage = WSMsg;
    ws.onerror = WSErr;
  }
  return ws;
}

function wkMsg(e) {
  for (i in e.data) {
    switch (i) {
      case "URL":
        argv["url"] = e.data["URL"];
        break;
      case "SENDCMD":
        ws.send(e.data["SENDCMD"]);
        break;
      default:
        break;
    }
  }
}

function stage1() {
  console.log(argv["url"]);
  if (argv["url"] !== undefined) {
    if (ws === undefined) {
      ws = newWS(
        argv["url"].indexOf("http://") != -1
          ? argv["url"].replace("http://", "ws://")
          : "ws://10.10.10.10/"
      );
      if (ws) {
        f = stage2;
      }
    }
  }
  setTimeout("f()", 500);
}

function stage2() {
  if (ws.readyState == 1) {
    ws.send("RSSI?");
  }
  self.postMessage({ RSSI: "<---->" });
  setTimeout("f()", 5000);
}
onmessage = wkMsg;
f = stage1;
f();
