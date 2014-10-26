var express = require('express');
var router = express.Router();
var octave  = require('../model/octave');

router.get('/', function(req, res) {
    res.render('octave', { input: '', output: '' });
});

router.post('/', function(req, res) {
    console.log(req.query.input);
    octave.execute('/home/eugen/doless.m');
    console.log(octave.output);
    res.render('octave', { input: '', output: octave.output });
});

module.exports = router;
