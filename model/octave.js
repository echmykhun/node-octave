var fs = require('fs');
var exec = require('shelljs').exec;


var octave = {
    name: 'octave221',
    output: '',
    execute: function (filename) {
        this.output = exec('octave ' + filename, {'silent': true}).output;
    },
    handle: function(content){

        var now = new Date();

        var uniqueFilename = Math.floor(Math.random() * 10) + parseInt(now.getTime()).toString(36).toUpperCase();
        var filename = '/tmp/' + uniqueFilename + '.m';
        fs.writeFileSync(filename, content);
        this.execute(filename);
        fs.unlink(filename);
    }


};

module.exports = octave;