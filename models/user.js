var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin:{
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose); //"passport-local-mongoose" plugin adds username and password in the schema.

module.exports = mongoose.model('User',User);