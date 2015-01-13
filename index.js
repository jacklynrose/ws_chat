var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8080 }),
    httpServer = require('http').createServer(),
    fs = require('fs'),
    ee = require('events').EventEmitter,
    app = new ee();

app.on("ping", function(sock, data) {
  console.log("ping", data);
  setTimeout(function() {
    sock.send(JSON.stringify({ action: "pong", data: data }));
  }, 1000);
});

httpServer.listen(3000);

httpServer.on("request", function(req, res) {
  fs.readFile("client/index.html", function(err, data) {
    if (err) {
      res.writeHead(500);
      res.end("Problem loading the page...");
    }

    res.writeHead(200);
    res.end(data);
  });
});

wss.on("connection", function(sock) {
  sock.session = {};

  app.emit("connection", sock);

  sock.on("message", function(message) {
    var messageObject = JSON.parse(message),
        action        = messageObject.action,
        data          = messageObject.data;

    app.emit(action, sock, data);
  });
});
