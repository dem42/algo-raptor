var fs = require('fs');
var path = require('path');
var http = require('http');
var express = require('express');
var _ = require('underscore');

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
	var myset = Object.create(null);
	_.each(files, function(f) { myset[f.replace("~","").replace(".js","").replace(".css", "")] = true });
	var filtered_files = [];
	for (file in myset) {
	    filtered_files.push(file);
	}
	
	console.log(filtered_files);
	console.log(JSON.stringify(filtered_files));
	res.send(JSON.stringify(filtered_files));
    });
});

// start the node js server using expess.js for request handling
http.createServer(app).listen(app.get('port'), function() {
    console.log("Server running on", app.get('port'), "...");
});
