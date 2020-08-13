const express = require ('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443', 'http://localhost:4200']; //list of origin websites from where get,put,post,delete requests will be accepted.

var corsOptionDelegate = (req, callback) => {
    var corsOptions; 

    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true}; //if the request is from the 'whitelist' array, then set origin to true, which means that the requests form those websites will be accepted. 'Allow-Control-Access-Origin' in the response header will be present with the the origin website from where the request was sent.
    }
    else{
        corsOptions = { origin: false}; //else set them to false, i.e, 'Allow-Control-Access-Origin' in the response header will not be present.
    }
    callback(null, corsOptions);
};

exports.cors = cors(); //will be used on all get requests from any origin website
exports.corsWithOptions = cors(corsOptionDelegate); //will be used on put,post,delete request to check if the request is from allowed origin website 