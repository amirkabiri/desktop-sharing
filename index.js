const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});
app.get('/desktop/:socket_id', function (req, res) {
    if(desktops[req.params.socket_id] !== undefined){
        res.sendFile(__dirname + '/public/desktop.html');
    }else{
        res.end('desktop not found');
    }
});
app.get('/webcam/:peer_id', function (req, res) {
    if(webcams[req.params.peer_id] !== undefined){
        res.sendFile(__dirname + '/public/webcam.html');
    }else{
        res.end('webcam not found');
    }
});

const desktops = {};
const webcams = {};
io.on('connection', function(socket){
    socket.on('register_desktop', function (peer_id) {
        desktops[socket.id] = peer_id;
    });
    socket.on('register_peer_id', function (peer_id) {
         socket.peer_id = peer_id;
    });
    socket.on('call', function(target_socket_id){
        socket.to(target_socket_id).emit('call', socket.peer_id);
    });
    socket.on('register_webcam', function (peer_id) {
        webcams[peer_id] = socket.id;
    });
    socket.on('disconnect', function(){
        if(desktops[socket.id] !== undefined){
            delete desktops[socket.id];
        }
        if(webcams[socket.peer_id] !== undefined){
            delete webcams[socket.peer_id];
        }
    });
});

http.listen(80, function(){
    console.log('listening on *:80');
});