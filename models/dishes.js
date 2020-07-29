const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

//connecting to the mongoose-currency middleware.
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency; //Setting it as a schema type

const commentSchema = new Schema({
    rating : {
        type: Number,
        min:1,
        max:5,
        required:true
    },
    comment : {
        type: String,
        required: true,
    },
    author : {
        type: String,
        required: true
    },
},
{
    timestamps: true
});

const dishSchema = new Schema({
    name: {
        type: String,
        required:true,
        unique:true
    },
    description :{
        type:String,
        required:true
    },
    image :{
        type: String,
        required: true,
    },
    category :{
        type: String,
        required: true,
    },
    label :{
        type: String,
        default: '', //it no value is set the default value is ''
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false,
    },
    comments:[ commentSchema ]
},
{
    timestamps: true //'timestamps' is added to get the timestamp for each document following this schema, when it was created and everytime it was updated
});

var Dishes = mongoose.model('Dish',dishSchema);
module.exports = Dishes;