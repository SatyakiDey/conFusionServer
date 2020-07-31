var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username}) //looking in the database, if the user username and pass already exists.
  .then((user) => {
    if(user != null) { //if it does then an error is thrown
      var err = new Error('User ' + req.body.username + ' already exists!');
      err.status = 403;
      next(err);
    }
    else {
      return User.create({
        username: req.body.username,
        password: req.body.password});
    }
  })
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful!', user: user});
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.post('/login', (req,res,next) => {

  if(!req.session.user){  
    var authHeader = req.headers.authorization; 

      if(!authHeader){
      var err = new Error('You are not authenticated!');

      res.setHeader('WWW-Authenticate','Basic');
      err.status= 401;
      return next(err); 
      }
      //extracting username and password from authorization-header in the client request
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

    var username = auth[0];
    var password = auth[1];

    User.findOne({username:username}) //finding the record from the database
    .then((user) =>{

      if(user == null) { //username does not exist
        var err = new Error('User '+ username + ' does not exist');
        err.status= 401;
        return next(err);
      }
      else if(user.password!= password){//password is not correct
        var err = new Error('Your password is incorrect');
        err.status= 401;
        return next(err);
      }
      else if(username === username && password === password) { //when they bothe match

      req.session.user = 'authenticated'; //setting the "user" parameter of the cookie in client req to "authenticated"
      res.statusCode = 200;
      res.setHeader('Content-type','text/plain');
      res.end('You are authenticated!');
    }
    })
    .catch((err) => next(err));
  }
  else{
    res.statusCode = 200;
    res.setHeader('Content-type','text/plain');
    res.end('You are already authenticated!');
  }
});

router.get('/logout',(req,res,next) => {
  if(req.session){
    req.session.destroy();//destroying the current user session
    res.clearCookie('session-id'); //clearing all the cookies with client login information
    res.redirect('/');//redirecting to the home page
  }
  else{
    var err = new Error('You are not logged in');
    err.status = 403;
    next(err);
  }
})

module.exports = router;
