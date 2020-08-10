var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/',authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
  //res.send('respond with a resource');
  User.find({})
  .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
  },
  (err) => next(err))
  .catch((err) => next(err));
});


router.post('/signup', (req, res, next) => {
  //User.findOne({username: req.body.username}) //looking in the database, if the user username and password already exists.
  User.register(new User({username: req.body.username}), //".register()" is a method provided by "passport-local-mongoose" to signup a new user using the json object having username and password in request body. The password is hashed(encrypted) using a salt key.
  req.body.password, (err,user) => { //this does not return a promise, instead it's 3rd parameter is a callback function.
  //.then((user) => {
    //if(user != null) { //if it does then an error is thrown
      if(err) {
      /*var err = new Error('User ' + req.body.username + ' already exists!');
      err.status = 403;
      next(err);*/
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err:err});
    }
    else {
      /*return User.create({
        username: req.body.username,
        password: req.body.password});*/
        if(req.body.firstname)
          user.firstname = req.body.firstname;
        if(req.body.lastname)
          user.lastname = req.body.lastname;
        user.save((err, user) => {
          if(err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err:err});
            return ; 
          }
          passport.authenticate('local')(req, res,() => { //"passport" middleware uses a method called "authenticate()" which checks the validity of the client credentials. If it is already present in the database, an error is thrown by "passport" itself, otherwise registration is completed successfully.
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        });
        });
    }
  });
  /*.then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful!', user: user});
  }, (err) => next(err))
  .catch((err) => next(err));*/
});

router.post('/login', passport.authenticate('local'), (req,res,next) => { //Unlike the earlier case where we were including credentials in the authorization header, here we expect that to be included in the body of the incoming post message.The second parameter of the "post()" method of "passport-local" checks the validity of the client credentials using the Local startegy that we declared. An appropriate error is thrown by "passport" itself.

 // So when the router post comes in on the login endpoint, we will first call the passport authenticate local. If this is successful then this will come in and the next function that follows will be executed. If there is any error in the authentication, this passport authenticate local will automatically send back a reply to the client about the failure of the authentication. So that is already taken care of

  /*if(!req.session.user){  
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
  }*/
 
  //on successful matching of the credentials

  //on successful authentication of the user using "passpost.authenticate('local')" , request message of the client contains the "user" parameter, which contains the ObjectID(named as _id) that is assigned to it when it is stored in the database. This id is used as a payload for JWT.

  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true,token: token, status: 'You have successfully logged in'});

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
