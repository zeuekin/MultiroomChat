//This is the entrance of multi-room chat app
//This is also the entrance of other apps afliated the chatroom

var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

var cache = {};

function send404(response) {
    response.writeHead(404, 
                       {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(200, 
                       {"Content-Type": mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}

//static server
function serverStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function(exists) {
            if (exists) {
                fs.readFile(absPath, function(err, data) {
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                send404(response);
            }
        });
    }
}

//create http server
var server = http.createServer(function(request, response) {
    var filePath = false;

    if (request.url == '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + request.url;
    }

    var absPath = './' + filePath;
    serverStatic(response, cache, absPath);
})

server.listen(3000, function() {
    console.log("Http server listening on port 3000.");
})

//start Socket.IO server sharing port with http server
var chatServer = require('./lib/chat_server');
chatServer.listen(server);
//start simple tcp chat server
var chatTcpServer = require('./lib/chat_tcpserver');
chatTcpServer.start();