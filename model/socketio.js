var io = require('socket.io');

function socketio(){
    this.prototype = io;
    this.listen = function(server){
        var socketServer =  this.prototype.listen(server);
        socketServer.sockets.on('connection', function (socket) {
            socket.emit('message', { message: 'welcome to the chat' });
            socket.on('send', function (data) {
                socketServer.sockets.emit('message', data);
            });
        });
        return socketServer;
    };
    return this;
}


module.exports = socketio();