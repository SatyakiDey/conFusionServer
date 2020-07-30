var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');

//const Dishes = require('./models/dishes');
const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then((db) => {
  console.log('Connected to the server');
},
(err) => console.log(err));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//"app.use" statements are executed as they are declared in the code.
//"Middlewares" are executed in the application as their "app.use" statements are declared, chronologically.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

function auth(req, res, next){
  console.log(req.headers);

  var authHeader = req.headers.authorization; //storing the authorization of the client request headers.

  if(!authHeader){//checking if the headers of the client request doesn't contain authorization
    var err = new Error('You are not authenticated!');

    res.setHeader('WWW-Authenticate','Basic');
    err.status= 401;
    return next(err); //returing the an error and passing it to the default error handling middleware at the end of this file.
  }
  //executed if the headers of the client request contains authorization with user name and password encoded in base64.
  var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':');
  //spliting the authorization-header and accessing the second array-element of the ".split()" operation(which is the username and password encoded in base64) into buffer. Thereafter the buffer is converetd into a String. The string should be as follows "admin:password". It is then converted into an array of two elements using ".splt(':')" giving us the username and password.

  var username = auth[0];
  var password = auth[1];

  if(username === 'admin' && password === 'password')
  {
    next(); //if the username and password matches, then the access to conscequent middlewares is allowed using "next()"
  }
  else{
    var err = new Error('You are not authenticated!');

    res.setHeader('WWW-Authenticate','Basic');
    err.status= 401;
    return next(err);
  }
}

app.use(auth); //usign this middleware before any other resource accessing middleware results in this being executed first.

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
