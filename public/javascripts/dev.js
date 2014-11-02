window.onload = function () {

    var messages = [];
    var socket = io.connect(window.location.host );
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    var name = document.getElementById("name");

    var sendPlotButton = document.getElementById("send-plot");
    var plotT = document.getElementById("graph-t-input");
    var plotX = document.getElementById("graph-x-input");

    socket.on('message', function (data) {
        if (data.message) {
            if (!data.message.plot) {
                output(data);
            }else{
                getPlot(data.message);
            }

        } else {
            console.log("There is a problem:", data);
        }
    });

    sendButton.onclick = function () {
        send();
    };

    field.onkeydown = function(e){
        if(e.keyCode === 13){
            send();
        }
        return true;
    };

    sendPlotButton.onclick = function () {
        socket.emit('send', {t: plotT.value, x: plotX.value , plot: true});
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

    function output(data) {
        messages.push(data);
        var html = '';
        html += '<b>' + '>>' + ': </b>';
        html += data.message + '<br />';
        content.innerHTML += html;
    }

    function getPlot(message){
        $('#plot').attr('src', 'images/loader.gif');
        setTimeout(function(){
            $('#plot').attr('src', message.file);
        }, 10000)
    }

};

//var text = 'plot(' + plotT.value + ',' + '); \n';
//text += 'print -deps ' + socket.id + '.png';
//socket.emit('send', {message: text, plot: true});