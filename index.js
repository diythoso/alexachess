var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
var port = process.env.PORT || 3000;
var io = require('socket.io')(http);

http.listen(port, function () {
    console.log('Server listening at port %d', port);
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/default.html');
});

io.on('connection', function (socket) {
    socket.on('new_message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });
});