var w;
var act;
var onScheEdit = 0;
var editCmd = 0;
var kM;
function $(id) {
  return document.getElementById(id);
}

function connect() {
  if (typeof Worker === "undefined") {
    console.log("not support Worker");
    return;
  }
  if (typeof w === "undefined") {
    w = new Worker("./worker.js");
    w.onmessage = wkMsg;
  }
  cmd = { URL: document.URL };
  w.postMessage(cmd);
}
function wkMsg(e) {
  if (e.data instanceof Uint8Array) {
    e.data[0] === 0x01 ? showEEPROM(e.data) : 0;
    return;
  }
  var ii;
  for (i in e.data) {
    ii = $(i);
    if (i == "tx" && ii) {
      ii = $("tx");
      str = ii.value;
      str += "\n";
      str += e.data[i];
      ii.value = str;
      ii.scrollTop = ii.scrollHeight;
    } else if (i == "bps" && ii) {
      $("baud").innerHTML = e.data[i];
      var op = $(i).options;
      for (const key in op) {
        if (Object.hasOwnProperty.call(op, key)) {
          const element = op[key];
          if (element.value === e.data[i].toString()) {
            $(i).selectedIndex = parseInt(key);
          }
        }
      }
    } else if (ii) {
      ii.innerHTML = e.data[i];
    } else {
      console.warn(`Key:${i} is unassigned.`);
    }
  }
}
