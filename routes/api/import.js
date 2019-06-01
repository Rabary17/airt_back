var router = require('express').Router();
var mongoose = require('mongoose');
const fs = require('fs'); 
var Ticket = mongoose.model('Ticket');
var csv = require('fast-csv');

// return a list of tags
router.post('/', async function(req, res, next) {
    if (!req.body) {return res.status(400).send('No files were uploaded.');}

    var file = req.body.body.file;
    var filename = req.body.body.filename;
    var tickets = [];

    var fileToRead = new Buffer(file, 'base64');

    csv
    .fromString(fileToRead.toString(), {
        headers: true,
        ignoreEmpty: true
    })
    .on("data", function(data){
        data['_id'] = new mongoose.Types.ObjectId();
        tickets.push(data);
        var ticket = new Ticket(data);
        ticket.save().then(function(author){
            //    if (err) {throw err};
            console.log('icccciiiiiiiiiiiiiiiii',)
        })
    })
    .on("end", function(){
        console.log(tickets)
       var ticket = new Ticket();
       ticket.save().then(function(author){
        //    if (err) {throw err};
           console.log('icccciiiiiiiiiiiiiiiii', tickets.length)
           res.send(tickets.length + ' authors have been successfully uploaded.');
        })
    });
});

module.exports = router;
