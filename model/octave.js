var sys = require('sys');
var exec = require('shelljs').exec;


var octave = {
    name: 'octave221',
    output: '',
    execute: function (filename) {
        this.output = exec('octave ' + filename, {'silent': true}).output;
    }

};

module.exports = octave;