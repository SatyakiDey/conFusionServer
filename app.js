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
app.use(cookieParser('12345-67890-09876-54321')); //signing the cookie for security

function auth(req, res, next){
  console.log(req.signedCookies);

  if(!req.signedCookies.user){ //checking for the presence of signed cookie named "user" in the request from the client. 
    var authHeader = req.headers.authorization; //storing the authorization of the client request headers.

    //if the signed cookie is not found, it checks if the headers of the client request doesn't contain authorization
      if(!authHeader){
      var err = new Error('You are not authenticated!');

      res.setHeader('WWW-Authenticate','Basic');
      err.status= 401;
      return next(err); //returing the an error and passing it to the default error handling middleware at the end of this file.
      }

    //efollowing part is executed if the headers of the client request contains authorization with user name and password encoded in base64.

    //at this point, it is established that the signed cookie is not found but the client has entered some username and password that is contained in "authHeader". At this junture, we can say that the client has just logged in, or just started a new session.

    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    //spliting the authorization-header and accessing the second array-element of the ".split()" operation(which is the username and password encoded in base64) into buffer. Thereafter the buffer is converetd into a String. The string should be as follows "admin:password". It is then converted into an array of two elements using ".splt(':')" giving us the username and password.

    var username = auth[0];
    var password = auth[1];

    if(username === 'admin' && password === 'password') //checking if the extracted username and password is valid.
    {
      //if it is valid, we set the name of the cookie as "user" , with the name of the client which is "admin" and marking it as a signed cookie.
      res.cookie('user','admin',{ signed : true}); 
      next(); //if the username and password matches, then the access to conscequent middlewares is allowed using "next()"
    }
    else{ //if the name and password doesn't match then an error is thrown.
      var err = new Error('You are not authenticated!');

      res.setHeader('WWW-Authenticate','Basic');
      err.status= 401;
      return next(err);
    }
  }

  else{// if the cookie contained in the client request has a signed cookie named "user"

    if(req.signedCookies.user === 'admin'){ 
      
      //if the signed cookie named "user", contained in the client request has a parameter named "admin", it means the session has been already started and the client has already logged in.

      //in such case the execution is forwarded to the conscequent middlewares.
      next();
    }
    else{
      var err = new Error('You are not authenticated!');

      res.setHeader('WWW-Authenticate','Basic');
      err.status= 401;
      return next(err);
    }
  }
}

app.use(auth); //using this middleware before any other resource accessing middleware results in this being executed first.

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
