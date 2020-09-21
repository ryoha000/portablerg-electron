"use strict";

module.exports.setupWebSocketServer = (port) => {
  const WebSocketServer = require('ws').Server;
  const wsServer = new WebSocketServer({ port: port });
  const offers = []
  wsServer.on('connection', function(ws) {
    console.log('-- websocket connected --');
    ws.on('message', function(message) {
      const m = JSON.parse(message)
      if (m.type === 'offer') {
        offers.push(m)
        console.log('received offer websocket')
        console.log(`id = ${m.id}`)
        return
      }
      if (m.type === 'connect') {
        console.log('received connect websocket')
        console.log(`id = ${m.id}`)
        const offer = offers.find(v => v.id === m.id)
        if (!offer) {
          console.log('offer is not found')
          return
        }
        wsServer.clients.forEach(function each(client) {
          if (isSame(ws, client)) {
            client.send(JSON.stringify(offer))
          }
        });
        return
      }
      wsServer.clients.forEach(function each(client) {
        if (!isSame(ws, client)) {
          client.send(message);
        }
      });
    });
  });
  function isSame(ws1, ws2) {
    // -- compare object --
    return (ws1 === ws2);
  }
  console.log('websocket server start. port=' + port);
}

module.exports.setupClientServer = (port) => {
  const http = require("http");
  const fs = require('fs');
  const path = require('path')

  const server = http.createServer(function (req, res) {
    const index = path.join(__dirname, '../public/index.html')
    switch (req.url) {
      case '/':
        fs.readFile(index, (err, data) => {
          if (!err) {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(data);
          }
        });
        break
      default:
        const url = path.join(__dirname, '../public', req.url)
        fs.readFile(url, (err, data) => {
          if (!err) {
            res.writeHead(200, {"Content-Type": getType(url)});
            res.end(data);
          }
        });
        break
    }
  });
  server.listen(port, () => {
    console.log(`Server running at port: ${port}`);
  });
}

function getType(_url) {
  var types = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "svg+xml"
  }
  for (var key in types) {
    if (_url.endsWith(key)) {
      return types[key];
    }
  }
  return "text/plain";
}
