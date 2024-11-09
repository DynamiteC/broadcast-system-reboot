import WebSocket from "ws";

const host = "127.0.0.1";
const port = 9001;
const count = 20000;
var i=0;

let interval = setInterval(() => {
  if(i == count) {
    clearInterval(interval);
    return;
  }
  const ws = new WebSocket('ws://' + host + ":" + port);
  console.log("Connecting #" + (i+1));
  ws.id = i+1
  ws.start = (new Date()).getTime();

  ws.on('open', function open() {
    ws.end = (new Date()).getTime();
    var diff = ws.end - ws.start
    console.log("Time taken for #" + ws.id + " - " + diff + " ms");
  });

  ws.on('message', function incoming(data) {
    console.log(data);
  });
  ws.on('error', () => {
    console.log("Hung Up - #" + ws.id);
    i--;
  });
  ws.on('close', () => {
    console.log("Closed #" + ws.id);
    i--;
  })
  i++;
}, 5);
