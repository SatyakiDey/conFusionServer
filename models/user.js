var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    /*username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
    },*/
    admin:{
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose); //"passport-local-mongoose" plugin adds username and password in the schema.

module.exports = mongoose.model('User',User);