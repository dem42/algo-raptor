var fs = require('fs');
var http = require('http');
var port = 80;

http.createServer(function(request, response) {
    response.writeHead(200);
    response.end("Hello");
}).listen(port);

console.log("Server running on", port, "...");
