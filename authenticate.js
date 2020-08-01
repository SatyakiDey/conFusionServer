//we're going to use this file to store the authentication strategies that we will configure

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;//The passport local module exports a strategy that we can use for our application
var User = require('./models/user');

exports.local = passport.use(new LocalStrategy(User.authenticate()));//The new LocalStrategy is where the functions that are supported by the "passport-local-mongoose" comes to our help.The local strategy will need to be supplied with the verify function. Inside this function we will verify the user. This verify function will be called with the username and password that passport will extract from our incoming request body in form of JSON which will aready be parsed by body-parser.Since we are using passport mongoose plugin, the mongoose plugin itself adds this function called user.authenticate to the User schema and the model.If you are not using "passport-local-mongoose" when you set up a mongoose plugin that we have done, if you're not using that, then you need to write your own user authentication function here,the one that is supplied by the passport-local-mongoose module is more comprehensive

// 'The passport.authenticate()' will mount the req.user or the "user" property to the request message and so that user information will be serialized and deserialized. The two functions, the "serializeUser" and "deserializeUser" are provided on the user schema and model by the use of the "passport-local-mongoose" plugin. So this will take care of whatever it is required for our support for sessions in passport.

//serializing means adding an unique identification to the "user" instance of the client request, through which a session can be implemented. Deserializing means finding the right client from the database using the unique "user" instance in the cokkie of the client request.

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());