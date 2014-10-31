window.onload = function () {

    var messages = [];
    var socket = io.connect(window.location.host );
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    var name = document.getElementById("name");

    socket.on('message', function (data) {
        if (data.message) {
            messages.push(data);
            var html = '';
            html += '<b>' + '>>' + ': </b>';
            html += data.message + '<br />';
            content.innerHTML += html;
        } else {
            console.log("There is a problem:", data);
        }
    });

    sendButton.onclick = function () {
        send()
    };

    field.onkeydown = function(e){
        if(e.keyCode === 13){
            send();
        }
        return true;
    };

    function send(){
        var text = field.value;
        var html = '';
        html += '<b>' + '<<' + ': </b>';
        html += text + '<br />';
        content.innerHTML += html;
        socket.emit('send', {message: text});
        field.value = '';
    }

};