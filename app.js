var createError = require('http-errors');
var express = require('express');
var path = require('path');
//var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);//file store middleware for storing using tracking info in a file
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');

const mongoose = require('mongoose');

//const Dishes = require('./models/dishes');
const url = config.mongourl;
const connect = mongoose.connect(url);

connect.then((db) => {
  console.log('Connected to the server');
},
(err) => console.log(err));

var app = express();

app.all('*', (req, res, next) => { //'*' denotes for all incoming request to the server
  if(req.secure){ //if the request is through https the 'secure' flag is set
    return next(); //the follwoing middlewares are executed
  }
  else{ //if the request is form http
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url); //redirecting the request to the port serving https requests. Hostname and URI is already present in the request.
    //Status code 307 here represents that the target resource resides temporarily under different URL. And the user agent must not change the request method if it reforms in automatic redirection to that URL. So, I'll be expecting user agent to retry with the same method that they have used for the original end point.
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//"app.use" statements are executed as they are declared in the code.
//"Middlewares" are executed in the application as their "app.use" statements are declared, chronologically.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321')); //signing the cookie for security

/*app.use(session({
  name : 'session-id',
  secret : '12345-67890-09876-54321',
  saveUninitialized : false,
  resave : false,
  store : new FileStore()//storing permanently into the file(in the auto generated "session" folder), which will be retrieved as and when needed and added to the request from the client.
}));*/

// When you log in, a call to the passport.authenticate(local) will be done, when this is done at the login stage, the passport authenticate local will automatically add the user property to the request message. So, it'll add req.user and then, the "passport.session()" that we have done will automatically serialize that user information and then store it in the session. So, and subsequently, whenever a incoming request comes in from the client side with the session cookie already in place, then this will automatically load the "req.user" onto the incoming request. So, that is how the passport session itself is organized

app.use(passport.initialize());//initialises the authentication module
//app.use(passport.session());//alters the request object and changes the "user" value that is currenty the session ID into the true deserialized user object.

app.use('/', indexRouter);
app.use('/users', usersRouter);

/*function auth(req, res, next){

  //if(!req.session.user){ //checking for the presence of "user" parameter in the express-session generated cookie in the request from the client. 
  if(!req.user){
    //var authHeader = req.headers.authorization; //storing the authorization of the client request headers.
    var err = new Error('You are not authenticated!'); //absence of "user" parameter in the express-session generated cookie in the client request is indicative of the fact that the client is trying to access the resources without logging in.

    //if the session-generated cookie is not found, it checks if the headers of the client request doesn't contain authorization
      //if(!authHeader){
      //res.setHeader('WWW-Authenticate','Basic');
      err.status= 403;
      return next(err); //returing the an error and passing it to the default error handling middleware at the end of this file.
      //}

    //following part is executed if the headers of the client request contains authorization with user name and password encoded in base64.

    //at this point, it is established that the session-generated cookie is not found but the client has entered some username and password that is contained in "authHeader". At this junture, we can say that the client has just logged in, or just started a new session.

    /*var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    //spliting the authorization-header and accessing the second array-element of the ".split()" operation(which is the username and password encoded in base64) into buffer. Thereafter the buffer is converetd into a String. The string should be as follows "admin:password". It is then converted into an array of two elements using ".splt(':')" giving us the username and password.

    var username = auth[0];
    var password = auth[1];

    if(username === 'admin' && password === 'password') //checking if the extracted username and password is valid.
    {
      //if it is valid, we set the name of the cookie as "user" , with the name of the client which is "admin" .
      //res.cookie('user','admin',{ signed : true}); 
      //setting the "user" parameter of the cookie generated by express-session to "admin".
      req.session.user = 'admin';
      next(); //if the username and password matches, then the access to conscequent middlewares is allowed using "next()"
    }
    else{ //if the name and password doesn't match then an error is thrown.
      var err = new Error('You are not authenticated!');

      res.setHeader('WWW-Authenticate','Basic');
      err.status= 401;
      return next(err);
    }
  }

  else{// if the cookie contained in the client request has a session cookie with parameter "user"

    //if(req.session.user === 'authenticated'){ //if the "user" parameter in session-cookie contained in the client request has the value as "authenticated"
      
      //if the session-generated cookie named "session-id", contained in the client request has a parameter "user" named as "admin", it means the session has been already started and the client has already logged in.

      //in such case the execution is forwarded to the conscequent middlewares.
      next();
    }
    /*else{
      var err = new Error('You are not authenticated!');
      //res.setHeader('WWW-Authenticate','Basic');
      err.status= 403;
      return next(err);
    }
  }
}

app.use(auth); //using this middleware before any other resource accessing middleware results in this being executed first.*/

app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);


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
