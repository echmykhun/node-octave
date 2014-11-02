var fs = require('fs');
var exec = require('child_process').exec;


var octave = {
    title: 'GNU OCTAVE ONLINE',
    output: {},
    input: {},
    sessions: {},
    sendOutput: {},
    functionInput: {},
    userFunctionInput: {},
    userFunctions: {},
    currUserFunction: {},
    bachChannel: {},
    plotExt: '.png',
    startSession: function (sessionId, outputfunc) {

        var _this = this;
        var sessId = 's' + sessionId.replace('-', '');

        //var terminal = exec('octave');
        var terminal = exec('octave', function (error, stdout, stderr) {

        });

        //horrible decision but cannot see other options to save session in case of error for now
        //have too keep looking!! For now this piece of .... will do

        terminal.stderr.on('data', function (data) {

            console.log(data);

            _this.output[sessionId].push(data);

            _this.input[sessionId][_this.input[sessionId].length - 1].error = true;

            outputfunc(sessionId, data);

            delete _this.sessions[sessionId];

            _this.startSession(sessionId, outputfunc);
            _this.sendOutput[sessionId] = false;

            for (var i = 0; i < _this.input[sessionId].length - 1; i++) {
                if (!_this.input[sessionId][i].error) {
                    _this.sessions[sessionId].console.stdin.write(_this.input[sessionId][i].data + " \n");
                }
            }

        });

        terminal.stdout.on('data', function (data) {
            if (_this.sendOutput[sessionId]) {
                _this.output[sessionId].push(data);
                outputfunc(sessionId, data);
            }

        });

        _this.sessions[sessionId] = {
            console: terminal
        };

        _this.bachChannel = outputfunc;
        _this.output[sessionId] = _this.output[sessionId] || [];
        _this.input[sessionId] = _this.input[sessionId] || [];
        _this.sendOutput[sessionId] = _this.sendOutput[sessionId] || true;
        _this.userFunctionInput[sessionId] = _this.userFunctionInput[sessionId] || [];
        _this.userFunctions[sessionId] = _this.userFunctions[sessionId] || [];
        _this.currUserFunction[sessionId] = _this.currUserFunction[sessionId] || '';

    },

    inputData: function (sessionId, inputData ) {

        var sessId = 's' + sessionId.replace('-', '');

        if (inputData.plot) {


            if (!inputData.t || !inputData.x) {
                this.bachChannel(sessionId, 'wrong input');
                return
            }
            var path = appRoot + '/public/images/octave/' + sessId + this.plotExt;
            var webPath = '/images/octave/' + sessId + this.plotExt;
            this.sessions[sessionId].console.stdin.write('plot(' + inputData.t + ', ' + inputData.x + ') \n');
            this.sessions[sessionId].console.stdin.write('print -dpng ' + path + ' \n');
            this.bachChannel(sessionId, {file: webPath, plot: true});

            return
        }

        var input = inputData.message;
        this.sendOutput[sessionId] = true;

        if(/print/.test(input) || /plot/.test(input)){
            this.bachChannel(sessionId, 'use built in tool for graphics');
            return
        }

        if(/^function\s/.test(input)){
            this.functionInput[sessionId] = true;

            var funcName = input.replace(/^function\s/, '').split('=')[1].split('(')[0].trim();

            input = input.replace(/\s+/g, '');
            input = input.replace(/^function/, 'function ');
            var pattern = funcName + "\\(";
            input = input.replace(RegExp(pattern), sessId + funcName + "(");
            this.userFunctionInput[sessionId].push(input);
            this.userFunctions[sessionId].push(funcName);
            this.currUserFunction[sessionId] = funcName;

            return

        } else if(/^endfunction\s*/.test(input)){


            var _this = this;
            input = input.replace(/\s+/g, '');
            this.userFunctionInput[sessionId].push(input);

            var fileName = sessId + this.currUserFunction[sessionId] + '.m';
            fs.writeFile(fileName, this.userFunctionInput[sessionId].join("\n"), function(err) {
                if(err) {
                    console.log(err);
                }
                _this.sessions[sessionId].console.stdin.write('source"' + fileName + '" \n');
            });


            this.functionInput[sessionId] = false;
            this.userFunctionInput[sessionId] = [];
            this.currUserFunction[sessionId] = '';

            return
        }

        input = input.replace(/\s/g, '');

        if(this.userFunctions[sessionId]){
            for(var i in this.userFunctions[sessionId]){
                var func = this.userFunctions[sessionId][i];
                var pattern = func + "\\(";
                input = input.replace(RegExp(pattern), sessId + func + '(');
                pattern = "'" + func + "'";
                input = input.replace(RegExp(pattern), "'" + sessId + func + "'");
                pattern = '"' + func + '"';
                input = input.replace(RegExp(pattern), '"' + sessId + func + '"');
            }
        }


        if (!this.functionInput[sessionId]) {
            this.userFunctionInput[sessionId] = [];
            this.input[sessionId].push({error: false, data: input});
            this.sessions[sessionId].console.stdin.write(input + " \n");
        }else{
            this.userFunctionInput[sessionId].push(input);
        }


    },
    endSession: function (sessionId) {
        this.sessions[sessionId].console.stdin.end();

        delete this.output[sessionId];
        delete this.input[sessionId];
        delete this.sessions[sessionId];
        delete this.sendOutput[sessionId];
        delete this.functionInput[sessionId];
        delete this.userFunctionInput[sessionId];

    }


};

module.exports = octave;