var fs = require('fs');
var path = require('path');
var http = require('http');
var express = require('express');

var app = express();
app.set('port', 8989);
app.use(express.static(path.join(__dirname, '.')));

app.get('/', function(req, res) {
    res.send("Hello");
});

app.get('/test', function(req, res) {
    res.send("<html><body><b>Hello Again</b></body></html>");
});

app.get('/visualizations', function(req, res) {
    res.setHeader("Content-type", "text/json; charset=utf-8");
    fs.readdir("visualizations", function(err, files) {
	console.log(files);
	console.log(JSON.stringify(files));
	res.send(JSON.stringify(files));
    });
});

// start the node js server using expess.js for request handling
http.createServer(app).listen(app.get('port'), function() {
    console.log("Server running on", app.get('port'), "...");
});
