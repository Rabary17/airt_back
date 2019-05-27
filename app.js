var http = require('http'),
    path = require('path'),
    methods = require('methods'),
    express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    passport = require('passport'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose');

var isProduction = process.env.NODE_ENV === 'production';
const listEndpoints = require('express-list-endpoints')
// Create global app object
var app = express();

app.use(cors());
// Enable CORS from client-side
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '5mb'}));

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'airt1l', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));
app.set('views', './dist/browser');
if (!isProduction) {
  app.use(errorhandler());
}

if(isProduction){
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect('mongodb://localhost/bdd_airtel');
  mongoose.set('debug', true);
}

require('./models/User');
require('./models/Ticket');
require('./models/Comment');
require('./models/Client');
require('./models/Event');
require('./config/passport');
app.use(require('./routes'));

var Event = mongoose.model('Event');

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});


var dir = path.join(__dirname, './public/uploads');

app.use(express.static(dir));

// FOR MAILING


// finally, let's start our server...
var server = app.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
  console.log(listEndpoints(app));
});



const io = require('socket.io')(server);

// tableau id des utilisateurs connécté
let userConnected = {};

// Listening des connexions des utilisateurs
io.on('connection', function (socket) {
  console.log('connnnnnnnnnnnnnnnected');
  // Gestion des utilisateurs
  socket.on('message', function(res){
    if (res.tag === 'userConnected') {
      console.log(res.message)
    }

    if ( res.tag === 'userDisconnected') {
      console.log(res.message)
    }

    if (res.tag === 'Ticket') {
      console.log('messsssssssssssssssssss', res.message);
      let event = new Event({
        categorie: 'ticket',
        message: JSON.stringify(res.message)
      });

      console.log('event.message', event)
      event.save().then(function(result) {
        io.sockets.emit("message", JSON.parse(result.message));
        console.log('***************************', JSON.parse(result.message));
        // res.ticket = result;
      }, error => {
        console.log(error)
      })
    }

  })
});