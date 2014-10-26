var express = require('express');
var router = express.Router();
var octave = require('../model/octave');

router.get('/', function (req, res) {
    res.render('octave', {input: '', output: ''});
});

router.post('/', function (req, res) {

    octave.handle(req.body.input);

    res.render('octave', {input: req.body.input, output: octave.output});
});

module.exports = router;
