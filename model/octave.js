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
    startSession: function (sessionId, outputfunc) {

        var _this = this;
        var sessId = sessionId.replace('-', '');

        //var terminal = exec('octave');
        var terminal = exec('octave', function (error, stdout, stderr) {

        });

        //horrible decision but cannot see other options to save session in case of error for now
        //have too keep looking!! For now this piece of .... will do

        terminal.stderr.on('data', function (data) {

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

    inputData: function (sessionId, input) {
        this.sendOutput[sessionId] = true;

        if(/print/.test(input) || /plot/.test(input)){
            this.bachChannel(sessionId, 'use built in tool for graphics');
            return
        }

        var sessId = sessionId.replace('-', '');
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


            input = input.replace(/\s+/g, '');
            this.userFunctionInput[sessionId].push(input);

            fs.writeFile(sessId + this.currUserFunction[sessionId] + '.m', this.userFunctionInput[sessionId].join("\n"), function(err) {
                if(err) {
                    console.log(err);
                }
            });


            this.sessions[sessionId].console.stdin.write('source"' + sessId + this.currUserFunction[sessionId] + '.m' + '" \n');

            this.functionInput[sessionId] = false;
            this.userFunctionInput[sessionId] = [];
            this.currUserFunction[sessionId] = '';

            return
        }

        input = input.replace(/\s+\(/g, '(');

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


//execute: function (filename) {
//
//    //I KNOW!!!
//    //http://stackoverflow.com/questions/8389974/how-to-run-commands-via-nodejs-child-process
//    //do it this way
//    console.log(0);
//    var terminal = new exec('octave', { silent: true }, function(code, output) {
//        console.log('Exit code:', code);
//        console.log('Program output:', output);
//    });
//
//    console.log(1);
//    terminal.stdout.on('data', function (data) {
//        console.log(8888);
//        console.log('stdout: ' + data);
//    });
//
//    console.log(2);
//    terminal.on('exit', function (code) {
//        console.log(76786);
//        console.log('child process exited with code ' + code);
//    });
//
//    console.log(3);
//    terminal.stdin.write('2 + 3 \n');
//    terminal.stdin.write('4 + 9 \n');
//    console.log(4);
//
//    //this.output = exec('octave ' + filename, {'silent': true}).output;
//
//
//},
//handle: function(content){
//
//    //var now = new Date();
//    //
//    //var uniqueFilename = Math.floor(Math.random() * 10) + parseInt(now.getTime()).toString(36).toUpperCase();
//    //var filename = '/tmp/' + uniqueFilename + '.m';
//    //fs.writeFileSync(filename, content);
//    //this.execute(filename);
//    //fs.unlink(filename);
//}