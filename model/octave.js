var fs = require('fs');
var exec = require('shelljs').exec;


var octave = {
    name: 'octave221',
    output: '',
    execute: function (filename) {

        //I KNOW!!!
        //http://stackoverflow.com/questions/8389974/how-to-run-commands-via-nodejs-child-process
        //do it this way
        console.log(0);
        var terminal = new exec('octave', { silent: true }, function(code, output) {
            console.log('Exit code:', code);
            console.log('Program output:', output);
        });

        console.log(1);
        terminal.stdout.on('data', function (data) {
            console.log(8888);
            console.log('stdout: ' + data);
        });

        console.log(2);
        terminal.on('exit', function (code) {
            console.log(76786);
            console.log('child process exited with code ' + code);
        });

        console.log(3);
        terminal.stdin.write('2 + 3 \n');
        terminal.stdin.write('4 + 9 \n');
        console.log(4);

        //this.output = exec('octave ' + filename, {'silent': true}).output;


    },
    handle: function(content){

        //var now = new Date();
        //
        //var uniqueFilename = Math.floor(Math.random() * 10) + parseInt(now.getTime()).toString(36).toUpperCase();
        //var filename = '/tmp/' + uniqueFilename + '.m';
        //fs.writeFileSync(filename, content);
        //this.execute(filename);
        //fs.unlink(filename);
    }


};

module.exports = octave;