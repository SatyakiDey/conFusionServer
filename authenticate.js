//we're going to use this file to store the authentication strategies that we will configure

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;//The passport local module exports a strategy that we can use for our application
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); //used to create, sign and verify tokens.

var config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));//The new LocalStrategy is where the functions that are supported by the "passport-local-mongoose" comes to our help.The local strategy will need to be supplied with the verify function. Inside this function we will verify the user. This verify function will be called with the username and password that passport will extract from our incoming request body in form of JSON which will aready be parsed by body-parser.Since we are using passport mongoose plugin, the mongoose plugin itself adds this function called user.authenticate to the User schema and the model.If you are not using "passport-local-mongoose" when you set up a mongoose plugin that we have done, if you're not using that, then you need to write your own user authentication function here,the one that is supplied by the passport-local-mongoose module is more comprehensive

// 'The passport.authenticate()' will mount the req.user or the "user" property to the request message and so that user information will be serialized and deserialized. The two functions, the "serializeUser" and "deserializeUser" are provided on the user schema and model by the use of the "passport-local-mongoose" plugin. So this will take care of whatever it is required for our support for sessions in passport.

//serializing means adding an unique identification to the "user" instance of the client request, through which a session can be implemented. Deserializing means finding the right client from the database using the unique "user" instance in the cokkie of the client request.

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) { //getting the payload that would be used to encode the JWT along with oeht parameters.
    return jwt.sign(user, config.secretKey,
         {expiresIn:3600});
};
 
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //used to tell the authenticate function form where the token will be extracted in the client request.
opts.secretOrKey = config.secretKey; //configuring the secret key.

exports.jwtPassport = passport.use(new JwtStrategy(opts, //the "verify" function is used to authenticate the user,takes in the 'opts' object(which tells it from where to get the JWT), this function then decodes the JWT exposing the actual payload(which in this case is the "objectId" of user record in the database).
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => { //The retireved obejctID in the previous step is used to to find the user from the database.
            if(err){
                return done(err, false); //setting the first parameter of "done()" to the err value and user parameter to null, indicating that an error occured. The appropriate error is then displayed by the '.authenticate()' method.
            }
            else if(user){ ////setting the second parameter of "done()" to the fetched user object and first parameter to null, indicating that the appropriate user was found.
                return done(null, user);
            }
            else{
                return done(null,false);
            }
        })
    }));

    exports.verifyUser = passport.authenticate('jwt', {session:false}); //exporting this as function will help us to authenticate the user whenever we want in the "routes" module.

    exports.verifyAdmin = function(req,res,next) {
        if(req.user.admin){
             next();
        }
        else
        {
        err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);       
        }
    }
